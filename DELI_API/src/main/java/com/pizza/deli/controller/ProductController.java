package com.pizza.deli.controller;

import com.pizza.deli.config.CustomStatusResponse;
import com.pizza.deli.dto.ImageDTO;
import com.pizza.deli.dto.ProductDTO;
import com.pizza.deli.model.Product;
import com.pizza.deli.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public List<ProductDTO> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/active")
    public List<ProductDTO> getActiveProducts() {
        return productService.getActiveProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable("id") Integer id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(
            @PathVariable("categoryId") Integer categoryId) {
        List<ProductDTO> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }
   

    @PostMapping
    public ResponseEntity<?> createProduct(@RequestBody Product product) {
        try {
            ProductDTO createdProduct = productService.createProduct(product);
            return ResponseEntity.ok(createdProduct);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error creating product: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unexpected error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable("id") Integer id, @RequestBody Product productDetails) {
        return productService.updateProduct(id, productDetails)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Integer id) {
        if (productService.deleteProduct(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/active")
    public ResponseEntity<?> updateProductActive(@PathVariable("id") Integer id, @RequestBody boolean active) {
        try {
            return productService.updateProductActive(id, active)
                    .map(updatedProduct -> ResponseEntity.ok(updatedProduct))
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error updating product active status: " + e.getMessage());
        }
    }
   
}