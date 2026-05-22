package com.stockmarket.backend.service;

import com.stockmarket.backend.entity.Stock;
import com.stockmarket.backend.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class MarketService {

    @Autowired
    private StockRepository stockRepository;

    public Map<String, Object> getMarketAnalysis() {

        List<Stock> stocks = stockRepository.findAll();
        List<Map<String, Object>> movers = new ArrayList<>();
        int gainers = 0;

        for (Stock stock : stocks) {
            BigDecimal change = calculateChange(stock);
            if (change.compareTo(BigDecimal.ZERO) >= 0) {
                gainers++;
            }

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("stockSymbol", stock.getStockSymbol());
            row.put("companyName", stock.getCompanyName());
            row.put("currentPrice", stock.getCurrentPrice());
            row.put("changePercentage", change);
            row.put("marketTrend", stock.getMarketTrend());
            row.put("sector", stock.getSector());
            row.put("volume", stock.getVolume());
            movers.add(row);
        }

        movers.sort((left, right) -> ((BigDecimal) right.get("changePercentage")).compareTo((BigDecimal) left.get("changePercentage")));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalStocks", stocks.size());
        response.put("gainers", gainers);
        response.put("losers", stocks.size() - gainers);
        response.put("marketMood", gainers >= stocks.size() / 2.0 ? "BULLISH" : "BEARISH");
        response.put("movers", movers);

        return response;
    }

    private BigDecimal calculateChange(Stock stock) {

        if (stock.getPreviousClose() == null || stock.getPreviousClose().compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        return stock.getCurrentPrice()
                .subtract(stock.getPreviousClose())
                .multiply(BigDecimal.valueOf(100))
                .divide(stock.getPreviousClose(), 2, RoundingMode.HALF_UP);
    }
}
