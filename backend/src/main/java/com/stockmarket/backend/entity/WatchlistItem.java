package com.stockmarket.backend.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "watchlist_items", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"userEmail", "stockSymbol"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userEmail;

    private String stockSymbol;

    private String companyName;
}
