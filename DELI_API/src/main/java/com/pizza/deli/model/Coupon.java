package com.pizza.deli.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "coupon_id")
    private Long couponId;

    @Column(name = "code", unique = true, nullable = false, length = 50)
    private String code;

    @Column(name = "title", length = 100)
    private String title;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "discount_type", length = 20) // FIXED, PERCENT, SHIPPING
    private String discountType;

    @Column(name = "discount_value")
    private Double discountValue;

    @Column(name = "max_discount")
    private Double maxDiscount;

    @Column(name = "min_order")
    private Double minOrder;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "badge", length = 50)
    private String badge;
}
