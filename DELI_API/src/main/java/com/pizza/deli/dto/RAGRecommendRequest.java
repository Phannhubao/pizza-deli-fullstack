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
public class RAGRecommendRequest {
    private Long userId;                   // ID người dùng (nếu đã đăng nhập)
    private String userPrompt;             // Yêu cầu tự nhiên của khách (VD: "Bữa tối 2 người thích hải sản...")
    private Double maxBudget;              // Ngân sách tối đa (VNĐ)
    private Integer numberOfPeople;        // Số người ăn
    private Integer spicyPreference;       // 0: Không cay, 1: Cay nhẹ, 2: Cay vừa, 3: Thích cay
    private Boolean isVegetarian;          // Ăn chay
    private List<String> allergenExclusions; // Danh sách dị ứng muốn loại bỏ (VD: ["Tôm", "Hải sản", "Sữa"])
    private String occasion;               // Dịp: "hen_ho", "gia_dinh", "eat_clean", "uong_bia", "van_phong"
}
