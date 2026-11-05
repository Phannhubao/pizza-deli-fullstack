package com.pizza.deli.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ImageDTO {
    private Integer imageId;
    private String imageUrl;
    private String caption;
    private Boolean isPrimary;
    private LocalDateTime createdAt;
    private Integer productId; // Chỉ lưu ID sản phẩm thay vì cả object

    public static ImageDTO fromEntity(com.pizza.deli.model.Image image) {
        ImageDTO dto = new ImageDTO();
        dto.setImageId(image.getImageId());
        dto.setImageUrl(image.getImageUrl());
        dto.setCaption(image.getCaption());
        dto.setIsPrimary(image.getIsPrimary());
        dto.setCreatedAt(image.getCreatedAt());
        
        // Chỉ lấy productId thay vì cả object Product để tránh circular reference
        if (image.getProduct() != null) {
            dto.setProductId(image.getProduct().getProductId());
        }
        
        return dto;
    }
}