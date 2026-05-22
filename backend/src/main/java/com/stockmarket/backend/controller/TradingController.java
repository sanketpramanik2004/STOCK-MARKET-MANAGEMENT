package com.stockmarket.backend.controller;

import com.stockmarket.backend.dto.TradeRequest;
import com.stockmarket.backend.service.TradingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trading")
public class TradingController {

    @Autowired
    private TradingService tradingService;

    @PostMapping("/buy")
    public String buyStock(@RequestBody TradeRequest request, Authentication authentication) {

        request.setEmail(authentication.getName());
        return tradingService.buyStock(request);
    }

    @PostMapping("/sell")
    public String sellStock(@RequestBody TradeRequest request, Authentication authentication) {

        request.setEmail(authentication.getName());
        return tradingService.sellStock(request);
    }
}
