package com.stockmarket.backend.repository;

import com.stockmarket.backend.entity.Stock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {

    Optional<Stock> findByStockSymbol(String stockSymbol);

    List<Stock> findByStockSymbolContainingIgnoreCaseOrCompanyNameContainingIgnoreCase(String stockSymbol, String companyName);
}
