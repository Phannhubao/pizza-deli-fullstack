package com.pizza.deli.controller;

import com.pizza.deli.config.CustomStatusResponse;
import com.pizza.deli.dto.CategoryDTO;
import com.pizza.deli.dto.UserDTO;
import com.pizza.deli.model.Category;
import com.pizza.deli.service.CategoryService;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;
    @Autowired
    private CustomStatusResponse customStatusResponse;
    @GetMapping
    public List<CategoryDTO> getAllCategories() {
        return categoryService.getAllCategories();
    }


    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable("id") Integer id) {
        return categoryService.getCategoryById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CategoryDTO> createCategory(@RequestBody Category category) {
        try {
            CategoryDTO createdCategory = categoryService.createCategory(category);
            return ResponseEntity.ok(createdCategory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable("id")  Integer id, 
            @RequestBody Category categoryDetails) {
        
        try {
            Optional<CategoryDTO> updatedCategory = categoryService.updateCategory(id, categoryDetails);
            
            return updatedCategory
                    .map(category -> ResponseEntity.ok(category))
                    .orElseGet(() -> ResponseEntity.notFound().build());
                    
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Integer id) {
        if (categoryService.deleteCategory(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}