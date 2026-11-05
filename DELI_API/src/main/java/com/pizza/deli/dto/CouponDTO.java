package com.pizza.deli.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponDTO {
    private Long couponId;
    private String code;
    private String title;
    private String description;
    private String discountType; // FIXED, PERCENT, SHIPPING
    private Double discountValue;
    private Double maxDiscount;
    private Double minOrder;
    private Boolean isActive;
    private String badge;
}
