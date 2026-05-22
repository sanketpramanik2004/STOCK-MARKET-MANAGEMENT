package com.stockmarket.backend.controller;

import com.stockmarket.backend.dto.AiAnalysisResponse;
import com.stockmarket.backend.service.OpenAiAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiAnalysisController {

    @Autowired
    private OpenAiAnalysisService openAiAnalysisService;

    @PostMapping("/stocks/{symbol}/analysis")
    public AiAnalysisResponse analyzeStock(@PathVariable String symbol) {

        return openAiAnalysisService.analyzeStock(symbol);
    }

    @PostMapping("/portfolio/analysis")
    public AiAnalysisResponse analyzePortfolio(Authentication authentication) {

        return openAiAnalysisService.analyzePortfolio(authentication.getName());
    }
}
