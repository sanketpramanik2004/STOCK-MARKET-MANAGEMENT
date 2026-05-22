package com.stockmarket.backend.controller;

import com.stockmarket.backend.dto.WalletRequest;
import com.stockmarket.backend.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping
    public Map<String, Object> getWallet(Authentication authentication) {

        return walletService.getWallet(authentication.getName());
    }

    @PostMapping("/deposit")
    public Map<String, Object> deposit(Authentication authentication, @RequestBody WalletRequest request) {

        return walletService.deposit(authentication.getName(), request.getAmount(), request.getDescription());
    }

    @PostMapping("/withdraw")
    public Map<String, Object> withdraw(Authentication authentication, @RequestBody WalletRequest request) {

        return walletService.withdraw(authentication.getName(), request.getAmount(), request.getDescription());
    }
}
