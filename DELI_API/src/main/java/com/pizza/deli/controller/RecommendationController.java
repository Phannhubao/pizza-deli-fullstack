package com.pizza.deli.controller;

import com.pizza.deli.dto.RAGRecommendRequest;
import com.pizza.deli.dto.RAGRecommendResponse;
import com.pizza.deli.service.RAGRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RAGRecommendationService ragService;

    @PostMapping("/rag")
    public ResponseEntity<RAGRecommendResponse> getRecommendation(@RequestBody RAGRecommendRequest request) {
        RAGRecommendResponse response = ragService.getPersonalizedRecommendations(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/presets")
    public ResponseEntity<List<Map<String, Object>>> getRecommendationPresets() {
        List<Map<String, Object>> presets = List.of(
                Map.of(
                        "id", "couple_dinner",
                        "title", "Bữa tối lãng mạn 2 người",
                        "icon", "💑",
                        "prompt", "Tư vấn bữa tối hẹn hò 2 người, không gian ấm cúng, thích phô mai béo ngậy và tráng miệng ngọt nhẹ, ngân sách dưới 350k",
                        "people", 2,
                        "budget", 350000.0,
                        "occasion", "Cặp đôi"
                ),
                Map.of(
                        "id", "family_kids",
                        "title", "Tiệc gia đình có trẻ nhỏ",
                        "icon", "👨‍👩‍👧‍👦",
                        "prompt", "Gợi ý bữa ăn cho gia đình 4 người có 2 bé nhỏ, đế bánh mềm, tuyệt đối không cay, có xúc xích ngô ngọt và khoai tây",
                        "people", 4,
                        "budget", 450000.0,
                        "occasion", "Gia đình, Trẻ em",
                        "spicyPreference", 0
                ),
                Map.of(
                        "id", "eat_clean",
                        "title", "Eat Clean / Ít calo",
                        "icon", "🥗",
                        "prompt", "Thực đơn ít calo, nhiều rau xanh, ức gà hoặc nấm, hạn chế dầu mỡ phô mai dày, tính toán calo giúp tôi",
                        "people", 1,
                        "budget", 200000.0,
                        "occasion", "Eat clean"
                ),
                Map.of(
                        "id", "party_beer",
                        "title", "Tụ tập bạn bè / Uống bia",
                        "icon", "🍺",
                        "prompt", "Combo ăn nhậu xem bóng đá cho 3-4 bạn, vị đậm đà, cay nhẹ, nhiều thịt xông khói và xúc xích cay",
                        "people", 4,
                        "budget", 500000.0,
                        "occasion", "Tiệc tùng, Nhậu/Bia",
                        "spicyPreference", 2
                ),
                Map.of(
                        "id", "quick_lunch",
                        "title", "Bữa trưa văn phòng nhanh",
                        "icon", "⚡",
                        "prompt", "Bữa trưa 1 người nhanh gọn, giá dưới 100k kèm nước uống mát lạnh",
                        "people", 1,
                        "budget", 100000.0,
                        "occasion", "Văn phòng"
                )
        );
        return ResponseEntity.ok(presets);
    }
}
