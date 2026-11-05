package com.pizza.deli.model;



import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonBackReference;
@Data
@Entity
@Table(name = "Products")
public class Product {
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "product_id")
    private Integer productId;

    @Column(nullable = false, length = 100)
    private String productName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "CategoryID", nullable = false)
    @JsonBackReference
    private Category category;

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer stock;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String ingredients;

    @Column(name = "spicy_level")
    private Integer spicyLevel = 0; // 0: Không cay, 1: Cay nhẹ, 2: Cay vừa, 3: Cay nồng

    @Column(name = "cheese_level")
    private Integer cheeseLevel = 3; // 1 -> 5 (mức độ béo ngậy phô mai)

    private Integer calories; // Calo ước tính (kcal)

    @Column(name = "serving_size", length = 50)
    private String servingSize; // "1 người", "2-3 người", "3-4 người"

    @Column(name = "is_vegetarian")
    private Boolean isVegetarian = false;

    @Column(length = 255)
    private String allergens; // "Hải sản, Lactose, Gluten, Đậu phộng"

    @Column(length = 255)
    private String occasions; // "Trẻ em, Cặp đôi, Tiệc tùng, Eat clean, Nhậu/Bia"

    @Column(name = "pairs_with", length = 255)
    private String pairsWith; // "Coca-Cola, Salad cá ngừ, Khoai tây chiên"

    @Column(nullable = false)
    private Boolean active = true;

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> images = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}