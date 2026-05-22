package com.stockmarket.backend.controller;

import com.stockmarket.backend.entity.StockTransaction;
import com.stockmarket.backend.repository.StockTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private StockTransactionRepository transactionRepository;

    @GetMapping("/me")
    public List<StockTransaction> getMyTransactions(Authentication authentication) {

        return transactionRepository.findByUserEmailOrderByTransactionDateDesc(authentication.getName());
    }

    @GetMapping("/{email}")
    public List<StockTransaction> getTransactions(@PathVariable String email) {

        return transactionRepository.findByUserEmailOrderByTransactionDateDesc(email);
    }
}
