package com.pizza.deli.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pizza.deli.dto.RAGRecommendRequest;
import com.pizza.deli.dto.RAGRecommendResponse;
import com.pizza.deli.model.Coupon;
import com.pizza.deli.model.Image;
import com.pizza.deli.model.Order;
import com.pizza.deli.model.OrderDetail;
import com.pizza.deli.model.Product;
import com.pizza.deli.model.User;
import com.pizza.deli.repository.CouponRepository;
import com.pizza.deli.repository.ImageRepository;
import com.pizza.deli.repository.OrderRepository;
import com.pizza.deli.repository.ProductRepository;
import com.pizza.deli.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RAGRecommendationService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final ImageRepository imageRepository;
    private final ObjectMapper objectMapper;
    private RestTemplate restTemplate = new RestTemplate();

    @Value("${gemini.api.key:}")
    private String geminiApiKeyProp;

    /**
     * Entry point xử lý đề xuất thực đơn cá nhân hóa bằng RAG
     */
    public RAGRecommendResponse getPersonalizedRecommendations(RAGRecommendRequest request) {
        String rawPrompt = request != null ? request.getUserPrompt() : null;

        // 0. XỬ LÝ CHÀO HỎI / HỎI THĂM / TRÒ CHUYỆN (Greeting & Chit-chat)
        if (isGreetingOrChitchat(rawPrompt)) {
            String customerName = resolveCustomerGreeting(request != null ? request.getUserId() : null);
            String greetingText = buildGreetingMessage(customerName, rawPrompt);
            return RAGRecommendResponse.builder()
                    .reasoning(greetingText)
                    .suggestedOccasion(null)
                    .estimatedTotalPrice(null)
                    .discountOrVoucherNote(null)
                    .recommendedItems(Collections.emptyList())
                    .build();
        }

        // Phân tích ý định & ngôn ngữ tự nhiên từ tin nhắn (thời gian, số người, ngân sách, khẩu vị)
        enrichRequestFromNaturalPrompt(request);

        // ==========================================
        // 1. RETRIEVAL: Truy xuất dữ liệu thực tế (Ground Truth)
        // ==========================================
        List<Product> availableProducts = productRepository.findByActiveTrue().stream()
                .filter(p -> p.getStock() != null && p.getStock() > 0)
                .collect(Collectors.toList());

        if (availableProducts.isEmpty()) {
            availableProducts = productRepository.findAll();
        }

        // Lấy lịch sử người dùng nếu có userId
        String userHistorySummary = buildUserHistoryContext(request.getUserId());

        // Lấy danh sách Voucher còn hiệu lực
        List<Coupon> activeCoupons = couponRepository.findByIsActiveTrue();
        String activeCouponText = activeCoupons.isEmpty() ? "Không có voucher" :
                activeCoupons.stream()
                        .map(c -> String.format("%s (Giảm %s, đơn tối thiểu %sđ)", 
                                c.getCode(), 
                                c.getDiscountValue() != null ? c.getDiscountValue() : 0, 
                                c.getMinOrder() != null ? c.getMinOrder() : 0))
                        .collect(Collectors.joining("; "));

        // ==========================================
        // 2. AUGMENTATION: Chuẩn bị Prompt làm giàu ngữ cảnh
        // ==========================================
        String menuKnowledgeBase = buildMenuKnowledge(availableProducts);
        String prompt = buildSystemPrompt(menuKnowledgeBase, userHistorySummary, activeCouponText, request);

        // ==========================================
        // 3. GENERATION: Gọi LLM (Gemini) hoặc Smart Heuristic RAG Fallback
        // ==========================================
        String activeApiKey = resolveGeminiApiKey();
        RAGRecommendResponse response = null;

        if (activeApiKey != null && !activeApiKey.isBlank() && !activeApiKey.contains("YOUR_GEMINI")) {
            try {
                response = callGeminiApi(prompt, activeApiKey);
            } catch (Exception e) {
                log.warn("Gọi Gemini API thất bại hoặc hết quota: {}. Chuyển sang Smart Heuristic RAG.", e.getMessage());
            }
        }

        if (response == null) {
            response = executeSmartHeuristicRAG(availableProducts, request, activeCoupons);
        }

        // Bổ sung thêm thông tin hình ảnh & chi tiết kỹ thuật cho từng món gợi ý
        enrichRecommendedItemsMetadata(response, availableProducts);

        return response;
    }

    private boolean isGreetingOrChitchat(String rawPrompt) {
        if (rawPrompt == null || rawPrompt.isBlank()) return true;
        String p = removeVietnameseAccents(rawPrompt).trim().toLowerCase();
        // Bỏ dấu câu ở cuối
        p = p.replaceAll("[.,!?~]+$", "").trim();
        if (p.isEmpty()) return true;

        List<String> greetings = List.of(
                "alo", "alooo", "aloooo", "hi", "hello", "helo", "hey",
                "chao", "xin chao", "chao ban", "chao shop", "chao em", "chao anh", "chao chi", "chao deli", "chao ad",
                "shop oi", "shop oi shop", "ad oi", "admin oi", "bot oi", "ban oi", "em oi", "deli oi",
                "co ai khong", "co ai o day khong", "co ai truc khong", "co ai k",
                "test", "demo",
                "giup minh", "giup minh voi", "giup voi", "tu van giup", "tu van giup minh", "cho hoi", "cho minh hoi", "cho em hoi",
                "o day ban gi", "quan ban gi", "co nhung mon gi", "menu dau", "xem menu", "menu", "thuc don",
                "quan o dau", "dia chi o dau", "gio mo cua", "may gio dong cua"
        );
        if (greetings.contains(p)) {
            return true;
        }

        // Khớp dạng ngắn: "alo shop", "hi bot", "chao em nhe"
        if (p.matches("^(alo|hi|hello|hey|chao|xin chao)( [a-zA-Z0-9]+){0,2}$")) {
            return true;
        }
        return false;
    }

    private String resolveCustomerGreeting(Long userId) {
        if (userId != null) {
            try {
                Optional<User> uOpt = userRepository.findById(userId);
                if (uOpt.isPresent() && uOpt.get().getName() != null && !uOpt.get().getName().isBlank()) {
                    return uOpt.get().getName().trim();
                }
            } catch (Exception ignored) {}
        }
        return null;
    }

    private String buildGreetingMessage(String customerName, String rawPrompt) {
        String p = removeVietnameseAccents(rawPrompt != null ? rawPrompt : "").trim().toLowerCase();

        if (p.contains("ban gi") || p.contains("co gi") || p.contains("menu") || p.contains("thuc don")) {
            return "Dạ Pizza Deli phục vụ đa dạng các món Pizza thủ công nướng than thơm nức (Hải sản cao cấp, Bò sốt tiêu, Gà BBQ, Thịt nguội Ý Parma, Phô mai 4 tầng), cùng Mì Ý tươi, Khai vị giòn ngon và Tráng miệng thanh mát.\n\nBạn có thể nhắn cho mình yêu cầu cụ thể (VD: 'Tìm pizza không cay', 'Combo 2 người hẹn hò 300k', 'Pizza cho trẻ em') để mình chọn món chuẩn nhất nhé!";
        }

        if (p.contains("o dau") || p.contains("dia chi") || p.contains("chi nhanh")) {
            return "Dạ Pizza Deli có cửa hàng phục vụ tại chỗ và hỗ trợ giao hàng tận nhà nhanh chóng trong 30 phút với độ giòn nóng nguyên vẹn!\n\nBạn có thể duyệt thực đơn và đặt trực tiếp ngay tại đây nhé.";
        }

        if (p.contains("gio mo cua") || p.contains("may gio") || p.contains("dong cua")) {
            return "Dạ Pizza Deli mở cửa từ 09:00 sáng đến 22:30 tối mỗi ngày, nhận đơn giao hàng hỏa tốc liên tục.\n\nBạn muốn tìm món cho bữa trưa hay bữa tối hôm nay ạ?";
        }

        if (customerName != null && !customerName.isBlank()) {
            return String.format("Dạ Pizza Deli xin chào bạn %s! 👋 Rất vui được gặp lại bạn.\n\nHôm nay bạn muốn tìm món gì hay cần mình gợi ý bữa ăn ngon (cho mấy người, ngân sách bao nhiêu, có kiêng cay hay dị ứng gì không) để mình tư vấn ngay nhé! 🍕", customerName);
        }

        return "Dạ Pizza Deli xin chào bạn! 👋 Mình là trợ lý ẩm thực AI của Deli.\n\nHôm nay bạn muốn tìm loại pizza nào hay cần mình gợi ý bữa ăn ngon (cho mấy người, ngân sách bao nhiêu, có kiêng cay hay dị ứng gì không) để mình tư vấn ngay nhé! 🍕";
    }

    private String resolveGeminiApiKey() {
        if (geminiApiKeyProp != null && !geminiApiKeyProp.isBlank()) {
            return geminiApiKeyProp.trim();
        }
        String envKey = System.getenv("GEMINI_API_KEY");
        return (envKey != null && !envKey.isBlank()) ? envKey.trim() : null;
    }

    private String buildUserHistoryContext(Long userId) {
        if (userId == null) {
            return "Khách hàng mới (chưa có lịch sử gọi món).";
        }
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return "Khách hàng mới.";
            }
            List<Order> orders = orderRepository.findByUser(userOpt.get());
            if (orders.isEmpty()) {
                return "Khách hàng " + userOpt.get().getName() + " chưa có đơn hàng nào trước đây.";
            }

            Map<String, Long> itemCounts = orders.stream()
                    .filter(o -> o.getOrderDetail() != null)
                    .flatMap(o -> o.getOrderDetail().stream())
                    .collect(Collectors.groupingBy(OrderDetail::getProduc_name, Collectors.counting()));

            StringBuilder sb = new StringBuilder();
            sb.append(String.format("Khách hàng: %s (ID: %d). Tổng số đơn hàng đã đặt: %d đơn.\n", 
                    userOpt.get().getName(), userId, orders.size()));
            sb.append("Món ưa thích / gọi nhiều nhất: ").append(
                    itemCounts.entrySet().stream()
                            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                            .limit(4)
                            .map(e -> e.getKey() + " (" + e.getValue() + " lần)")
                            .collect(Collectors.joining(", "))
            ).append(".\n");

            sb.append("Danh sách các đơn hàng gần đây của khách:\n");
            orders.stream()
                    .sorted((o1, o2) -> {
                        if (o1.getCreatedAt() != null && o2.getCreatedAt() != null) {
                            return o2.getCreatedAt().compareTo(o1.getCreatedAt());
                        }
                        return o2.getOrderId().compareTo(o1.getOrderId());
                    })
                    .limit(5)
                    .forEach(o -> {
                        String items = (o.getOrderDetail() != null && !o.getOrderDetail().isEmpty()) ?
                                o.getOrderDetail().stream()
                                        .map(d -> d.getProduc_name() + " (x" + d.getQuantity() + ")")
                                        .collect(Collectors.joining(", ")) : "Món đặt";
                        String dateStr = o.getCreatedAt() != null ? 
                                new java.text.SimpleDateFormat("dd/MM/yyyy HH:mm").format(o.getCreatedAt()) : "Gần đây";
                        sb.append(String.format("- Đơn #%d (Ngày %s) | Trạng thái: %s | Tổng: %,.0fđ | Món: %s\n",
                                o.getOrderId(), dateStr, o.getStatus() != null ? o.getStatus().name() : "Hoàn thành",
                                o.getTotalPrice() != null ? o.getTotalPrice() : 0.0, items));
                    });
            return sb.toString();
        } catch (Exception e) {
            log.error("Lỗi khi đọc lịch sử đặt hàng của User: {}", e.getMessage());
            return "Khách hàng thân thiết.";
        }
    }

    private String buildMenuKnowledge(List<Product> products) {
        return products.stream().map(p -> {
            String catName = (p.getCategory() != null) ? p.getCategory().getCategoryName() : "Món chung";
            String ingredients = p.getIngredients() != null ? p.getIngredients() : "Nguyên liệu tươi sạch";
            int spicy = p.getSpicyLevel() != null ? p.getSpicyLevel() : 0;
            int cheese = p.getCheeseLevel() != null ? p.getCheeseLevel() : 3;
            int cal = p.getCalories() != null ? p.getCalories() : 750;
            String portion = p.getServingSize() != null ? p.getServingSize() : "1-2 người";
            String allergens = p.getAllergens() != null ? p.getAllergens() : "Không";
            String occasions = p.getOccasions() != null ? p.getOccasions() : "Gia đình, Bạn bè";
            String pairs = p.getPairsWith() != null ? p.getPairsWith() : "Nước ngọt, Salad";

            return String.format(
                    "ID: %d | Tên: \"%s\" | Giá: %.0fđ | Nhóm: %s | Nguyên liệu: %s | Độ cay: %d/3 | Phô mai: %d/5 | Calo: %d kcal | Khẩu phần: %s | Dị ứng: %s | Dịp: %s | Món đi kèm: %s",
                    p.getProductId(), p.getProductName(), p.getPrice(), catName, ingredients, spicy, cheese, cal, portion, allergens, occasions, pairs
            );
        }).collect(Collectors.joining("\n"));
    }

    private String buildSystemPrompt(String menuKnowledge, String userHistory, String coupons, RAGRecommendRequest req) {
        String pNorm = removeVietnameseAccents(req.getUserPrompt() != null ? req.getUserPrompt() : "");
        boolean hasFamily = pNorm.contains("gia dinh") || pNorm.contains("di dinh") || pNorm.contains("nha toi") || pNorm.contains("nha minh") || pNorm.contains("ca nha");
        boolean hasPeopleCount = pNorm.matches(".*\\b(?:\\d+|mot|hai|ba|bon|nam|sau|bay|tam|chin|muoi)\\s*(?:nguoi|pax|khach|ban|dua)\\b.*") || pNorm.contains("may nguoi") || pNorm.contains("nhom");
        boolean hasComboWord = pNorm.contains("combo") || pNorm.contains("set") || pNorm.contains("tiec") || pNorm.contains("lien hoan") || pNorm.contains("hen ho") || pNorm.contains("cap doi");
        boolean isComboIntent = hasFamily || hasPeopleCount || hasComboWord;

        String modeInstruction;
        if (isComboIntent) {
            modeInstruction = "GỢI Ý COMBO (Khách đi gia đình / nhóm nhiều người / yêu cầu combo: Phối hợp đầy đủ Món chính + Món phụ/Salad + Nước uống + Tráng miệng).";
        } else {
            modeInstruction = "GỢI Ý MÓN LẺ / DANH MỤC CỤ THỂ (QUY TẮC BẮT BUỘC: Khách hỏi món nào hoặc danh mục nào như PIZZA, NƯỚC UỐNG, MÌ Ý, TRÁNG MIỆNG thì CHỈ ĐỀ XUẤT ĐÚNG MÓN ĐÓ! TUYỆT ĐỐI KHÔNG GỢI Ý THÀNH COMBO, KHÔNG ĐƯỢC TỰ Ý THÊM NƯỚC, SALAD, KHOAI TÂY VÀO ĐƠN).";
        }

        return String.format("""
                Bạn là Siêu Trợ Lý Ẩm Thực AI cho chuỗi Pizza Deli, chịu trách nhiệm tư vấn thực đơn cá nhân hóa (Personalized Menu Recommendation) theo kỹ thuật RAG (Retrieval-Augmented Generation).

                === NGUYÊN TẮC RAG TUYỆT ĐỐI (GROUND TRUTH) ===
                1. CHỈ ĐƯỢC đề xuất các món có trong DANH SÁCH MENU DƯỚI ĐÂY. Tuyệt đối KHÔNG sáng tác ra món không có trong danh sách.
                2. Phải tôn trọng các điều kiện loại trừ của khách: Dị ứng, độ cay, ngân sách tối đa, ăn chay.
                3. QUY TẮC PHÂN BIỆT GIỮA "GỢI Ý THEO MÓN/DANH MỤC" VÀ "GỢI Ý COMBO" (CỰC KỲ QUAN TRỌNG):
                   🔴 QUY TẮC 1: KHI KHÁCH HỎI PIZZA, NƯỚC UỐNG, MÌ Ý, TRÁNG MIỆNG HOẶC MÓN LẺ:
                      - Khi khách hỏi về PIZZA (VD: "tôi cần 1 cái pizza ngọt", "gợi ý pizza ngon", "2 cái pizza mặn ngọt", "pizza hải sản", "có pizza nào ngon"):
                        => CHỈ ĐỀ XUẤT CÁC MÓN PIZZA. TUYỆT ĐỐI KHÔNG GỢI Ý THÀNH COMBO! TUYỆT ĐỐI KHÔNG TỰ Ý THÊM NƯỚC, SALAD, KHOAI TÂY HAY TRÁNG MIỆNG VÀO GIỎ!
                      - Khi khách hỏi về NƯỚC / ĐỒ UỐNG (VD: "gợi ý nước uống", "có nước gì", "cho tôi xem đồ uống", "nước ngọt"):
                        => CHỈ ĐỀ XUẤT CÁC MÓN NƯỚC UỐNG / ĐỒ UỐNG. TUYỆT ĐỐI KHÔNG ĐƯA PIZZA HAY MÌ Ý VÀO.
                      - Khi khách hỏi về MÌ Ý / PASTA / SPAGHETTI (VD: "có mỳ ý nào ngon", "gợi ý mì ý", "pasta"):
                        => CHỈ ĐỀ XUẤT CÁC MÓN MÌ Ý / PASTA / LASAGNA. TUYỆT ĐỐI KHÔNG KÈM THEO PIZZA HAY NƯỚC.
                      - Khi khách hỏi về TRÁNG MIỆNG (VD: "món tráng miệng", "có tráng miệng gì không", "sữa chua, pudding"):
                        => CHỈ ĐỀ XUẤT CÁC MÓN TRÁNG MIỆNG.
                      - TÓM LẠI: Khách hỏi loại món nào thì CHỈ ĐỀ XUẤT ĐÚNG LOẠI MÓN ĐÓ, ĐỪNG TỰ TẠO THÀNH COMBO!

                   🟢 QUY TẮC 2: KHI NÀO MỚI ĐƯỢC GỢI Ý COMBO?
                      - CHỈ ĐƯỢC GỢI Ý COMBO KHI VÀ CHỈ KHI:
                        + Khách nhắc đến GIA ĐÌNH (VD: "cho gia đình", "đi đình", "gia đình ăn tối", "nhà có trẻ nhỏ").
                        + Khách nhắc đến SỐ NGƯỜI (VD: "cho 2 người", "4 người", "mấy người", "nhóm bạn", "cặp đôi", "hẹn hò").
                        + Khách trực tiếp yêu cầu "combo", "set ăn", "tiệc", "liên hoan", "bữa trưa/bữa tối trọn gói".
                      - Khi đó MỚI phối hợp thành Combo đầy đủ chuẩn Food Pairing: Món chính + Món phụ/Salad + Đồ uống (+ Tráng miệng).

                   - NGUYÊN TẮC NGÂN SÁCH COMBO:
                      + Khi khách đưa ra mức ngân sách cho combo/tiệc: TỔNG TIỀN CỦA COMBO ĐỀ XUẤT BẮT BUỘC PHẢI TIỆM CẬN MỨC NGÂN SÁCH ĐÓ (đạt 80-100%% ngân sách).
                      + Nếu khách đưa ngân sách lớn (từ 1 triệu trở lên) mà chưa chỉ định số người: Hãy hiểu đây là một đại tiệc cho gia đình/nhóm bạn, hãy phối nhiều món phong phú.

                   - NGUYÊN TẮC VỀ SỐ LƯỢNG MÓN:
                      + Nếu khách yêu cầu SỐ LƯỢNG MÓN CỤ THỂ (ví dụ: "1 cái pizza...", "2 cái pizza mặn và ngọt", "chọn cho tôi 2 cái pizza"): HÃY CHỈ ĐỀ XUẤT ĐÚNG VÀ ĐỦ SỐ LƯỢNG ĐÓ (tuyệt đối KHÔNG tự ý nhồi nhét thêm món phụ hay nước).

                   - NGUYÊN TẮC KHI KHÁCH CHÀO HỎI / CHƯA NÊU YÊU CẦU CỤ THỂ (alo, chào, quán ở đâu):
                      + Chào đón niềm nở, lịch sự, hỏi nhu cầu của khách. KHÔNG ÉP GỢI Ý MÓN: "recommendedItems": [].

                   - NGUYÊN TẮC KHI KHÁCH HỎI LỊCH SỬ ĐƠN HÀNG / TÔI TỪNG ĐẶT GÌ:
                      + Tra cứu từ mục [HỒ SƠ KHÁCH HÀNG & LỊCH SỬ] để giải đáp chi tiết, thân thiện (Tổng số đơn, món ruột, danh sách đơn gần nhất).

                4. Trả về DUY NHẤT một chuỗi JSON hợp lệ theo định dạng bên dưới (không có markdown backticks).

                [CƠ SỞ TRI THỨC MENU]:
                %s

                [HỒ SƠ KHÁCH HÀNG & LỊCH SỬ]:
                %s

                [MÃ GIẢM GIÁ KHẢ DỤNG]:
                %s

                [YÊU CẦU CỤ THỂ TỪ KHÁCH HÀNG]:
                - Yêu cầu tự nhiên: %s
                - Chỉ thị loại gợi ý: %s
                - Ngân sách tối đa: %s
                - Số người: %s
                - Độ cay mong muốn (0: không cay, 1: nhẹ, 2: vừa, 3: cay nồng): %s
                - Ăn chay: %s
                - Dị ứng cần tránh: %s
                - Dịp/Mục đích: %s

                [CẤU TRÚC JSON BẮT BUỘC]:
                {
                  "reasoning": "Lời tư vấn nhiệt tình, nêu rõ lý do tại sao các món này phù hợp nhất với yêu cầu của khách",
                  "suggestedOccasion": "Tên dịp (VD: Thưởng thức món lẻ theo sở thích / Bữa tối gia đình / Tiệc sum vầy)",
                  "estimatedTotalPrice": 285000,
                  "discountOrVoucherNote": "Gợi ý mã giảm giá hoặc mẹo tiết kiệm nếu có",
                  "recommendedItems": [
                    {
                      "productId": 1,
                      "productName": "Tên món chính xác từ danh sách",
                      "price": 180000,
                      "quantity": 1,
                      "reason": "Lý do chọn món này cho khách"
                    }
                  ]
                }
                """,
                menuKnowledge,
                userHistory,
                coupons,
                req.getUserPrompt() != null ? req.getUserPrompt() : "Gợi ý thực đơn đặc sắc nhất",
                modeInstruction,
                req.getMaxBudget() != null ? String.format("%.0f VNĐ (BẮT BUỘC: Tổng giá trị combo phải tiệm cận mức này, đạt từ 80 đến 100 phần trăm ngân sách)", req.getMaxBudget()) : "Linh hoạt",
                req.getNumberOfPeople() != null ? (req.getNumberOfPeople() + " người") : (isComboIntent ? "Gia đình / Nhóm" : "1 người (Món đơn lẻ)"),
                req.getSpicyPreference() != null ? req.getSpicyPreference() : "Tùy ý",
                Boolean.TRUE.equals(req.getIsVegetarian()) ? "Có (Chỉ ăn chay)" : "Không bắt buộc",
                (req.getAllergenExclusions() != null && !req.getAllergenExclusions().isEmpty()) ? String.join(", ", req.getAllergenExclusions()) : "Không có",
                req.getOccasion() != null ? req.getOccasion() : (hasFamily ? "Bữa ăn gia đình" : "Tự do")
        );
    }

    private RAGRecommendResponse callGeminiApi(String prompt, String apiKey) throws Exception {
        List<String> candidateModels = List.of("gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-flash-latest");
        Exception lastException = null;

        for (String modelName : candidateModels) {
            try {
                String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + modelName + ":generateContent?key=" + apiKey;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                Map<String, Object> body = Map.of(
                        "contents", List.of(
                                Map.of("parts", List.of(Map.of("text", prompt)))
                        ),
                        "generationConfig", Map.of(
                                "response_mime_type", "application/json",
                                "temperature", 0.2
                        )
                );

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);

                JsonNode root = objectMapper.readTree(response.getBody());
                String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText().trim();
                if (text.startsWith("```json")) {
                    text = text.substring(7);
                } else if (text.startsWith("```")) {
                    text = text.substring(3);
                }
                if (text.endsWith("```")) {
                    text = text.substring(0, text.length() - 3);
                }
                text = text.trim();
                return objectMapper.readValue(text, RAGRecommendResponse.class);
            } catch (Exception e) {
                log.warn("Gọi model {} không thành công: {}. Đang thử model tiếp theo...", modelName, e.getMessage());
                lastException = e;
            }
        }
        throw lastException != null ? lastException : new RuntimeException("Không thể gọi Gemini API");
    }

    private String removeVietnameseAccents(String str) {
        if (str == null) return "";
        String nfd = java.text.Normalizer.normalize(str, java.text.Normalizer.Form.NFD);
        return java.util.regex.Pattern.compile("\\p{InCombiningDiacriticalMarks}+")
                .matcher(nfd)
                .replaceAll("")
                .replace("đ", "d")
                .replace("Đ", "d")
                .toLowerCase()
                .trim();
    }

    /**
     * Tự động phân tích ý định từ ngôn ngữ tự nhiên tiếng Việt (NLU):
     * - Khung giờ thực tế & bữa ăn (Sáng, Trưa, Chiều, Tối, Đêm muộn)
     * - Số lượng người ăn (1 người, 2 người, gia đình, nhóm)
     * - Ngân sách (dưới 100k, 200k, tiết kiệm...)
     * - Khẩu vị cay, ăn chay, dị ứng
     */
    private void enrichRequestFromNaturalPrompt(RAGRecommendRequest req) {
        if (req == null) return;
        String prompt = req.getUserPrompt();
        if (prompt == null) prompt = "";
        String pNorm = removeVietnameseAccents(prompt);

        // 1. Phân tích Khung giờ / Bữa ăn (Time-Aware Context)
        java.time.LocalTime now = java.time.LocalTime.now(java.time.ZoneId.of("Asia/Ho_Chi_Minh"));
        int currentHour = now.getHour();

        String mealContext = null;
        if (pNorm.contains("trua") || pNorm.contains("bua trua") || pNorm.contains("com trua")) {
            mealContext = "Bữa trưa";
        } else if (pNorm.contains("toi") || pNorm.contains("bua toi") || pNorm.contains("com toi")) {
            mealContext = "Bữa tối";
        } else if (pNorm.contains("dem") || pNorm.contains("khuya") || pNorm.contains("an dem") || pNorm.contains("nua dem")) {
            mealContext = "Ăn khuya / Đêm muộn";
        } else if (pNorm.contains("sang") || pNorm.contains("bua sang") || pNorm.contains("diem tam")) {
            mealContext = "Bữa sáng";
        } else if (pNorm.contains("chieu") || pNorm.contains("xe chieu") || pNorm.contains("an vat")) {
            mealContext = "Ăn nhẹ xế chiều";
        } else if (pNorm.contains("gio nay") || pNorm.contains("bay gio") || pNorm.contains("hien tai") || 
                   pNorm.contains("luc nay") || pNorm.contains("dang doi") || pNorm.contains("doi bung")) {
            // Tự động nhận diện theo đồng hồ thời gian thực
            if (currentHour >= 6 && currentHour < 11) {
                mealContext = "Bữa sáng";
            } else if (currentHour >= 11 && currentHour < 14) {
                mealContext = "Bữa trưa";
            } else if (currentHour >= 14 && currentHour < 17) {
                mealContext = "Ăn nhẹ xế chiều";
            } else if (currentHour >= 17 && currentHour < 21) {
                mealContext = "Bữa tối";
            } else {
                mealContext = "Ăn khuya / Đêm muộn";
            }
        } else {
            // Khung giờ mặc định theo thời gian thực tế nếu khách không nêu rõ
            if (currentHour >= 21 || currentHour < 6) {
                mealContext = "Ăn khuya / Đêm muộn";
            } else if (currentHour >= 11 && currentHour < 14) {
                mealContext = "Bữa trưa";
            } else if (currentHour >= 17 && currentHour < 21) {
                mealContext = "Bữa tối";
            }
        }

        if (req.getOccasion() == null || req.getOccasion().isBlank()) {
            if (mealContext != null) {
                req.setOccasion(mealContext);
            }
        }

        // 2. Phân tích Ngân sách (Budget)
        if (req.getMaxBudget() == null) {
            // 2a. Triệu / củ / tr / m (VD: "2 triệu", "2.5 trieu", "1,5tr", "2 củ", "2m")
            java.util.regex.Matcher trieuMatcher = java.util.regex.Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*(?:trieu|tr|cu|m)\\b").matcher(pNorm);
            if (trieuMatcher.find()) {
                try {
                    String numStr = trieuMatcher.group(1).replace(",", ".");
                    double val = Double.parseDouble(numStr);
                    req.setMaxBudget(val * 1_000_000.0);
                } catch (Exception ignored) {}
            }
            // 2b. Nghìn / ngàn / k / lốp (VD: "500k", "300 nghin", "200 ngan", "5 lop")
            if (req.getMaxBudget() == null) {
                java.util.regex.Matcher kMatcher = java.util.regex.Pattern.compile("(\\d+)\\s*(?:k|nghin|ngan|lop)\\b").matcher(pNorm);
                if (kMatcher.find()) {
                    try {
                        int val = Integer.parseInt(kMatcher.group(1));
                        req.setMaxBudget((double) (val * 1000));
                    } catch (Exception ignored) {}
                }
            }
            // 2c. Định dạng số cụ thể (VD: "2.000.000", "500.000", "2000000", "1500000")
            if (req.getMaxBudget() == null) {
                java.util.regex.Matcher rawMatcher = java.util.regex.Pattern.compile("(\\d{1,3}(?:[.]\\d{3})+|\\d{5,9})\\s*(?:d|vnd|dong)?\\b").matcher(pNorm);
                if (rawMatcher.find()) {
                    try {
                        String clean = rawMatcher.group(1).replace(".", "");
                        req.setMaxBudget(Double.parseDouble(clean));
                    } catch (Exception ignored) {}
                }
            }
            // 2d. Từ khóa chung
            if (req.getMaxBudget() == null) {
                if (pNorm.contains("tiet kiem") || pNorm.contains("gia re") || pNorm.contains("hat de") || pNorm.contains("sinh vien")) {
                    req.setMaxBudget(150000.0);
                }
            }
        }

        // 3. Phân tích Số lượng người (Party Size) & Gia đình
        boolean hasFamily = pNorm.contains("gia dinh") || pNorm.contains("di dinh") || pNorm.contains("nha toi") || pNorm.contains("nha minh") || pNorm.contains("ca nha");
        if (hasFamily) {
            if (req.getNumberOfPeople() == null) req.setNumberOfPeople(4);
            if (req.getOccasion() == null || req.getOccasion().isBlank()) req.setOccasion("Bữa ăn gia đình");
        }

        if (req.getNumberOfPeople() == null) {
            if (pNorm.contains("1 nguoi") || pNorm.contains("mot nguoi") || pNorm.contains("1 minh") || 
                pNorm.contains("mot minh") || pNorm.contains("ca nhan") || pNorm.contains("cho toi") || pNorm.contains("cho minh") || pNorm.contains("don than") ||
                pNorm.contains("1 cai") || pNorm.contains("mot cai") || pNorm.contains("1 chiec") || pNorm.contains("mot chiec") || 
                pNorm.contains("1 phan") || pNorm.contains("mot phan") || pNorm.contains("1 banh") || pNorm.contains("mot banh") || 
                pNorm.contains("1 pizza") || pNorm.contains("chi can 1") || pNorm.contains("can 1") || pNorm.contains("tim 1")) {
                req.setNumberOfPeople(1);
            } else if (pNorm.contains("2 nguoi") || pNorm.contains("hai nguoi") || pNorm.contains("cap doi") || 
                       pNorm.contains("hen ho") || pNorm.contains("nguoi yeu") || pNorm.contains("2 dua") || pNorm.contains("hai dua") || pNorm.contains("vo chong")) {
                req.setNumberOfPeople(2);
            } else if (pNorm.contains("3 nguoi") || pNorm.contains("ba nguoi") || pNorm.contains("3 ban") || pNorm.contains("3 dua")) {
                req.setNumberOfPeople(3);
            } else if (pNorm.contains("4 nguoi") || pNorm.contains("bon nguoi") || pNorm.contains("gia dinh nho") || pNorm.contains("4 ban")) {
                req.setNumberOfPeople(4);
            } else if (pNorm.contains("5 nguoi") || pNorm.contains("nam nguoi") || pNorm.contains("5 ban")) {
                req.setNumberOfPeople(5);
            } else if (pNorm.contains("6 nguoi") || pNorm.contains("sau nguoi") || pNorm.contains("6 ban")) {
                req.setNumberOfPeople(6);
            } else if (pNorm.contains("dong nguoi") || pNorm.contains("nhom") || pNorm.contains("tiec") || pNorm.contains("cong ty") || pNorm.contains("lien hoan")) {
                req.setNumberOfPeople(6);
            } else {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d+)\\s*(?:nguoi|ban|khach|pax|dua)").matcher(pNorm);
                if (m.find()) {
                    try {
                        req.setNumberOfPeople(Integer.parseInt(m.group(1)));
                    } catch (Exception ignored) {}
                } else {
                    // Nếu khách KHÔNG nêu số người, chỉ suy luận số người khi có ý định đặt tiệc/combo rõ rệt
                    boolean hasComboWord = pNorm.contains("combo") || pNorm.contains("set") || pNorm.contains("tiec") || pNorm.contains("lien hoan") || pNorm.contains("dai tiec");
                    if (req.getMaxBudget() != null && (hasComboWord || req.getMaxBudget() >= 1_000_000)) {
                        if (req.getMaxBudget() >= 1_500_000) {
                            req.setNumberOfPeople(6); // Tiệc lớn 5-6 người
                        } else if (req.getMaxBudget() >= 800_000) {
                            req.setNumberOfPeople(4); // Nhóm 4 người
                        } else {
                            req.setNumberOfPeople(2); // 2 người
                        }
                    } else {
                        req.setNumberOfPeople(null); // Giữ null để hệ thống ưu tiên món đơn lẻ nếu không yêu cầu combo
                    }
                }
            }
        }

        // 4. Phân tích Ăn chay
        if (req.getIsVegetarian() == null) {
            if (pNorm.contains("chay") || pNorm.contains("an chay") || pNorm.contains("khong thit") || pNorm.contains("thanh dam")) {
                req.setIsVegetarian(true);
            } else {
                req.setIsVegetarian(false);
            }
        }

        // 5. Phân tích Khẩu vị cay
        if (req.getSpicyPreference() == null) {
            if (pNorm.contains("khong cay") || pNorm.contains("dung cay") || pNorm.contains("bot cay") || 
                pNorm.contains("tre em") || pNorm.contains("be nho") || pNorm.contains("tre con")) {
                req.setSpicyPreference(0);
            } else if (pNorm.contains("cay nhe") || pNorm.contains("it cay") || pNorm.contains("the the")) {
                req.setSpicyPreference(1);
            } else if (pNorm.contains("cay vua")) {
                req.setSpicyPreference(2);
            } else if (pNorm.contains("sieu cay") || pNorm.contains("that cay") || pNorm.contains("cay nong") || 
                       pNorm.contains("thich cay") || pNorm.contains("an cay")) {
                req.setSpicyPreference(3);
            }
        }
    }

    /**
     * Thuật toán Heuristic RAG thông minh (chạy khi không có API Key hoặc mạng ngoại tuyến)
     */
    public RAGRecommendResponse executeSmartHeuristicRAG(
            List<Product> products,
            RAGRecommendRequest req,
            List<Coupon> activeCoupons
    ) {
        List<Product> candidates = new ArrayList<>(products);

        // 1. Lọc theo Dị ứng
        if (req.getAllergenExclusions() != null && !req.getAllergenExclusions().isEmpty()) {
            for (String allergen : req.getAllergenExclusions()) {
                String aNorm = removeVietnameseAccents(allergen);
                candidates.removeIf(p -> {
                    String pAllergens = removeVietnameseAccents(p.getAllergens());
                    String pIngredients = removeVietnameseAccents(p.getIngredients());
                    String pName = removeVietnameseAccents(p.getProductName());
                    return pAllergens.contains(aNorm) || pIngredients.contains(aNorm) || pName.contains(aNorm);
                });
            }
        }

        // 2. Lọc theo Ăn chay
        if (Boolean.TRUE.equals(req.getIsVegetarian())) {
            List<Product> veg = candidates.stream()
                    .filter(p -> Boolean.TRUE.equals(p.getIsVegetarian()) || 
                            (p.getProductName() != null && (removeVietnameseAccents(p.getProductName()).contains("chay") || removeVietnameseAccents(p.getProductName()).contains("nam"))))
                    .collect(Collectors.toList());
            if (!veg.isEmpty()) {
                candidates = veg;
            }
        }

        // 3. Lọc theo Độ cay
        if (req.getSpicyPreference() != null) {
            int pref = req.getSpicyPreference();
            List<Product> spicyFiltered = candidates.stream()
                    .filter(p -> (p.getSpicyLevel() != null ? p.getSpicyLevel() : 0) <= pref)
                    .collect(Collectors.toList());
            if (!spicyFiltered.isEmpty()) {
                candidates = spicyFiltered;
            }
        }

        if (candidates.isEmpty()) {
            candidates = new ArrayList<>(products);
        }

        // 4. KIỂM TRA Ý ĐỊNH TRA CỨU / XEM DANH SÁCH MÓN (LIST / SEARCH INTENT)
        String rawPrompt = req.getUserPrompt() != null ? req.getUserPrompt() : "";
        String pNorm = removeVietnameseAccents(rawPrompt);

        boolean isListQuery = pNorm.contains("cho toi xem") || pNorm.contains("cho xem") || 
                              pNorm.contains("danh sach") || pNorm.contains("cac mon") || 
                              pNorm.contains("nhung mon") || pNorm.contains("co nhung") || 
                              pNorm.contains("mon nao") || pNorm.contains("liet ke") || 
                              pNorm.contains("tim cac mon") || pNorm.contains("co cac mon") ||
                              pNorm.contains("co mon nao") || pNorm.contains("xem cac") ||
                              pNorm.contains("tim mon") || pNorm.contains("xem menu");

        if (isListQuery) {
            List<Product> matchedList = new ArrayList<>(candidates);

            // 4a. Lọc theo danh mục/loại món
            if (pNorm.contains("pizza")) {
                matchedList = matchedList.stream().filter(p -> {
                    String cat = p.getCategory() != null && p.getCategory().getCategoryName() != null ? 
                            removeVietnameseAccents(p.getCategory().getCategoryName()) : "";
                    String name = removeVietnameseAccents(p.getProductName());
                    return cat.contains("pizza") || name.contains("pizza");
                }).collect(Collectors.toList());
            } else if (pNorm.contains("mi") || pNorm.contains("pasta") || pNorm.contains("spaghetti") || pNorm.contains("lasagna")) {
                matchedList = matchedList.stream().filter(p -> {
                    String cat = p.getCategory() != null && p.getCategory().getCategoryName() != null ? 
                            removeVietnameseAccents(p.getCategory().getCategoryName()) : "";
                    String name = removeVietnameseAccents(p.getProductName());
                    return cat.contains("mi") || name.contains("mi") || name.contains("lasagna");
                }).collect(Collectors.toList());
            } else if (pNorm.contains("salad") || pNorm.contains("khai vi")) {
                matchedList = matchedList.stream().filter(p -> {
                    String cat = p.getCategory() != null && p.getCategory().getCategoryName() != null ? 
                            removeVietnameseAccents(p.getCategory().getCategoryName()) : "";
                    String name = removeVietnameseAccents(p.getProductName());
                    return cat.contains("salad") || cat.contains("khai vi") || name.contains("salad");
                }).collect(Collectors.toList());
            } else if (pNorm.contains("nuoc") || pNorm.contains("do uong") || pNorm.contains("drink")) {
                matchedList = matchedList.stream().filter(p -> {
                    String cat = p.getCategory() != null && p.getCategory().getCategoryName() != null ? 
                            removeVietnameseAccents(p.getCategory().getCategoryName()) : "";
                    String name = removeVietnameseAccents(p.getProductName());
                    return cat.contains("uong") || cat.contains("nuoc") || name.contains("coca") || name.contains("sprite");
                }).collect(Collectors.toList());
            } else if (pNorm.contains("trang mieng") || pNorm.contains("sua chua") || pNorm.contains("pudding")) {
                matchedList = matchedList.stream().filter(p -> {
                    String cat = p.getCategory() != null && p.getCategory().getCategoryName() != null ? 
                            removeVietnameseAccents(p.getCategory().getCategoryName()) : "";
                    String name = removeVietnameseAccents(p.getProductName());
                    return cat.contains("trang mieng") || name.contains("sua chua") || name.contains("pudding");
                }).collect(Collectors.toList());
            }

            // 4b. Lọc theo nguyên liệu
            if (pNorm.contains("hai san") || pNorm.contains("seafood")) {
                matchedList = matchedList.stream().filter(p -> {
                    String ing = removeVietnameseAccents(p.getIngredients());
                    String name = removeVietnameseAccents(p.getProductName());
                    String all = removeVietnameseAccents(p.getAllergens());
                    return ing.contains("tom") || ing.contains("muc") || ing.contains("ca hoi") || 
                           ing.contains("so diep") || ing.contains("ngheu") || name.contains("hai san") || all.contains("hai san");
                }).collect(Collectors.toList());
            } else if (pNorm.contains("bo") || pNorm.contains("beef")) {
                matchedList = matchedList.stream().filter(p -> {
                    String ing = removeVietnameseAccents(p.getIngredients());
                    String name = removeVietnameseAccents(p.getProductName());
                    return ing.contains("bo") || name.contains("bo");
                }).collect(Collectors.toList());
            } else if (pNorm.contains("ga") || pNorm.contains("chicken")) {
                matchedList = matchedList.stream().filter(p -> {
                    String ing = removeVietnameseAccents(p.getIngredients());
                    String name = removeVietnameseAccents(p.getProductName());
                    return ing.contains("ga") || name.contains("ga");
                }).collect(Collectors.toList());
            } else if (pNorm.contains("ngot") || pNorm.contains("chua ngot") || pNorm.contains("dua") || pNorm.contains("trai cay")) {
                matchedList = matchedList.stream().filter(p -> {
                    String ing = removeVietnameseAccents(p.getIngredients());
                    String name = removeVietnameseAccents(p.getProductName());
                    String desc = removeVietnameseAccents(p.getDescription());
                    return ing.contains("dua") || ing.contains("ngot") || desc.contains("ngot") || 
                           desc.contains("chua ngot") || name.contains("hawaiian") || name.contains("so diep") ||
                           name.contains("pudding") || name.contains("sua chua");
                }).collect(Collectors.toList());
            }

            if (!matchedList.isEmpty()) {
                List<RAGRecommendResponse.RecommendedItem> listItems = new ArrayList<>();
                for (Product p : matchedList) {
                    String reasonText = p.getDescription() != null ? p.getDescription() : 
                            ("Nguyên liệu: " + (p.getIngredients() != null ? p.getIngredients() : "Tươi ngon"));
                    if (p.getSpicyLevel() != null && p.getSpicyLevel() == 0) {
                        reasonText = "✓ Độ cay 0/3 (Không cay). " + reasonText;
                    }
                    listItems.add(RAGRecommendResponse.RecommendedItem.builder()
                            .productId(p.getProductId())
                            .productName(p.getProductName())
                            .price(p.getPrice())
                            .quantity(1)
                            .reason(reasonText)
                            .build());
                }

                String voucherNote = (activeCoupons != null && !activeCoupons.isEmpty()) ?
                        "Mẹo: Bạn có thể chọn món yêu thích rồi áp mã " + activeCoupons.get(0).getCode() + " khi thanh toán!" :
                        "Bạn có thể chọn món ưng ý và nhấn nút '+ Giỏ' để đặt món ngay nhé!";

                String spicyNote = (req.getSpicyPreference() != null && req.getSpicyPreference() == 0) ? " không cay" : "";
                String categoryTitle = pNorm.contains("pizza") ? "Pizza" : (pNorm.contains("mi") ? "Mì Ý" : "món ăn");
                String reasoningMsg = String.format(
                        "Deli AI xin gửi đến bạn danh sách %d món %s%s phù hợp với yêu cầu:\n%s\nBạn có thể chọn từng món ưng ý bên dưới nhé!",
                        listItems.size(),
                        categoryTitle,
                        spicyNote,
                        listItems.stream().map(it -> "• " + it.getProductName() + " (" + String.format("%,.0fđ", it.getPrice()) + ")").collect(Collectors.joining("\n"))
                );

                return RAGRecommendResponse.builder()
                        .reasoning(reasoningMsg)
                        .suggestedOccasion("Tra cứu danh sách món theo yêu cầu")
                        .estimatedTotalPrice(listItems.stream().mapToDouble(RAGRecommendResponse.RecommendedItem::getPrice).sum())
                        .discountOrVoucherNote(voucherNote)
                        .recommendedItems(listItems)
                        .build();
            }
        }

        // 5. Phân loại sản phẩm chuẩn xác theo danh mục & tên sản phẩm (CHO COMBO)
        List<Product> mains = candidates.stream()
                .filter(p -> {
                    String cat = p.getCategory() != null && p.getCategory().getCategoryName() != null ? 
                            removeVietnameseAccents(p.getCategory().getCategoryName()) : "";
                    String name = removeVietnameseAccents(p.getProductName());
                    return cat.contains("pizza") || cat.contains("mi") || name.contains("pizza") || name.contains("mi") || name.contains("lasagna");
                })
                .collect(Collectors.toList());
        if (mains.isEmpty()) {
            mains = candidates.stream()
                    .filter(p -> {
                        String name = removeVietnameseAccents(p.getProductName());
                        return name.contains("pizza") || name.contains("mi") || name.contains("lasagna");
                    })
                    .collect(Collectors.toList());
        }
        if (mains.isEmpty()) mains = candidates;

        List<Product> drinks = candidates.stream()
                .filter(p -> {
                    String cat = p.getCategory() != null && p.getCategory().getCategoryName() != null ? 
                            removeVietnameseAccents(p.getCategory().getCategoryName()) : "";
                    String name = removeVietnameseAccents(p.getProductName());
                    return cat.contains("uong") || cat.contains("nuoc") || cat.contains("drink") || 
                           name.contains("coca") || name.contains("sprite") || name.contains("pepsi") || name.contains("tra");
                })
                .collect(Collectors.toList());

        List<Product> sides = candidates.stream()
                .filter(p -> {
                    String cat = p.getCategory() != null && p.getCategory().getCategoryName() != null ? 
                            removeVietnameseAccents(p.getCategory().getCategoryName()) : "";
                    String name = removeVietnameseAccents(p.getProductName());
                    return cat.contains("khai vi") || cat.contains("salad") || name.contains("salad") || 
                           name.contains("khoai tay") || name.contains("cuon");
                })
                .collect(Collectors.toList());

        List<Product> desserts = candidates.stream()
                .filter(p -> {
                    String cat = p.getCategory() != null && p.getCategory().getCategoryName() != null ? 
                            removeVietnameseAccents(p.getCategory().getCategoryName()) : "";
                    String name = removeVietnameseAccents(p.getProductName());
                    return cat.contains("trang mieng") || cat.contains("pudding") || cat.contains("sua chua") || 
                           name.contains("pudding") || name.contains("sua chua") || name.contains("matcha");
                })
                .collect(Collectors.toList());

        // 5. Chấm điểm món chính tốt nhất (Scoring Engine)
        String queryNorm = removeVietnameseAccents((req.getUserPrompt() != null ? req.getUserPrompt() : "") + " " +
                (req.getOccasion() != null ? req.getOccasion() : ""));

        boolean isSingleItem = pNorm.contains("1 cai") || pNorm.contains("mot cai") || 
                               pNorm.contains("1 chiec") || pNorm.contains("mot chiec") || 
                               pNorm.contains("1 phan") || pNorm.contains("mot phan") || 
                               pNorm.contains("chi can 1") || pNorm.contains("chi mua 1") || 
                               pNorm.contains("chi lay 1") || pNorm.contains("muon 1") || 
                               pNorm.contains("can 1") || pNorm.contains("tim 1") || 
                               pNorm.contains("goi y 1") || pNorm.contains("chon 1") || 
                               pNorm.contains("1 banh") || pNorm.contains("mot banh") ||
                               pNorm.contains("1 pizza") || pNorm.contains("mot pizza");

        boolean hasFamily = pNorm.contains("gia dinh") || pNorm.contains("di dinh") || pNorm.contains("nha toi") || pNorm.contains("nha minh") || pNorm.contains("ca nha");
        boolean hasPeopleCount = pNorm.matches(".*\\b(?:\\d+|mot|hai|ba|bon|nam|sau|bay|tam|chin|muoi)\\s*(?:nguoi|pax|khach|ban|dua)\\b.*") || pNorm.contains("may nguoi") || pNorm.contains("nhom");
        boolean hasComboWord = pNorm.contains("combo") || pNorm.contains("set") || pNorm.contains("tiec") || pNorm.contains("lien hoan") || pNorm.contains("hen ho") || pNorm.contains("cap doi");
        boolean isComboIntent = (hasFamily || hasPeopleCount || hasComboWord) && !isSingleItem;

        boolean wantsDrink = queryNorm.contains("nuoc") || queryNorm.contains("do uong") || queryNorm.contains("drink") || queryNorm.contains("coca") || queryNorm.contains("sprite") || queryNorm.contains("tra");
        boolean wantsPasta = queryNorm.contains("mi") || queryNorm.contains("pasta") || queryNorm.contains("spaghetti") || queryNorm.contains("lasagna");
        boolean wantsDessert = queryNorm.contains("pudding") || queryNorm.contains("sua chua") || queryNorm.contains("trang mieng") || queryNorm.contains("kem");
        boolean wantsSalad = (queryNorm.contains("salad") || queryNorm.contains("khai vi")) && !queryNorm.contains("pizza");

        if (wantsDrink && !drinks.isEmpty()) {
            mains = drinks;
        } else if (wantsDessert && !desserts.isEmpty()) {
            mains = desserts;
        } else if (wantsSalad && !sides.isEmpty()) {
            mains = sides;
        } else if (wantsPasta) {
            List<Product> pastaList = mains.stream().filter(p -> {
                String cat = p.getCategory() != null && p.getCategory().getCategoryName() != null ? removeVietnameseAccents(p.getCategory().getCategoryName()) : "";
                String name = removeVietnameseAccents(p.getProductName());
                return cat.contains("mi") || name.contains("mi") || name.contains("lasagna") || name.contains("pasta");
            }).collect(Collectors.toList());
            if (!pastaList.isEmpty()) mains = pastaList;
        } else if (!isComboIntent) {
            // Khi khách chỉ hỏi pizza hoặc không yêu cầu combo:
            List<Product> pizzaList = mains.stream().filter(p -> {
                String cat = p.getCategory() != null && p.getCategory().getCategoryName() != null ? removeVietnameseAccents(p.getCategory().getCategoryName()) : "";
                String name = removeVietnameseAccents(p.getProductName());
                return cat.contains("pizza") || name.contains("pizza");
            }).collect(Collectors.toList());
            if (!pizzaList.isEmpty()) mains = pizzaList;
        }

        int people = (!isComboIntent || isSingleItem) ? 1 : ((req.getNumberOfPeople() != null && req.getNumberOfPeople() > 0) ? req.getNumberOfPeople() : 2);
        String occasionNorm = removeVietnameseAccents(req.getOccasion() != null ? req.getOccasion() : "");

        Product bestMain = mains.get(0);
        int highestScore = -999;

        for (Product p : mains) {
            int score = 0;
            String pName = removeVietnameseAccents(p.getProductName());
            String pOcc = removeVietnameseAccents(p.getOccasions());
            String pIng = removeVietnameseAccents(p.getIngredients());
            String pDesc = removeVietnameseAccents(p.getDescription());
            String catName = p.getCategory() != null && p.getCategory().getCategoryName() != null ? 
                    removeVietnameseAccents(p.getCategory().getCategoryName()) : "";

            // A. Khớp loại món (Mì vs Pizza)
            boolean wantsPastaCheck = queryNorm.contains("mi") || queryNorm.contains("pasta") || queryNorm.contains("spaghetti") || queryNorm.contains("lasagna");
            boolean wantsPizzaCheck = queryNorm.contains("pizza") || queryNorm.contains("banh pizza") || queryNorm.contains("cai pizza") || queryNorm.contains("chiec pizza");
            if (wantsPastaCheck) {
                if (catName.contains("mi") || pName.contains("mi") || pName.contains("lasagna")) score += 40;
                else score -= 25;
            }
            if (wantsPizzaCheck) {
                if (catName.contains("pizza") || pName.contains("pizza")) score += 40;
                else score -= 25;
            }

            // B. Khớp hương vị đặc trưng (Ngọt / Chua ngọt / Dứa / Hoa quả)
            boolean wantsSweet = queryNorm.contains("ngot") || queryNorm.contains("chua ngot") || queryNorm.contains("trai cay") || queryNorm.contains("hoa qua") || queryNorm.contains("dua") || queryNorm.contains("thom");
            if (wantsSweet) {
                if (pName.contains("hawaiian") || pIng.contains("dua") || pDesc.contains("chua ngot") || pDesc.contains("ngot")) score += 95;
                if (pName.contains("so diep") || pDesc.contains("miso ngot") || pIng.contains("miso ngot")) score += 60;
                // Khi khách tìm món ngọt, trừ điểm nặng các món cá hồi, kebab, xúc xích cay:
                if (pName.contains("ca hoi") || pName.contains("kebab") || pName.contains("chorizo") || pName.contains("milano") || pName.contains("parma")) score -= 70;
            }

            // C. Khớp nguyên liệu & từ khóa chi tiết
            if ((queryNorm.contains("ga") || queryNorm.contains("chicken")) && (pName.contains("ga") || pIng.contains("ga"))) score += 30;
            if ((queryNorm.contains("bo") || queryNorm.contains("beef")) && (pName.contains("bo") || pIng.contains("bo") || pName.contains("kebab"))) score += 25;
            if ((queryNorm.contains("hai san") || queryNorm.contains("tom") || queryNorm.contains("muc") || queryNorm.contains("ngheu") || 
                 queryNorm.contains("so diep") || queryNorm.contains("seafood"))
                    && (pName.contains("hai san") || pName.contains("so diep") || pName.contains("ngheu") || pIng.contains("tom") || pIng.contains("muc"))) score += 25;
            if ((queryNorm.contains("dua") || queryNorm.contains("thom") || queryNorm.contains("hawaiian")) && pName.contains("hawaiian")) score += 35;
            if (queryNorm.contains("kebab") && pName.contains("kebab")) score += 35;
            if (queryNorm.contains("ca hoi") && pName.contains("ca hoi")) score += 35;
            if (queryNorm.contains("so diep") && pName.contains("so diep")) score += 35;
            if (queryNorm.contains("lasagna") && pName.contains("lasagna")) score += 35;
            if (queryNorm.contains("ngheu") && pName.contains("ngheu")) score += 35;
            if ((queryNorm.contains("parma") || queryNorm.contains("thit nguoi")) && pName.contains("parma")) score += 35;
            if (queryNorm.contains("margherita") && pName.contains("margherita")) score += 25;
            if ((queryNorm.contains("4 vi") || queryNorm.contains("bon vi") || queryNorm.contains("mix")) && pName.contains("4 vi")) score += 35;
            if ((queryNorm.contains("xuc xich") || queryNorm.contains("salami") || queryNorm.contains("chorizo")) && 
                (pName.contains("milano") || pName.contains("chorizo") || pIng.contains("xuc xich"))) score += 30;

            // D. Khớp độ béo phô mai & độ cay
            if ((queryNorm.contains("pho mai") || queryNorm.contains("cheese") || queryNorm.contains("beo")) && p.getCheeseLevel() != null && p.getCheeseLevel() >= 4) score += 15;
            if ((queryNorm.contains("cay") || queryNorm.contains("nhau") || queryNorm.contains("bia")) && p.getSpicyLevel() != null && p.getSpicyLevel() >= 2) score += 20;
            if ((queryNorm.contains("khong cay") || queryNorm.contains("it cay") || queryNorm.contains("tre em") || queryNorm.contains("be")) && p.getSpicyLevel() != null && p.getSpicyLevel() == 0) score += 15;

            // E. Khớp Khung giờ & Bữa ăn (Time of Day Intelligence)
            if (isComboIntent) {
                if (occasionNorm.contains("trua")) {
                    if (pName.contains("bo bam") || pName.contains("tom toi") || pName.contains("ngheu") || pName.contains("margherita")) score += 20;
                } else if (occasionNorm.contains("dem") || occasionNorm.contains("khuya")) {
                    if (pName.contains("kebab") || pName.contains("tom toi") || pName.contains("milano") || pName.contains("margherita")) score += 20;
                } else if (occasionNorm.contains("toi")) {
                    if (pName.contains("ca hoi") || pName.contains("so diep") || pName.contains("4 vi") || pName.contains("lasagna") || pName.contains("parma")) score += 20;
                } else if (occasionNorm.contains("sang") || occasionNorm.contains("chieu")) {
                    if (pName.contains("ngheu") || pName.contains("margherita")) score += 15;
                }
            }

            // F. Khớp Số lượng người
            if (people == 1) {
                if (p.getPrice() <= 150000 || (p.getServingSize() != null && p.getServingSize().contains("1"))) score += 20;
                if (pName.contains("4 vi")) score -= 25;
            } else if (people == 2) {
                if (pName.contains("ca hoi") || pName.contains("margherita") || pName.contains("hawaiian") || pName.contains("parma")) score += 15;
            } else if (people >= 3) {
                if (pName.contains("4 vi") || (p.getServingSize() != null && (p.getServingSize().contains("3") || p.getServingSize().contains("4")))) score += 25;
            }

            // G. Ngân sách
            if (req.getMaxBudget() != null) {
                if (p.getPrice() > req.getMaxBudget()) {
                    score -= 50;
                } else if (p.getPrice() <= req.getMaxBudget() * 0.7) {
                    score += 10;
                }
            }

            if (score > highestScore) {
                highestScore = score;
                bestMain = p;
            }
        }

        List<RAGRecommendResponse.RecommendedItem> selectedItems = new ArrayList<>();
        double currentTotal = 0;
        int mainQty = (people >= 4 && isComboIntent) ? 2 : 1;

        // Thêm món chính
        selectedItems.add(RAGRecommendResponse.RecommendedItem.builder()
                .productId(bestMain.getProductId())
                .productName(bestMain.getProductName())
                .price(bestMain.getPrice())
                .quantity(mainQty)
                .reason(bestMain.getDescription() != null ? bestMain.getDescription() : "Món chính chuẩn vị và đậm đà.")
                .build());
        currentTotal += bestMain.getPrice() * mainQty;

        String pairsNorm = removeVietnameseAccents(bestMain.getPairsWith());

        // CHỈ PHỐI THÊM COMBO KHI KHÁCH ĐI GIA ĐÌNH HOẶC NHÓM NGƯỜI (COMBO INTENT)
        if (isComboIntent && !isSingleItem) {
            // 6. Food Pairing: Món phụ / Khai vị
            boolean skipSide = (people == 1 && req.getMaxBudget() != null && req.getMaxBudget() <= 150000);
            Product bestSide = null;

            if (!skipSide) {
                if (queryNorm.contains("salad") || queryNorm.contains("rau") || queryNorm.contains("eat clean")) {
                    for (Product s : sides) {
                        if (removeVietnameseAccents(s.getProductName()).contains("salad")) {
                            bestSide = s;
                            break;
                        }
                    }
                }
                if (bestSide == null) {
                    for (Product s : sides) {
                        if (pairsNorm.contains(removeVietnameseAccents(s.getProductName()))) {
                            bestSide = s;
                            break;
                        }
                    }
                }
                if (bestSide == null && !sides.isEmpty()) {
                    bestSide = sides.get(0);
                }

                if (bestSide != null) {
                    if (req.getMaxBudget() == null || (currentTotal + bestSide.getPrice() <= req.getMaxBudget())) {
                        selectedItems.add(RAGRecommendResponse.RecommendedItem.builder()
                                .productId(bestSide.getProductId())
                                .productName(bestSide.getProductName())
                                .price(bestSide.getPrice())
                                .quantity(1)
                                .reason("Món ăn kèm hoàn hảo: Cân bằng vị béo của phô mai, thanh mát và kích thích vị giác.")
                                .build());
                        currentTotal += bestSide.getPrice();
                    }
                }
            }

            // 7. Food Pairing: Đồ uống
            Product bestDrink = null;
            for (Product d : drinks) {
                if (pairsNorm.contains(removeVietnameseAccents(d.getProductName()))) {
                    bestDrink = d;
                    break;
                }
            }
            if (bestDrink == null && !drinks.isEmpty()) {
                bestDrink = drinks.get(0);
            }

            if (bestDrink != null) {
                int drinkQty = (people <= 2) ? people : Math.min(people, 3);
                double drinkCost = bestDrink.getPrice() * drinkQty;
                if (req.getMaxBudget() == null || (currentTotal + drinkCost <= req.getMaxBudget())) {
                    selectedItems.add(RAGRecommendResponse.RecommendedItem.builder()
                            .productId(bestDrink.getProductId())
                            .productName(bestDrink.getProductName())
                            .price(bestDrink.getPrice())
                            .quantity(drinkQty)
                            .reason("Đồ uống mát lạnh sảng khoái, giải nhiệt và tròn vị cho bữa ăn.")
                            .build());
                    currentTotal += drinkCost;
                }
            }

            // 8. Tráng miệng (nếu còn ngân sách)
            if (!desserts.isEmpty() && (people > 1 || queryNorm.contains("trang mieng") || queryNorm.contains("pudding"))) {
                Product bestDessert = null;
                for (Product ds : desserts) {
                    if (pairsNorm.contains(removeVietnameseAccents(ds.getProductName()))) {
                        bestDessert = ds;
                        break;
                    }
                }
                if (bestDessert == null) {
                    bestDessert = desserts.get(0);
                }

                int dessertQty = (people == 1) ? 1 : Math.min(people, 2);
                double dessertCost = bestDessert.getPrice() * dessertQty;
                if (req.getMaxBudget() == null || (currentTotal + dessertCost <= req.getMaxBudget())) {
                    selectedItems.add(RAGRecommendResponse.RecommendedItem.builder()
                            .productId(bestDessert.getProductId())
                            .productName(bestDessert.getProductName())
                            .price(bestDessert.getPrice())
                            .quantity(dessertQty)
                            .reason("Tráng miệng ngọt ngào trọn vẹn kết thúc bữa ăn hoàn hảo.")
                            .build());
                    currentTotal += dessertCost;
                }
            }

            // 9. Bổ sung món chính nếu ngân sách còn dư dả (VD: ngân sách 1tr - 2tr)
            if (req.getMaxBudget() != null && currentTotal < req.getMaxBudget() * 0.75) {
                for (Product extraMain : mains) {
                    if (extraMain.getProductId().equals(bestMain.getProductId())) continue;
                    if (currentTotal + extraMain.getPrice() <= req.getMaxBudget()) {
                        selectedItems.add(RAGRecommendResponse.RecommendedItem.builder()
                                .productId(extraMain.getProductId())
                                .productName(extraMain.getProductName())
                                .price(extraMain.getPrice())
                                .quantity(1)
                                .reason("Bổ sung món chính cao cấp đa dạng hương vị cho đại tiệc trọn vẹn theo ngân sách.")
                                .build());
                        currentTotal += extraMain.getPrice();
                    }
                    if (currentTotal >= req.getMaxBudget() * 0.85) break;
                }
            }
        }

        // Lời giải thích tổng thể & Thời điểm
        String timePrefix = "";
        if (occasionNorm.contains("dem") || occasionNorm.contains("khuya")) {
            timePrefix = "🌙 **Khung giờ đêm muộn:** ";
        } else if (occasionNorm.contains("trua")) {
            timePrefix = "☀️ **Bữa trưa tiếp năng lượng:** ";
        } else if (occasionNorm.contains("toi")) {
            timePrefix = "✨ **Bữa tối sum vầy:** ";
        } else if (occasionNorm.contains("sang")) {
            timePrefix = "🌅 **Bữa sáng nhẹ nhàng:** ";
        } else if (occasionNorm.contains("chieu")) {
            timePrefix = "🍵 **Ăn vặt xế chiều:** ";
        }

        String voucherNote = activeCoupons != null && !activeCoupons.isEmpty() ?
                "Áp dụng mã " + activeCoupons.get(0).getCode() + " để nhận ưu đãi ngay hôm nay!" :
                "Mọi món ăn đều được chuẩn bị tươi mới nóng hổi từ căn bếp của Pizza Deli.";

        boolean wantsSweet = queryNorm.contains("ngot") || queryNorm.contains("chua ngot") || queryNorm.contains("trai cay") || queryNorm.contains("dua") || queryNorm.contains("thom");
        String reasoningMsg;
        if (!isComboIntent || isSingleItem) {
            String catLabel = wantsDrink ? "Đồ uống" : (wantsPasta ? "Mì Ý" : (wantsDessert ? "Tráng miệng" : (wantsSalad ? "Khai vị / Salad" : "Pizza")));
            if (wantsSweet) {
                String sweetDesc = bestMain.getDescription() != null ? bestMain.getDescription() : "vị ngọt dịu và thơm béo đặc trưng";
                reasoningMsg = String.format("🍕 **Gợi ý %s chuẩn vị:** Bạn đang tìm món mang hương vị ngọt/chua ngọt, Deli AI xin giới thiệu món **%s** (%s đ). %s. Đây là sự lựa chọn chuẩn vị ngọt ngào nhất tại Pizza Deli dành cho bạn!",
                        catLabel, bestMain.getProductName(), String.format("%,.0f", bestMain.getPrice()), sweetDesc);
            } else {
                reasoningMsg = String.format("🍽️ **Gợi ý %s đúng yêu cầu:** Deli AI gửi đến bạn món **%s** (%s đ). %s Món ăn được chọn lọc tươi ngon theo đúng yêu cầu của bạn!",
                        catLabel, bestMain.getProductName(), String.format("%,.0f", bestMain.getPrice()),
                        bestMain.getDescription() != null ? bestMain.getDescription() : "");
            }
        } else {
            reasoningMsg = String.format(
                    "%sDeli AI đề xuất bộ combo cá nhân hóa xoay quanh món chính \"%s\" (chứa %s). Các món ăn kèm được ghép nối chuẩn nguyên tắc Food Pairing giúp cân bằng độ béo ngậy và độ cay, tạo nên trải nghiệm ẩm thực trọn vẹn cho %d người.",
                    timePrefix,
                    bestMain.getProductName(),
                    bestMain.getIngredients() != null ? bestMain.getIngredients() : "nguyên liệu tươi ngon",
                    people
            );
        }

        String suggestedOccasion = (!isComboIntent || isSingleItem) ? "Thưởng thức món theo sở thích" : 
                (hasFamily ? "Bữa ăn gia đình ấm cúng" : (bestMain.getOccasions() != null ? bestMain.getOccasions() : "Bữa ngon cùng Deli"));

        return RAGRecommendResponse.builder()
                .reasoning(reasoningMsg)
                .suggestedOccasion(suggestedOccasion)
                .estimatedTotalPrice(currentTotal)
                .discountOrVoucherNote(voucherNote)
                .recommendedItems(selectedItems)
                .build();
    }

    private void enrichRecommendedItemsMetadata(RAGRecommendResponse response, List<Product> products) {
        if (response == null || response.getRecommendedItems() == null) return;

        Map<Integer, Product> productMap = products.stream()
                .collect(Collectors.toMap(Product::getProductId, p -> p, (a, b) -> a));

        for (RAGRecommendResponse.RecommendedItem item : response.getRecommendedItems()) {
            Product p = productMap.get(item.getProductId());
            if (p != null) {
                if (item.getPrice() == null) item.setPrice(p.getPrice());
                item.setSpicyLevel(p.getSpicyLevel() != null ? p.getSpicyLevel() : 0);
                item.setCalories(p.getCalories());
                item.setPairsWith(p.getPairsWith());
                item.setIngredients(p.getIngredients());

                List<Image> images = imageRepository.findByProductProductId(p.getProductId());
                if (!images.isEmpty() && images.get(0).getImageUrl() != null) {
                    item.setImageUrl(images.get(0).getImageUrl());
                } else {
                    item.setImageUrl("img/default-product.png");
                }
            }
        }
    }
}
