package com.stockmarket.backend.service;

import com.stockmarket.backend.dto.TradeRequest;
import com.stockmarket.backend.entity.PortfolioHolding;
import com.stockmarket.backend.entity.Stock;
import com.stockmarket.backend.entity.StockTransaction;
import com.stockmarket.backend.entity.User;
import com.stockmarket.backend.repository.PortfolioHoldingRepository;
import com.stockmarket.backend.repository.StockRepository;
import com.stockmarket.backend.repository.StockTransactionRepository;
import com.stockmarket.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class TradingService {

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private PortfolioHoldingRepository holdingRepository;

    @Autowired
    private StockTransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletService walletService;

    @Transactional
    public String buyStock(TradeRequest request) {

        Stock stock = validateTradeRequest(request);
        User user = getUser(request.getEmail());
        BigDecimal totalAmount = stock.getCurrentPrice().multiply(BigDecimal.valueOf(request.getQuantity()));

        if (user.getWalletBalance() == null) {
            user.setWalletBalance(new BigDecimal("1000000"));
        }

        if (user.getWalletBalance().compareTo(totalAmount) < 0) {
            throw new IllegalArgumentException("Insufficient wallet balance");
        }

        Optional<PortfolioHolding> holdingOptional = holdingRepository.findByUserEmailAndStockSymbol(
                request.getEmail(),
                request.getStockSymbol().toUpperCase());

        if (holdingOptional.isPresent()) {
            PortfolioHolding holding = holdingOptional.get();
            BigDecimal existingValue = holding.getAveragePrice().multiply(BigDecimal.valueOf(holding.getQuantity()));
            BigDecimal newValue = stock.getCurrentPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
            int updatedQuantity = holding.getQuantity() + request.getQuantity();

            holding.setQuantity(updatedQuantity);
            holding.setAveragePrice(existingValue.add(newValue).divide(BigDecimal.valueOf(updatedQuantity), 2, RoundingMode.HALF_UP));
            holdingRepository.save(holding);
        } else {
            PortfolioHolding holding = new PortfolioHolding();
            holding.setUserEmail(request.getEmail());
            holding.setStockSymbol(stock.getStockSymbol());
            holding.setCompanyName(stock.getCompanyName());
            holding.setQuantity(request.getQuantity());
            holding.setAveragePrice(stock.getCurrentPrice());
            holdingRepository.save(holding);
        }

        user.setWalletBalance(user.getWalletBalance().subtract(totalAmount));
        userRepository.save(user);
        saveTransaction(request, stock, "BUY", "COMPLETED");
        walletService.recordTrade(request.getEmail(), "BUY", totalAmount, user.getWalletBalance(), stock.getStockSymbol(), stock.getCompanyName());

        return "Stock bought successfully";
    }

    @Transactional
    public String sellStock(TradeRequest request) {

        Stock stock = validateTradeRequest(request);
        User user = getUser(request.getEmail());
        PortfolioHolding holding = holdingRepository.findByUserEmailAndStockSymbol(
                request.getEmail(),
                request.getStockSymbol().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("No holding found for this stock"));

        if (holding.getQuantity() < request.getQuantity()) {
            throw new IllegalArgumentException("Insufficient quantity in portfolio");
        }

        int remainingQuantity = holding.getQuantity() - request.getQuantity();

        if (remainingQuantity == 0) {
            holdingRepository.delete(holding);
        } else {
            holding.setQuantity(remainingQuantity);
            holdingRepository.save(holding);
        }

        BigDecimal saleAmount = stock.getCurrentPrice().multiply(BigDecimal.valueOf(request.getQuantity()));
        BigDecimal walletBalance = user.getWalletBalance() == null ? BigDecimal.ZERO : user.getWalletBalance();
        user.setWalletBalance(walletBalance.add(saleAmount));
        userRepository.save(user);
        saveTransaction(request, stock, "SELL", "COMPLETED");
        walletService.recordTrade(request.getEmail(), "SELL", saleAmount, user.getWalletBalance(), stock.getStockSymbol(), stock.getCompanyName());

        return "Stock sold successfully";
    }

    private Stock validateTradeRequest(TradeRequest request) {

        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new IllegalArgumentException("User email is required");
        }

        getUser(request.getEmail());

        if (request.getStockSymbol() == null || request.getStockSymbol().isBlank()) {
            throw new IllegalArgumentException("Stock symbol is required");
        }

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero");
        }

        return stockRepository.findByStockSymbol(request.getStockSymbol().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Stock not found"));
    }

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Registered user not found"));
    }

    private void saveTransaction(TradeRequest request, Stock stock, String type, String status) {

        StockTransaction transaction = new StockTransaction();
        transaction.setUserEmail(request.getEmail());
        transaction.setStockSymbol(stock.getStockSymbol());
        transaction.setCompanyName(stock.getCompanyName());
        transaction.setTransactionType(type);
        transaction.setQuantity(request.getQuantity());
        transaction.setPrice(stock.getCurrentPrice());
        transaction.setTotalAmount(stock.getCurrentPrice().multiply(BigDecimal.valueOf(request.getQuantity())));
        transaction.setStatus(status);
        transaction.setTransactionDate(LocalDateTime.now());

        transactionRepository.save(transaction);
    }
}
