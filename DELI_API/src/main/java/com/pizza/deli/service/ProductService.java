package com.pizza.deli.service;

import com.pizza.deli.dto.ProductDTO;
import com.pizza.deli.model.Product;
import com.pizza.deli.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getActiveProducts() {
        return productRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    public List<ProductDTO> getProductsByCategory(Integer categoryId) {
        return productRepository.findByCategory_CategoryId(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public Optional<ProductDTO> getProductById(Integer id) {
        return productRepository.findById(id)
                .map(this::convertToDTO);
    }

    public ProductDTO createProduct(Product product) {
        validateProduct(product);
        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    public Optional<ProductDTO> updateProduct(Integer id, Product productDetails) {
        return productRepository.findById(id)
                .map(existingProduct -> {
                    updateProductFields(existingProduct, productDetails);
                    Product updatedProduct = productRepository.save(existingProduct);
                    return convertToDTO(updatedProduct);
                });
    }

    public boolean deleteProduct(Integer id) {
        if (productRepository.existsById(id)) {
            productRepository.deleteById(id);
            return true;
        }
        return false;
    }

    private void validateProduct(Product product) {
        if (product.getProductName() == null || product.getProductName().isEmpty()) {
            throw new IllegalArgumentException("Product name cannot be empty");
        }
        if (product.getCategory() == null || product.getCategory().getCategoryId() == null) {
            throw new IllegalArgumentException("Category is required");
        }
        if (product.getPrice() == null || product.getPrice() < 0) {
            throw new IllegalArgumentException("Price must be non-negative");
        }
        if (product.getStock() == null || product.getStock() < 0) {
            throw new IllegalArgumentException("Stock must be non-negative");
        }
    }
    public Optional<ProductDTO> updateProductActive(Integer id, boolean active) {
        return productRepository.findById(id)
                .map(existingProduct -> {
                    existingProduct.setActive(active); // Chỉ cập nhật trường active
                    Product updatedProduct = productRepository.save(existingProduct);
                    return convertToDTO(updatedProduct);
                });
    }

    private void updateProductFields(Product existing, Product newDetails) {
        existing.setProductName(newDetails.getProductName());
        existing.setCategory(newDetails.getCategory());
        existing.setPrice(newDetails.getPrice());
        existing.setStock(newDetails.getStock());
        existing.setDescription(newDetails.getDescription());
        existing.setIngredients(newDetails.getIngredients());
        existing.setSpicyLevel(newDetails.getSpicyLevel());
        existing.setCheeseLevel(newDetails.getCheeseLevel());
        existing.setCalories(newDetails.getCalories());
        existing.setServingSize(newDetails.getServingSize());
        existing.setIsVegetarian(newDetails.getIsVegetarian());
        existing.setAllergens(newDetails.getAllergens());
        existing.setOccasions(newDetails.getOccasions());
        existing.setPairsWith(newDetails.getPairsWith());
        existing.setActive(newDetails.getActive());
    }

    private ProductDTO convertToDTO(Product product) {
        return ProductDTO.fromEntity(product);
    }
}