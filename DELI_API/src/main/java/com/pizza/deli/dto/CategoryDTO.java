package com.pizza.deli.dto;

import com.pizza.deli.model.Product;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class CategoryDTO {
    private Integer categoryId;
    private String categoryName;
    private String description;
    private LocalDateTime createdAt;
    private List<ProductDTO> products;

    // Phương thức chuyển đổi từ Entity sang DTO
    public static CategoryDTO fromEntity(com.pizza.deli.model.Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        dto.setDescription(category.getDescription());
        dto.setCreatedAt(category.getCreatedAt());
        
        if (category.getProducts() != null) {
            dto.setProducts(category.getProducts().stream()
                .map(ProductDTO::fromEntity)
                .collect(Collectors.toList()));
        }
        
        return dto;
    }
}