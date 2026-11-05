package com.pizza.deli.dto;

import com.pizza.deli.model.Product;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ProductDTO {
    private Integer productId;
    private String productName;
    private Double price;
    private Integer stock;
    private String description;
    private String ingredients;
    private Integer spicyLevel;
    private Integer cheeseLevel;
    private Integer calories;
    private String servingSize;
    private Boolean isVegetarian;
    private String allergens;
    private String occasions;
    private String pairsWith;
    private Boolean active;
    private Integer categoryId;
    private LocalDateTime createdAt;
    private List<ImageDTO> images;

    public static ProductDTO fromEntity(Product product) {
        if (product == null) {
            return null;
        }
        ProductDTO dto = new ProductDTO();
        dto.setProductId(product.getProductId());
        dto.setProductName(product.getProductName());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setDescription(product.getDescription());
        dto.setIngredients(product.getIngredients());
        dto.setSpicyLevel(product.getSpicyLevel());
        dto.setCheeseLevel(product.getCheeseLevel());
        dto.setCalories(product.getCalories());
        dto.setServingSize(product.getServingSize());
        dto.setIsVegetarian(product.getIsVegetarian());
        dto.setAllergens(product.getAllergens());
        dto.setOccasions(product.getOccasions());
        dto.setPairsWith(product.getPairsWith());
        dto.setActive(product.getActive());
        dto.setCreatedAt(product.getCreatedAt());

        // Lấy categoryId nếu có
        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getCategoryId());
        } else {
            dto.setCategoryId(null);
        }


        // Map images nếu có
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            dto.setImages(product.getImages().stream()
                    .map(ImageDTO::fromEntity)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}
