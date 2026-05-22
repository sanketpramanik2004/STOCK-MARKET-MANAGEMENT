package com.stockmarket.backend.repository;

import com.stockmarket.backend.entity.PortfolioHolding;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PortfolioHoldingRepository extends JpaRepository<PortfolioHolding, Long> {

    List<PortfolioHolding> findByUserEmail(String userEmail);

    Optional<PortfolioHolding> findByUserEmailAndStockSymbol(String userEmail, String stockSymbol);
}
