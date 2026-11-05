package com.pizza.deli.service;

import com.pizza.deli.dto.ReviewDTO;
import com.pizza.deli.model.*;
import com.pizza.deli.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderDetailRepository orderDetailRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderService orderService;

    public List<ReviewDTO> getReviewsByProductId(Integer productId) {
        return reviewRepository.findByProductProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getAllReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(ReviewDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDTO createReview(ReviewDTO dto) {
        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new IllegalArgumentException("Số sao đánh giá phải từ 1 đến 5!");
        }
        if (dto.getComment() == null || dto.getComment().trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập nội dung đánh giá!");
        }

        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("Người dùng không tồn tại!"));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại!"));

        Review review = Review.builder()
                .rating(dto.getRating())
                .comment(dto.getComment().trim())
                .userName(dto.getUserName() != null && !dto.getUserName().trim().isEmpty() ? dto.getUserName().trim() : user.getName())
                .user(user)
                .product(product)
                .orderId(dto.getOrderId())
                .build();

        Review saved = reviewRepository.save(review);

        // Nếu có orderId, cập nhật CanFeedBack = false cho order detail tương ứng
        if (dto.getOrderId() != null) {
            Optional<Order> orderOpt = orderRepository.findByOrderId(dto.getOrderId());
            if (orderOpt.isPresent()) {
                Optional<List<OrderDetail>> detailsOpt = orderDetailRepository.findByOrder(orderOpt.get());
                if (detailsOpt.isPresent()) {
                    for (OrderDetail detail : detailsOpt.get()) {
                        if (detail.getProduct() != null && detail.getProduct().getProductId().equals(product.getProductId())) {
                            detail.setCanFeedBack(false);
                            orderDetailRepository.save(detail);
                        }
                    }
                }
            }
        }

        return ReviewDTO.fromEntity(saved);
    }

    @Transactional
    public boolean deleteReview(Long reviewId) {
        if (reviewRepository.existsById(reviewId)) {
            reviewRepository.deleteById(reviewId);
            return true;
        }
        return false;
    }
}
