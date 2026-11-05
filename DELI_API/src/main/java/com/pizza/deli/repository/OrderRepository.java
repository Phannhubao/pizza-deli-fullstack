package com.pizza.deli.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pizza.deli.model.Order;
import com.pizza.deli.model.User;


import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long > {
    Optional<Order> findByOrderId(Long orderId);

    List<Order> findByUser(User user);

    List<Order> findAllByOrderByOrderIdAsc();

}
