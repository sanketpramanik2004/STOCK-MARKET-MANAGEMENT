package com.stockmarket.backend.repository;

import com.stockmarket.backend.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    List<StockTransaction> findByUserEmailOrderByTransactionDateDesc(String userEmail);

    List<StockTransaction> findByUserEmailOrderByTransactionDateAsc(String userEmail);
}
