package com.pizza.deli.service;

import com.pizza.deli.dto.CategoryDTO;
import com.pizza.deli.dto.UserDTO;
import com.pizza.deli.model.Category;
import com.pizza.deli.repository.CategoryRepository;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<CategoryDTO> getCategoryById(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .map(this::convertToDTO);
    }

    public CategoryDTO createCategory(Category category) {
        validateCategory(category);
        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    public Optional<CategoryDTO> updateCategory(Integer id, Category categoryDetails) {
        return categoryRepository.findById(id)
                .map(existingCategory -> {
                    // Chỉ cập nhật các trường được phép thay đổi
                    if (categoryDetails.getCategoryName() != null) {
                        existingCategory.setCategoryName(categoryDetails.getCategoryName());
                    }
                    if (categoryDetails.getDescription() != null) {
                        existingCategory.setDescription(categoryDetails.getDescription());
                    }
                    
                    // Lưu và chuyển đổi sang DTO
                    Category updatedCategory = categoryRepository.save(existingCategory);
                    return CategoryDTO.fromEntity(updatedCategory); // Sử dụng fromEntity thay vì convertToDTO
                });
    }

    public boolean deleteCategory(Integer id) {
        if (categoryRepository.existsById(id)) {
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private void validateCategory(Category category) {
        if (category.getCategoryName() == null || category.getCategoryName().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }
    }

    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        dto.setDescription(category.getDescription());
        dto.setCreatedAt(category.getCreatedAt());
        return dto;
    }
}