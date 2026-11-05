package com.pizza.deli.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CouponValidateResponse {
    private Boolean valid;
    private String message;
    private String code;
    private Double discountAmount;
    private Double finalTotal;
    private CouponDTO coupon;
}
