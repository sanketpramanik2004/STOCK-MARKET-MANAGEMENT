package com.stockmarket.backend.controller;

import com.stockmarket.backend.dto.LiveStockQuote;
import com.stockmarket.backend.entity.Stock;
import com.stockmarket.backend.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    @Autowired
    private StockService stockService;

    @PostMapping("/add-sample")
    public String addSampleStocks() {

        return stockService.addSampleStocks();
    }

    @GetMapping
    public List<Stock> getAllStocks() {

        return stockService.getAllStocks();
    }

    @GetMapping("/search")
    public List<Stock> searchStocks(@RequestParam String query) {

        return stockService.searchStocks(query);
    }

    @GetMapping("/live")
    public List<LiveStockQuote> getLiveStocks() {

        return stockService.getLiveStocks();
    }

    @GetMapping("/live/{symbol}")
    public LiveStockQuote getLiveStockBySymbol(@PathVariable String symbol) {

        return stockService.getLiveStockBySymbol(symbol);
    }
}
