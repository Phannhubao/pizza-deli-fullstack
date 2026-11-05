package com.pizza.deli.controller;

import com.pizza.deli.dto.CouponDTO;
import com.pizza.deli.dto.CouponValidateRequest;
import com.pizza.deli.dto.CouponValidateResponse;
import com.pizza.deli.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired
    private CouponService couponService;

    // Lấy danh sách mã giảm giá đang hoạt động cho khách hàng
    @GetMapping
    public ResponseEntity<List<CouponDTO>> getActiveCoupons() {
        List<CouponDTO> coupons = couponService.getActiveCoupons();
        return ResponseEntity.ok(coupons);
    }

    // Lấy toàn bộ mã giảm giá cho trang quản trị Admin
    @GetMapping("/all")
    public ResponseEntity<List<CouponDTO>> getAllCoupons() {
        List<CouponDTO> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(coupons);
    }

    // Kiểm tra tính hợp lệ của mã giảm giá và tính toán số tiền được giảm
    @PostMapping("/validate")
    public ResponseEntity<CouponValidateResponse> validateCoupon(@RequestBody CouponValidateRequest request) {
        if (request == null || request.getCode() == null) {
            return ResponseEntity.badRequest().body(
                CouponValidateResponse.builder()
                    .valid(false)
                    .message("Vui lòng cung cấp mã giảm giá")
                    .discountAmount(0.0)
                    .finalTotal(0.0)
                    .build()
            );
        }
        CouponValidateResponse response = couponService.validateCoupon(request.getCode(), request.getOrderTotal());
        return ResponseEntity.ok(response);
    }

    // Admin tạo mới mã giảm giá
    @PostMapping
    public ResponseEntity<CouponDTO> createCoupon(@RequestBody CouponDTO couponDTO) {
        try {
            CouponDTO created = couponService.createCoupon(couponDTO);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Admin xóa mã giảm giá
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        if (couponService.deleteCoupon(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
