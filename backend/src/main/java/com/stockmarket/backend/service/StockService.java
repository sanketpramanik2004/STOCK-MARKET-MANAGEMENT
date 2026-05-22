package com.stockmarket.backend.service;

import com.stockmarket.backend.dto.LiveStockQuote;
import com.stockmarket.backend.entity.Stock;
import com.stockmarket.backend.repository.StockRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class StockService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private AlphaVantageService alphaVantageService;

    public String addSampleStocks() {

        boolean alreadyHadStocks = stockRepository.count() > 0;

        saveOrUpdateStock("TCS", "Tata Consultancy Services", "3800", "3720", "UP", "IT", 2100000L);
        saveOrUpdateStock("INFY", "Infosys", "1450", "1466", "DOWN", "IT", 4800000L);
        saveOrUpdateStock("RELIANCE", "Reliance Industries", "2900", "2847", "UP", "Energy", 6400000L);
        saveOrUpdateStock("HDFCBANK", "HDFC Bank", "1684", "1671", "UP", "Banking", 8700000L);
        saveOrUpdateStock("TATAMOTORS", "Tata Motors", "968", "937", "UP", "Auto", 9200000L);
        saveOrUpdateStock("ASIANPAINT", "Asian Paints", "2914", "2933", "DOWN", "Consumer", 1300000L);

        return alreadyHadStocks ? "Sample Stocks Refreshed Successfully" : "Sample Stocks Added Successfully";
    }

    public List<Stock> getAllStocks() {

        return stockRepository.findAll();
    }

    public List<Stock> searchStocks(String query) {

        return stockRepository.findByStockSymbolContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(query, query);
    }

    public List<LiveStockQuote> getLiveStocks() {

        List<LiveStockQuote> liveStockQuotes = new ArrayList<>();

        for (Stock stock : stockRepository.findAll()) {
            liveStockQuotes.add(alphaVantageService.getGlobalQuote(stock).orElse(toDatabaseQuote(stock)));
        }

        return liveStockQuotes;
    }

    public LiveStockQuote getLiveStockBySymbol(String symbol) {

        Stock stock = stockRepository.findByStockSymbol(symbol.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Stock not found"));

        return alphaVantageService.getGlobalQuote(stock).orElse(toDatabaseQuote(stock));
    }

    private LiveStockQuote toDatabaseQuote(Stock stock) {

        BigDecimal previousClose = stock.getPreviousClose() == null ? stock.getCurrentPrice() : stock.getPreviousClose();
        BigDecimal change = stock.getCurrentPrice().subtract(previousClose);
        BigDecimal changePercentage = BigDecimal.ZERO;

        if (previousClose.compareTo(BigDecimal.ZERO) != 0) {
            changePercentage = change.multiply(BigDecimal.valueOf(100)).divide(previousClose, 2, RoundingMode.HALF_UP);
        }

        LiveStockQuote quote = new LiveStockQuote();
        quote.setStockSymbol(stock.getStockSymbol());
        quote.setCompanyName(stock.getCompanyName());
        quote.setCurrentPrice(stock.getCurrentPrice());
        quote.setPreviousClose(previousClose);
        quote.setChange(change);
        quote.setChangePercentage(changePercentage);
        quote.setVolume(stock.getVolume());
        quote.setLatestTradingDay("Database fallback");
        quote.setMarketTrend(changePercentage.compareTo(BigDecimal.ZERO) >= 0 ? "UP" : "DOWN");
        quote.setSector(stock.getSector());
        quote.setSource("DATABASE");

        return quote;
    }

    private void saveOrUpdateStock(String symbol, String companyName, String currentPrice, String previousClose, String trend, String sector, Long volume) {

        Stock stock = stockRepository.findByStockSymbol(symbol).orElse(new Stock());

        stock.setStockSymbol(symbol);
        stock.setCompanyName(companyName);
        stock.setCurrentPrice(new BigDecimal(currentPrice));
        stock.setPreviousClose(new BigDecimal(previousClose));
        stock.setMarketTrend(trend);
        stock.setSector(sector);
        stock.setVolume(volume);

        stockRepository.save(stock);
    }
}
