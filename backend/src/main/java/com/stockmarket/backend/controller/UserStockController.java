package com.stockmarket.backend.controller;

import com.stockmarket.backend.dto.StockNewsItem;
import com.stockmarket.backend.service.OpenAiAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/stocks")
public class UserStockController {

    @Autowired
    private OpenAiAnalysisService openAiAnalysisService;

    @GetMapping("/{symbol}/news")
    public List<StockNewsItem> getStockNews(@PathVariable String symbol) {

        return openAiAnalysisService.getStockNews(symbol);
    }
}
