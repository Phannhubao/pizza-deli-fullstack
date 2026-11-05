package com.pizza.deli.dto;

import com.pizza.deli.model.Review;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long id;
    private Integer rating;
    private String comment;
    private Long userId;
    private String userName;
    private Integer productId;
    private String productName;
    private Long orderId;
    private LocalDateTime createdAt;

    public static ReviewDTO fromEntity(Review review) {
        if (review == null) return null;
        return ReviewDTO.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userId(review.getUser() != null ? review.getUser().getId() : null)
                .userName(review.getUserName() != null ? review.getUserName() : (review.getUser() != null ? review.getUser().getName() : "Khách hàng"))
                .productId(review.getProduct() != null ? review.getProduct().getProductId() : null)
                .productName(review.getProduct() != null ? review.getProduct().getProductName() : null)
                .orderId(review.getOrderId())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
