package com.portfolio.tracker.controller;

import com.portfolio.tracker.service.PriceHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/price-history")
@CrossOrigin(origins = "*") // Allow frontend to access
public class PriceHistoryController {

    private final PriceHistoryService priceHistoryService;

    @Autowired
    public PriceHistoryController(PriceHistoryService priceHistoryService) {
        this.priceHistoryService = priceHistoryService;
    }

    @GetMapping("/{coinId}")
    public List<double[]> getPriceHistory(@PathVariable String coinId) {
        System.out.println("🔍 Frontend requested price history for: " + coinId);
        List<double[]> result = priceHistoryService.getPriceHistory(coinId);
        System.out.println("📊 Returning " + result.size() + " data points to frontend");
        
        // Debug: show first few data points
        if (!result.isEmpty()) {
            System.out.println("📊 Sample data: " + result.subList(0, Math.min(3, result.size())));
        }
        
        return result;
    }

    // ✅ Debug endpoint to check cache status
    @GetMapping("/debug/{coinId}")
    public Map<String, Object> getDebugInfo(@PathVariable String coinId) {
        System.out.println("🔍 Debug request for: " + coinId);
        return priceHistoryService.getCacheStatus(coinId);
    }

    // ✅ Force refresh endpoint
    @PostMapping("/refresh/{coinId}")
    public Map<String, Object> refreshPriceHistory(@PathVariable String coinId) {
        System.out.println("🔄 Force refresh requested for: " + coinId);
        priceHistoryService.refreshPriceHistory(coinId);
        return Map.of(
            "message", "Price history refreshed for " + coinId,
            "coinId", coinId,
            "status", "success"
        );
    }

    // ✅ Health check endpoint
    @GetMapping("/health")
    public Map<String, Object> healthCheck() {
        return Map.of(
            "status", "OK",
            "message", "Price History API is running",
            "timestamp", System.currentTimeMillis()
        );
    }

    // ✅ Service status endpoint with caching and rate limit info
    @GetMapping("/status")
    public Map<String, Object> getServiceStatus() {
        return priceHistoryService.getServiceStatus();
    }

    // ✅ Test endpoint to manually trigger fetch and see what happens
    @GetMapping("/test/{coinId}")
    public Map<String, Object> testFetch(@PathVariable String coinId) {
        System.out.println("🧪 Testing fetch for: " + coinId);
        
        try {
            // Force fetch from CoinGecko
            priceHistoryService.fetchAndCachePriceHistory(coinId);
            
            // Get the cached data
            List<double[]> data = priceHistoryService.getPriceHistory(coinId);
            
            return Map.of(
                "coinId", coinId,
                "success", true,
                "dataPoints", data.size(),
                "sampleData", data.isEmpty() ? "No data" : data.get(0),
                "message", "Data fetched and cached successfully"
            );
        } catch (Exception e) {
            return Map.of(
                "coinId", coinId,
                "success", false,
                "error", e.getMessage(),
                "message", "Failed to fetch data"
            );
        }
    }


} 