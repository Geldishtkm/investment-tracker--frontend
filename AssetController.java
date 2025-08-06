package com.portfolio.tracker.controller;

import com.portfolio.tracker.model.Asset;
import com.portfolio.tracker.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "http://localhost:5173")
public class AssetController {

    private final AssetService assetService;

    @Autowired
    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    // ✅ Add new asset
    @PostMapping
    public Asset addAsset(@RequestBody Asset asset) {
        return assetService.saveAsset(asset);
    }

    // ✅ Get all assets
    @GetMapping
    public List<Asset> getAllAssets() {
        return assetService.getAllAssets();
    }

    // ✅ Get total portfolio value
    @GetMapping("/total")
    public double getTotalValue() {
        return assetService.calculateTotalValue();
    }

    // ✅ Get ROI
    @GetMapping("/roi")
    public double getROI() {
        return assetService.calculateROI();
    }

    // ✅ Get Sharpe Ratio
    @GetMapping("/sharpe")
    public double getSharpeRatio() {
        return assetService.calculateSharpeRatio();
    }

    // ✅ Get Portfolio Metrics (combines multiple metrics)
    @GetMapping("/metrics")
    public Map<String, Object> getPortfolioMetrics() {
        List<Asset> assets = assetService.getAllAssets();
        double totalValue = assetService.calculateTotalValue();
        double totalInvestment = assets.stream()
                .mapToDouble(asset -> asset.getInitialInvestment() != null ? asset.getInitialInvestment() : (asset.getQuantity() * asset.getPricePerUnit()))
                .sum();
        double roi = totalValue - totalInvestment;
        double roiPercentage = totalInvestment > 0 ? roi / totalInvestment : 0;

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalValue", totalValue);
        metrics.put("totalInvestment", totalInvestment);
        metrics.put("roi", roi);
        metrics.put("roiPercentage", roiPercentage);
        metrics.put("sharpeRatio", assetService.calculateSharpeRatio());
        metrics.put("volatility", 0.15); // Placeholder
        metrics.put("assetCount", assets.size());
        metrics.put("topPerformer", assets.isEmpty() ? "N/A" : assets.get(0).getName());
        metrics.put("worstPerformer", assets.isEmpty() ? "N/A" : assets.get(assets.size() - 1).getName());

        return metrics;
    }

    // ✅ Get Asset Performance (individual asset metrics)
    @GetMapping("/performance")
    public List<Map<String, Object>> getAssetPerformance() {
        List<Asset> assets = assetService.getAllAssets();
        double totalValue = assetService.calculateTotalValue();

        return assets.stream().map(asset -> {
            double currentValue = asset.getQuantity() * asset.getPricePerUnit();
            double initialInvestment = asset.getInitialInvestment() != null ? asset.getInitialInvestment() : currentValue;
            double roi = currentValue - initialInvestment;
            double roiPercentage = initialInvestment > 0 ? roi / initialInvestment : 0;
            double weight = totalValue > 0 ? (currentValue / totalValue) * 100 : 0;

            Map<String, Object> performance = new HashMap<>();
            performance.put("id", asset.getId());
            performance.put("name", asset.getName());
            performance.put("currentValue", currentValue);
            performance.put("initialInvestment", initialInvestment);
            performance.put("roi", roi);
            performance.put("roiPercentage", roiPercentage);
            performance.put("weight", weight);

            return performance;
        }).collect(Collectors.toList());
    }

    // ✅ Get Risk Metrics
    @GetMapping("/risk")
    public Map<String, Object> getRiskMetrics() {
        Map<String, Object> riskMetrics = new HashMap<>();
        riskMetrics.put("sharpeRatio", assetService.calculateSharpeRatio());
        riskMetrics.put("volatility", 0.15); // Placeholder
        riskMetrics.put("maxDrawdown", -0.08); // Placeholder
        riskMetrics.put("beta", 1.1); // Placeholder
        riskMetrics.put("diversificationScore", 7.5); // Placeholder

        return riskMetrics;
    }

    // ✅ Update one asset's price
    @PutMapping("/{id}/update-price")
    public Asset updateAssetWithCurrentPrice(@PathVariable Long id) {
        Asset asset = assetService.getAssetById(id);
        if (asset != null) {
            String coinId = asset.getName().toLowerCase().replaceAll("\\s+", "");
            double currentPrice = cryptoPriceService.getCryptoPriceInUSD(coinId);
            asset.setPricePerUnit(currentPrice);
            return assetService.saveAsset(asset);
        }
        throw new RuntimeException("Asset not found with id: " + id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAsset(@PathVariable Long id) {
        assetService.deleteAssetById(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Get all assets with current crypto prices
    @GetMapping("/with-prices")
    public List<Map<String, Object>> getAllAssetsWithPrices() {
        List<Asset> assets = assetService.getAllAssets();
        return assets.stream().map(asset -> {
            Map<String, Object> assetWithPrice = new HashMap<>();
            assetWithPrice.put("id", asset.getId());
            assetWithPrice.put("name", asset.getName());
            assetWithPrice.put("quantity", asset.getQuantity());
            assetWithPrice.put("pricePerUnit", asset.getPricePerUnit());
            try {
                String coinId = asset.getName().toLowerCase().replaceAll("\\s+", "");
                double currentPrice = cryptoPriceService.getCryptoPriceInUSD(coinId);
                assetWithPrice.put("currentPrice", currentPrice);
            } catch (Exception e) {
                assetWithPrice.put("currentPrice", null);
            }
            return assetWithPrice;
        }).collect(Collectors.toList());
    }
} 