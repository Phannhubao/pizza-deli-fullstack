package com.pizza.deli.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pizza.deli.model.Order;
import com.pizza.deli.model.Payment;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long > {

Optional<Payment> findByOrderPayment(Order order);
    
    // Hoặc nếu muốn tìm bằng orderId:
    Optional<Payment> findByOrderPayment_OrderId(Long orderId);

}
