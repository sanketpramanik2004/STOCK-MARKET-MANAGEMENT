package com.stockmarket.backend.repository;

import com.stockmarket.backend.entity.WatchlistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<WatchlistItem, Long> {

    List<WatchlistItem> findByUserEmail(String userEmail);

    Optional<WatchlistItem> findByUserEmailAndStockSymbol(String userEmail, String stockSymbol);
}
