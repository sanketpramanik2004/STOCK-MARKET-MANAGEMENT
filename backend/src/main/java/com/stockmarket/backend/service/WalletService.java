package com.stockmarket.backend.service;

import com.stockmarket.backend.entity.User;
import com.stockmarket.backend.entity.WalletTransaction;
import com.stockmarket.backend.repository.UserRepository;
import com.stockmarket.backend.repository.WalletTransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class WalletService {

    private static final BigDecimal DEFAULT_BALANCE = new BigDecimal("1000000");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletTransactionRepository walletTransactionRepository;

    public Map<String, Object> getWallet(String email) {

        User user = getUser(email);
        BigDecimal balance = ensureWalletBalance(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("balance", balance);
        response.put("transactions", walletTransactionRepository.findByUserEmailOrderByCreatedAtDesc(email));
        return response;
    }

    @Transactional
    public Map<String, Object> deposit(String email, BigDecimal amount, String description) {

        validateAmount(amount);
        User user = getUser(email);
        BigDecimal balance = ensureWalletBalance(user).add(amount);
        user.setWalletBalance(balance);
        userRepository.save(user);
        record(email, "DEPOSIT", amount, balance, cleanDescription(description, "Wallet deposit"), "WALLET", null);
        return getWallet(email);
    }

    @Transactional
    public Map<String, Object> withdraw(String email, BigDecimal amount, String description) {

        validateAmount(amount);
        User user = getUser(email);
        BigDecimal balance = ensureWalletBalance(user);

        if (balance.compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient wallet balance");
        }

        BigDecimal updatedBalance = balance.subtract(amount);
        user.setWalletBalance(updatedBalance);
        userRepository.save(user);
        record(email, "WITHDRAW", amount.negate(), updatedBalance, cleanDescription(description, "Wallet withdrawal"), "WALLET", null);
        return getWallet(email);
    }

    public void recordTrade(String email, String type, BigDecimal amount, BigDecimal balanceAfter, String symbol, String companyName) {

        String transactionType = "BUY".equalsIgnoreCase(type) ? "BUY_DEBIT" : "SELL_CREDIT";
        BigDecimal signedAmount = "BUY".equalsIgnoreCase(type) ? amount.negate() : amount;
        String description = "%s %s shares".formatted(type.equalsIgnoreCase("BUY") ? "Bought" : "Sold", companyName);
        record(email, transactionType, signedAmount, balanceAfter, description, "TRADE", symbol);
    }

    private void record(String email, String type, BigDecimal amount, BigDecimal balanceAfter, String description, String referenceType, String referenceSymbol) {

        WalletTransaction transaction = new WalletTransaction();
        transaction.setUserEmail(email);
        transaction.setTransactionType(type);
        transaction.setAmount(amount);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setDescription(description);
        transaction.setReferenceType(referenceType);
        transaction.setReferenceSymbol(referenceSymbol);
        transaction.setCreatedAt(LocalDateTime.now());
        walletTransactionRepository.save(transaction);
    }

    private User getUser(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Registered user not found"));
    }

    private BigDecimal ensureWalletBalance(User user) {

        if (user.getWalletBalance() == null) {
            user.setWalletBalance(DEFAULT_BALANCE);
            userRepository.save(user);
        }

        return user.getWalletBalance();
    }

    private void validateAmount(BigDecimal amount) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be greater than zero");
        }
    }

    private String cleanDescription(String description, String fallback) {

        return description == null || description.isBlank() ? fallback : description.trim();
    }
}
