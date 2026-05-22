package com.stockmarket.backend.controller;

import com.stockmarket.backend.service.PortfolioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {

    @Autowired
    private PortfolioService portfolioService;

    @GetMapping("/me")
    public Map<String, Object> getMyPortfolio(Authentication authentication) {

        return portfolioService.getPortfolio(authentication.getName());
    }

    @GetMapping("/{email}")
    public Map<String, Object> getPortfolio(@PathVariable String email) {

        return portfolioService.getPortfolio(email);
    }
}
