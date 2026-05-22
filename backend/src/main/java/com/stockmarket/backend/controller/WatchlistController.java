package com.stockmarket.backend.controller;

import com.stockmarket.backend.dto.WatchlistRequest;
import com.stockmarket.backend.entity.WatchlistItem;
import com.stockmarket.backend.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    @GetMapping
    public List<WatchlistItem> getWatchlist(Authentication authentication) {

        return watchlistService.getWatchlist(authentication.getName());
    }

    @PostMapping
    public String addToWatchlist(@RequestBody WatchlistRequest request, Authentication authentication) {

        return watchlistService.addToWatchlist(authentication.getName(), request);
    }

    @DeleteMapping("/{symbol}")
    public String removeFromWatchlist(@PathVariable String symbol, Authentication authentication) {

        return watchlistService.removeFromWatchlist(authentication.getName(), symbol);
    }
}
