package com.pizza.deli.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pizza.deli.model.Image;

public interface ImageRepository extends JpaRepository<Image, Integer> {
    List<Image> findByProductProductId(Integer productId);
}