package com.pizza.deli.service;

import com.pizza.deli.dto.ImageDTO;
import com.pizza.deli.model.Image;
import com.pizza.deli.repository.ImageRepository;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ImageService {

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private Cloudinary cloudinary;

    public List<ImageDTO> getAllImages() {
        return imageRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ImageDTO> getImagesByProductId(Integer productId) {
        List<Image> images = imageRepository.findByProductProductId(productId);
        return images.stream()
                .map(ImageDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public ImageDTO createImage(Integer productId, MultipartFile file, String caption, Boolean isPrimary) throws IOException {
        validateImageInput(productId, file);
        
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
        String imageUrl = (String) uploadResult.get("secure_url");

        Image image = new Image();
        image.setProduct(new com.pizza.deli.model.Product() {{ setProductId(productId); }});
        image.setImageUrl(imageUrl);
        image.setCaption(caption);
        image.setIsPrimary(isPrimary != null ? isPrimary : false);

        Image savedImage = imageRepository.save(image);
        return convertToDTO(savedImage);
    }

    public Optional<ImageDTO> updateImage(Integer id, MultipartFile file, String caption, Boolean isPrimary) throws IOException {
        return imageRepository.findById(id)
                .map(existingImage -> {
                    try {
                        updateImageFields(existingImage, file, caption, isPrimary);
                        Image updatedImage = imageRepository.save(existingImage);
                        return convertToDTO(updatedImage);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to update image", e);
                    }
                });
    }

    public boolean deleteImage(Integer id) {
        if (imageRepository.existsById(id)) {
            imageRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private void validateImageInput(Integer productId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Image file cannot be empty");
        }
        if (productId == null) {
            throw new IllegalArgumentException("Product ID is required");
        }
    }

    private void updateImageFields(Image image, MultipartFile file, String caption, Boolean isPrimary) throws IOException {
        if (file != null && !file.isEmpty()) {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
            image.setImageUrl((String) uploadResult.get("secure_url"));
        }
        if (caption != null) {
            image.setCaption(caption);
        }
        if (isPrimary != null) {
            image.setIsPrimary(isPrimary);
        }
    }

    private ImageDTO convertToDTO(Image image) {
        ImageDTO dto = new ImageDTO();
        dto.setImageId(image.getImageId());
        dto.setImageUrl(image.getImageUrl());
        dto.setCaption(image.getCaption());
        dto.setIsPrimary(image.getIsPrimary());
        dto.setCreatedAt(image.getCreatedAt());
        dto.setProductId(image.getProduct().getProductId());
        return dto;
    }
}