package com.pizza.deli.controller;

import com.pizza.deli.config.CustomStatusResponse;
import com.pizza.deli.dto.ReviewDTO;
import com.pizza.deli.service.OrderService;
import com.pizza.deli.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin
@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private CustomStatusResponse customStatusResponse;

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getReviewsByProduct(@PathVariable Integer productId) {
        try {
            List<ReviewDTO> reviews = reviewService.getReviewsByProductId(productId);
            return customStatusResponse.OK200("Lấy danh sách đánh giá thành công", reviews);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllReviews() {
        try {
            List<ReviewDTO> reviews = reviewService.getAllReviews();
            return customStatusResponse.OK200("Lấy toàn bộ đánh giá thành công", reviews);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    @GetMapping("/checkCanReview/{userId}/{productId}")
    public ResponseEntity<?> checkCanReview(@PathVariable Long userId, @PathVariable String productId) {
        try {
            Boolean canReview = orderService.checkUserOrderProduct(userId, productId);
            return customStatusResponse.OK200("Kiểm tra quyền đánh giá hoàn tất", canReview);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createReview(@RequestBody ReviewDTO dto) {
        try {
            ReviewDTO created = reviewService.createReview(dto);
            return customStatusResponse.CREATED201("Đánh giá sản phẩm thành công!", created);
        } catch (IllegalArgumentException e) {
            return customStatusResponse.BADREQUEST400(e.getMessage());
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        try {
            boolean deleted = reviewService.deleteReview(reviewId);
            if (deleted) {
                return customStatusResponse.OK200("Xóa đánh giá thành công!");
            }
            return customStatusResponse.NOTFOUND404("Không tìm thấy đánh giá với ID: " + reviewId);
        } catch (Exception e) {
            return customStatusResponse.INTERNALSERVERERROR500(e.getMessage());
        }
    }
}
