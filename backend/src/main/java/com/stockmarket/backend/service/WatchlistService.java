package com.stockmarket.backend.service;

import com.stockmarket.backend.dto.WatchlistRequest;
import com.stockmarket.backend.entity.Stock;
import com.stockmarket.backend.entity.WatchlistItem;
import com.stockmarket.backend.repository.StockRepository;
import com.stockmarket.backend.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private StockRepository stockRepository;

    public List<WatchlistItem> getWatchlist(String email) {

        return watchlistRepository.findByUserEmail(email);
    }

    public String addToWatchlist(String email, WatchlistRequest request) {

        String symbol = request.getStockSymbol().toUpperCase();

        if (watchlistRepository.findByUserEmailAndStockSymbol(email, symbol).isPresent()) {
            return "Stock already in watchlist";
        }

        Stock stock = stockRepository.findByStockSymbol(symbol)
                .orElseThrow(() -> new IllegalArgumentException("Stock not found"));

        WatchlistItem item = new WatchlistItem();
        item.setUserEmail(email);
        item.setStockSymbol(stock.getStockSymbol());
        item.setCompanyName(stock.getCompanyName());
        watchlistRepository.save(item);

        return "Stock added to watchlist";
    }

    public String removeFromWatchlist(String email, String symbol) {

        WatchlistItem item = watchlistRepository.findByUserEmailAndStockSymbol(email, symbol.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Stock is not in watchlist"));

        watchlistRepository.delete(item);

        return "Stock removed from watchlist";
    }
}
