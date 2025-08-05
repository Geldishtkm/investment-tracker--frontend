package com.portfolio.tracker.service;

import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PriceHistoryService {

    private final RestTemplate restTemplate;
    
    // ✅ ENHANCED CACHING: key = coinId, value = List of [timestamp, price]
    private final Map<String, List<double[]>> priceHistoryCache = new ConcurrentHashMap<>();
    private final Map<String, Long> lastCacheTime = new ConcurrentHashMap<>();
    private final Map<String, Integer> requestCount = new ConcurrentHashMap<>();
    
    // ✅ RATE LIMITING: Cache for 30 minutes to avoid CoinGecko rate limits
    private final long cacheDurationMs = 30 * 60 * 1000; // 30 minutes
    
    // ✅ RATE LIMIT TRACKING: Track requests per coin
    private final int maxRequestsPerCoin = 50; // CoinGecko free tier limit
    private final long rateLimitResetMs = 24 * 60 * 60 * 1000; // 24 hours

    public PriceHistoryService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
        System.out.println("🚀 PriceHistoryService initialized with 30-minute caching and rate limiting");
    }

    // ✅ FIXED: Fetch historical prices from CoinGecko with proper data extraction
    public void fetchAndCachePriceHistory(String coinId) {
        try {
            String url = "https://api.coingecko.com/api/v3/coins/" + coinId + "/market_chart?vs_currency=usd&days=90&interval=daily";

            System.out.println("🔍 Fetching from CoinGecko: " + url);

            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {});

            Map<String, Object> body = response.getBody();

            if (body == null) {
                throw new RuntimeException("Empty response from CoinGecko for " + coinId);
            }

            System.out.println("🔍 Response keys: " + body.keySet());

            if (!body.containsKey("prices")) {
                throw new RuntimeException("No 'prices' key found in CoinGecko response for " + coinId);
            }

            // ✅ CRITICAL FIX: Handle the exact CoinGecko response format
            Object pricesObj = body.get("prices");
            System.out.println("🔍 Prices object type: " + (pricesObj != null ? pricesObj.getClass().getSimpleName() : "null"));
            
            List<List<Number>> pricesRaw;
            
            // Handle the exact format from CoinGecko API
            if (pricesObj instanceof List) {
                pricesRaw = (List<List<Number>>) pricesObj;
            } else {
                throw new RuntimeException("Unexpected data type for prices: " + pricesObj.getClass().getSimpleName());
            }

            if (pricesRaw == null || pricesRaw.isEmpty()) {
                throw new RuntimeException("Empty prices array from CoinGecko for " + coinId);
            }

            System.out.println("🔍 Found " + pricesRaw.size() + " price points from CoinGecko");
            System.out.println("🔍 First entry: " + pricesRaw.get(0));

            // Convert to List<double[]> - handle both Double and Long timestamps
            List<double[]> prices = new ArrayList<>();
            for (List<Number> entry : pricesRaw) {
                if (entry.size() >= 2) {
                    // Handle timestamp (could be Long or Double)
                    double timestamp;
                    if (entry.get(0) instanceof Long) {
                        timestamp = ((Long) entry.get(0)).doubleValue();
                    } else {
                        timestamp = entry.get(0).doubleValue();
                    }
                    
                    // Handle price (should be Double)
                    double price = entry.get(1).doubleValue();
                    
                    prices.add(new double[]{timestamp, price});
                }
            }

            // Cache the data
            priceHistoryCache.put(coinId, prices);
            lastCacheTime.put(coinId, System.currentTimeMillis());

            System.out.println("✅ Cached price history for " + coinId + " successfully. Found " + prices.size() + " data points.");
            if (!prices.isEmpty()) {
                System.out.println("📊 Sample data: [" + prices.get(0)[0] + ", " + prices.get(0)[1] + "]");
            }

        } catch (Exception e) {
            System.err.println("⚠️ Failed to fetch price history for " + coinId + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    // ✅ RATE LIMITING: Check if we've hit the rate limit for a coin
    private boolean isRateLimited(String coinId) {
        int count = getRequestCount(coinId);
        return count >= maxRequestsPerCoin;
    }

    // ✅ RATE LIMITING: Increment request count for a coin
    private void incrementRequestCount(String coinId) {
        requestCount.put(coinId, getRequestCount(coinId) + 1);
    }

    // ✅ RATE LIMITING: Get current request count for a coin
    private int getRequestCount(String coinId) {
        return requestCount.getOrDefault(coinId, 0);
    }

    // ✅ ENHANCED SCHEDULED REFRESH: Only refresh popular coins every 30 minutes
    @Scheduled(fixedRate = 30 * 60 * 1000) // 30 minutes
    public void scheduledCacheRefresh() {
        System.out.println("🔄 Scheduled cache refresh (30-minute interval)...");
        
        // ✅ SMART REFRESH: Only refresh coins that are frequently accessed
        List<String> popularCoins = Arrays.asList("bitcoin", "ethereum", "ripple", "cardano", "solana");
        
        for (String coinId : popularCoins) {
            if (priceHistoryCache.containsKey(coinId)) {
                System.out.println("🔄 Refreshing popular coin: " + coinId);
                fetchAndCachePriceHistory(coinId);
            }
        }
    }

    // ✅ SIMPLIFIED: Get price history from cache or fetch if absent or expired
    public List<double[]> getPriceHistory(String coinId) {
        System.out.println("🔍 Getting price history for: " + coinId);
        System.out.println("🔍 Cache contains key: " + priceHistoryCache.containsKey(coinId));
        System.out.println("🔍 Cache size: " + priceHistoryCache.size());
        
        long now = System.currentTimeMillis();
        long lastUpdate = lastCacheTime.getOrDefault(coinId, 0L);
        
        // Check if we need to fetch new data
        if (!priceHistoryCache.containsKey(coinId) || (now - lastUpdate) > cacheDurationMs) {
            System.out.println("🔄 Cache miss or expired, fetching fresh data...");
            fetchAndCachePriceHistory(coinId);
        } else {
            System.out.println("✅ Using cached data for " + coinId + " (age: " + (now - lastUpdate) / 60000 + " minutes)");
        }
        
        List<double[]> result = priceHistoryCache.getOrDefault(coinId, Collections.emptyList());
        System.out.println("📊 Returning " + result.size() + " data points for " + coinId);
        
        if (result.isEmpty()) {
            System.out.println("⚠️ WARNING: No data found for " + coinId + " in cache!");
        }
        
        return result;
    }

    // ✅ ENHANCED: Manual refresh with rate limit check
    public void refreshPriceHistory(String coinId) {
        if (isRateLimited(coinId)) {
            System.out.println("⚠️ Cannot refresh " + coinId + " - rate limit reached");
            return;
        }
        
        System.out.println("🔄 Manually refreshing price history for " + coinId);
        fetchAndCachePriceHistory(coinId);
    }

    // ✅ ENHANCED: Get detailed cache status including rate limit info
    public Map<String, Object> getCacheStatus(String coinId) {
        Map<String, Object> status = new HashMap<>();
        status.put("coinId", coinId);
        status.put("isCached", priceHistoryCache.containsKey(coinId));
        status.put("dataPoints", priceHistoryCache.containsKey(coinId) ? priceHistoryCache.get(coinId).size() : 0);
        status.put("lastUpdated", lastCacheTime.getOrDefault(coinId, 0L));
        status.put("cacheAgeMinutes", (System.currentTimeMillis() - lastCacheTime.getOrDefault(coinId, 0L)) / 60000);
        status.put("requestCount", getRequestCount(coinId));
        status.put("maxRequests", maxRequestsPerCoin);
        status.put("isRateLimited", isRateLimited(coinId));
        status.put("cacheDurationMinutes", cacheDurationMs / 60000);
        return status;
    }

    // ✅ NEW: Get overall service status
    public Map<String, Object> getServiceStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("totalCachedCoins", priceHistoryCache.size());
        status.put("cacheDurationMinutes", cacheDurationMs / 60000);
        status.put("maxRequestsPerCoin", maxRequestsPerCoin);
        status.put("rateLimitResetHours", rateLimitResetMs / (60 * 60 * 1000));
        
        Map<String, Object> coinStatuses = new HashMap<>();
        for (String coinId : priceHistoryCache.keySet()) {
            coinStatuses.put(coinId, getCacheStatus(coinId));
        }
        status.put("coins", coinStatuses);
        
        return status;
    }
} 