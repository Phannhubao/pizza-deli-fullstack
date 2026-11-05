package com.pizza.deli.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.pizza.deli.model.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
	
}