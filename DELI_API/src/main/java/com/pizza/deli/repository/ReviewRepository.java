package com.pizza.deli.repository;

import com.pizza.deli.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductProductIdOrderByCreatedAtDesc(Integer productId);
    List<Review> findAllByOrderByCreatedAtDesc();
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
}
