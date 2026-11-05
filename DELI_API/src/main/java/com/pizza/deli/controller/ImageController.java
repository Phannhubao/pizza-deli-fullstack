package com.pizza.deli.controller;

import com.pizza.deli.dto.ImageDTO;
import com.pizza.deli.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Autowired
    private ImageService imageService;

    @GetMapping
    public List<ImageDTO> getAllImages() {
        return imageService.getAllImages();
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ImageDTO>> getImagesByProductId(
            @PathVariable("productId") Integer productId) {  // Explicitly specify the path variable name
        List<ImageDTO> images = imageService.getImagesByProductId(productId);
        return ResponseEntity.ok(images);
    }

    @PostMapping
    public ResponseEntity<ImageDTO> createImage(
            @RequestParam("productId") Integer productId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary) {
        try {
            ImageDTO createdImage = imageService.createImage(productId, file, caption, isPrimary);
            return ResponseEntity.ok(createdImage);
        } catch (IllegalArgumentException | IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImageDTO> updateImage(
            @PathVariable Integer id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary) {
        try {
            return imageService.updateImage(id, file, caption, isPrimary)
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.notFound().build());
        } catch (IOException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Integer id) {
        if (imageService.deleteImage(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}