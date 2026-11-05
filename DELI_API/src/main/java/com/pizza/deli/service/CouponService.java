package com.pizza.deli.service;

import com.pizza.deli.dto.CouponDTO;
import com.pizza.deli.dto.CouponValidateResponse;
import com.pizza.deli.model.Coupon;
import com.pizza.deli.repository.CouponRepository;
import jakarta.annotation.PostConstruct;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    @Autowired
    private ModelMapper modelMapper;

    @PostConstruct
    public void initDefaultCoupons() {
        try {
            if (couponRepository.count() == 0) {
                List<Coupon> defaultCoupons = List.of(
                    Coupon.builder()
                        .code("PIZZA50")
                        .title("Giảm 50.000đ")
                        .description("Giảm ngay 50.000đ cho đơn hàng từ 200.000đ")
                        .discountType("FIXED")
                        .discountValue(50000.0)
                        .minOrder(200000.0)
                        .isActive(true)
                        .badge("HOT")
                        .build(),
                    Coupon.builder()
                        .code("FREESHIP")
                        .title("Miễn phí vận chuyển")
                        .description("Miễn phí giao hàng (30.000đ) cho đơn từ 150.000đ")
                        .discountType("SHIPPING")
                        .discountValue(30000.0)
                        .minOrder(150000.0)
                        .isActive(true)
                        .badge("TIẾT KIỆM")
                        .build(),
                    Coupon.builder()
                        .code("DELI10")
                        .title("Giảm 10% Tổng Đơn")
                        .description("Giảm 10% (tối đa 60.000đ) áp dụng cho mọi đơn hàng")
                        .discountType("PERCENT")
                        .discountValue(10.0)
                        .maxDiscount(60000.0)
                        .minOrder(0.0)
                        .isActive(true)
                        .badge("CHO MỌI ĐƠN")
                        .build(),
                    Coupon.builder()
                        .code("VIP100")
                        .title("VIP Giảm 100.000đ")
                        .description("Giảm 100.000đ cho hóa đơn từ 400.000đ trở lên")
                        .discountType("FIXED")
                        .discountValue(100000.0)
                        .minOrder(400000.0)
                        .isActive(true)
                        .badge("VIP")
                        .build()
                );
                couponRepository.saveAll(defaultCoupons);
            }
        } catch (Exception e) {
            // Non-blocking log if DB is in read-only or during initialization
            System.err.println("Init default coupons warning: " + e.getMessage());
        }
    }

    public List<CouponDTO> getActiveCoupons() {
        try {
            return couponRepository.findByIsActiveTrue()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        } catch (Exception e) {
            return getDefaultFallbackCoupons();
        }
    }

    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll()
            .stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public CouponValidateResponse validateCoupon(String code, Double orderTotal) {
        if (code == null || code.trim().isEmpty()) {
            return CouponValidateResponse.builder()
                .valid(false)
                .message("Mã giảm giá không được để trống")
                .discountAmount(0.0)
                .finalTotal(orderTotal)
                .build();
        }

        String cleanCode = code.trim().toUpperCase();
        double currentTotal = orderTotal != null ? orderTotal : 0.0;

        Optional<Coupon> couponOpt = couponRepository.findByCodeIgnoreCaseAndIsActiveTrue(cleanCode);
        Coupon coupon;

        if (couponOpt.isPresent()) {
            coupon = couponOpt.get();
        } else {
            // Fallback check from defaults in case DB connection is offline
            coupon = getDefaultFallbackCoupons().stream()
                .filter(c -> c.getCode().equalsIgnoreCase(cleanCode))
                .findFirst()
                .map(dto -> modelMapper.map(dto, Coupon.class))
                .orElse(null);
        }

        if (coupon == null) {
            return CouponValidateResponse.builder()
                .valid(false)
                .code(cleanCode)
                .message("Mã giảm giá '" + cleanCode + "' không tồn tại hoặc đã hết hạn")
                .discountAmount(0.0)
                .finalTotal(currentTotal)
                .build();
        }

        if (coupon.getMinOrder() != null && currentTotal < coupon.getMinOrder()) {
            double needed = coupon.getMinOrder() - currentTotal;
            return CouponValidateResponse.builder()
                .valid(false)
                .code(cleanCode)
                .message("Đơn hàng chưa đạt mức tối thiểu. Mua thêm " + String.format("%,.0f", needed) + " đ để dùng mã " + cleanCode)
                .discountAmount(0.0)
                .finalTotal(currentTotal)
                .coupon(convertToDTO(coupon))
                .build();
        }

        double discount = 0.0;
        if ("PERCENT".equalsIgnoreCase(coupon.getDiscountType())) {
            discount = currentTotal * (coupon.getDiscountValue() / 100.0);
            if (coupon.getMaxDiscount() != null && discount > coupon.getMaxDiscount()) {
                discount = coupon.getMaxDiscount();
            }
        } else {
            // FIXED hoặc SHIPPING
            discount = coupon.getDiscountValue() != null ? coupon.getDiscountValue() : 0.0;
        }

        discount = Math.min(currentTotal, discount);
        double finalTotal = Math.max(0.0, currentTotal - discount);

        return CouponValidateResponse.builder()
            .valid(true)
            .code(cleanCode)
            .message("Áp dụng mã giảm giá thành công: " + coupon.getTitle())
            .discountAmount(discount)
            .finalTotal(finalTotal)
            .coupon(convertToDTO(coupon))
            .build();
    }

    public CouponDTO createCoupon(CouponDTO dto) {
        Coupon coupon = modelMapper.map(dto, Coupon.class);
        if (coupon.getIsActive() == null) {
            coupon.setIsActive(true);
        }
        Coupon saved = couponRepository.save(coupon);
        return convertToDTO(saved);
    }

    public boolean deleteCoupon(Long id) {
        if (couponRepository.existsById(id)) {
            couponRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private CouponDTO convertToDTO(Coupon coupon) {
        return modelMapper.map(coupon, CouponDTO.class);
    }

    private List<CouponDTO> getDefaultFallbackCoupons() {
        return List.of(
            CouponDTO.builder()
                .couponId(1L)
                .code("PIZZA50")
                .title("Giảm 50.000đ")
                .description("Giảm ngay 50.000đ cho đơn hàng từ 200.000đ")
                .discountType("FIXED")
                .discountValue(50000.0)
                .minOrder(200000.0)
                .isActive(true)
                .badge("HOT")
                .build(),
            CouponDTO.builder()
                .couponId(2L)
                .code("FREESHIP")
                .title("Miễn phí vận chuyển")
                .description("Miễn phí giao hàng (30.000đ) cho đơn từ 150.000đ")
                .discountType("SHIPPING")
                .discountValue(30000.0)
                .minOrder(150000.0)
                .isActive(true)
                .badge("TIẾT KIỆM")
                .build(),
            CouponDTO.builder()
                .couponId(3L)
                .code("DELI10")
                .title("Giảm 10% Tổng Đơn")
                .description("Giảm 10% (tối đa 60.000đ) áp dụng cho mọi đơn hàng")
                .discountType("PERCENT")
                .discountValue(10.0)
                .maxDiscount(60000.0)
                .minOrder(0.0)
                .isActive(true)
                .badge("CHO MỌI ĐƠN")
                .build(),
            CouponDTO.builder()
                .couponId(4L)
                .code("VIP100")
                .title("VIP Giảm 100.000đ")
                .description("Giảm 100.000đ cho hóa đơn từ 400.000đ trở lên")
                .discountType("FIXED")
                .discountValue(100000.0)
                .minOrder(400000.0)
                .isActive(true)
                .badge("VIP")
                .build()
        );
    }
}
