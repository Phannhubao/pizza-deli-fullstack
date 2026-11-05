package com.pizza.deli.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pizza.deli.model.Order;
import com.pizza.deli.model.OrderDetail;

import java.util.List;
import java.util.Optional;

public interface OrderDetailRepository extends JpaRepository<OrderDetail, Long > {
    Optional<OrderDetail> findByDetailId(Long detailId);

    List<OrderDetail> findAllByOrderByDetailIdDesc();

    Optional<List<OrderDetail>> findByOrder(Order orderId);
}
