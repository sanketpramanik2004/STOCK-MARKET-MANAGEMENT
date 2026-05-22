package com.stockmarket.backend.controller;

import com.stockmarket.backend.service.MarketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/market")
public class MarketController {

    @Autowired
    private MarketService marketService;

    @GetMapping("/analysis")
    public Map<String, Object> getMarketAnalysis() {

        return marketService.getMarketAnalysis();
    }
}
