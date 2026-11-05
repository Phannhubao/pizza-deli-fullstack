package com.pizza.deli.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.pizza.deli.model.Product;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByActiveTrue();
    List<Product> findByCategory_CategoryId(Integer categoryId);

}