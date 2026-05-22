package com.stockmarket.backend.controller;

import com.stockmarket.backend.dto.AdminStockRequest;
import com.stockmarket.backend.entity.Stock;
import com.stockmarket.backend.entity.StockTransaction;
import com.stockmarket.backend.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/users")
    public List<Map<String, Object>> getUsers(Authentication authentication) {

        return adminService.getAllUsers(authentication.getName());
    }

    @GetMapping("/transactions")
    public List<StockTransaction> getTransactions(Authentication authentication) {

        return adminService.getAllTransactions(authentication.getName());
    }

    @GetMapping("/stocks")
    public List<Stock> getStocks(Authentication authentication) {

        return adminService.getAllStocks(authentication.getName());
    }

    @PostMapping("/stocks")
    public Stock addStock(Authentication authentication, @RequestBody AdminStockRequest request) {

        return adminService.addStock(authentication.getName(), request);
    }

    @PostMapping("/stocks/seed-30")
    public String seedThirtyStocks(Authentication authentication) {

        return adminService.seedThirtyStocks(authentication.getName());
    }

    @PutMapping("/stocks/{id}")
    public Stock updateStock(Authentication authentication, @PathVariable Long id, @RequestBody AdminStockRequest request) {

        return adminService.updateStock(authentication.getName(), id, request);
    }

    @PatchMapping("/stocks/{id}/price")
    public Stock updateStockPrice(Authentication authentication, @PathVariable Long id, @RequestBody Map<String, BigDecimal> request) {

        return adminService.updateStockPrice(authentication.getName(), id, request.get("price"));
    }

    @DeleteMapping("/stocks/{id}")
    public String deleteStock(Authentication authentication, @PathVariable Long id) {

        return adminService.deleteStock(authentication.getName(), id);
    }
}
