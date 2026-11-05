package com.pizza.deli.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RAGRecommendResponse {
    private String reasoning;                    // Lời giải thích/tư vấn từ AI
    private String suggestedOccasion;            // Dịp phù hợp được nhận diện
    private Double estimatedTotalPrice;          // Tổng giá tiền dự tính của combo
    private String discountOrVoucherNote;        // Gợi ý voucher tiết kiệm
    private List<RecommendedItem> recommendedItems;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendedItem {
        private Integer productId;
        private String productName;
        private Double price;
        private Integer quantity;
        private String reason;                   // Lý do gợi ý món này
        private String imageUrl;
        private Integer spicyLevel;
        private Integer calories;
        private String pairsWith;
        private String ingredients;
    }
}
