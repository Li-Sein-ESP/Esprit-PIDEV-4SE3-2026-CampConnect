package com.campconnect.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.*;

/**
 * Handles image uploads and serves uploaded files.
 * POST /api/upload/image  → returns the accessible URL
 */
@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:4200")
public class ImageUploadController {

    private static final String UPLOAD_SUBDIR = "uploads" + File.separator + "campsite-images" + File.separator;

    private String getUploadDir() {
        return System.getProperty("user.dir") + File.separator + UPLOAD_SUBDIR;
    }

    @PostMapping("/image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "No file provided"));
        }

        // Validate that it is an image
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }

        try {
            // Create upload directory if it doesn't exist
            String uploadDir = getUploadDir();
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate a unique filename
            String originalFilename = Objects.requireNonNull(file.getOriginalFilename());
            String extension = originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                    : "";
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Return the accessible URL (served via /uploads/** public path)
            String imageUrl = "/uploads/campsite-images/" + uniqueFilename;

            return ResponseEntity.ok(Map.of(
                    "url", imageUrl,
                    "filename", uniqueFilename
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to save file: " + e.getMessage()));
        }
    }

    @DeleteMapping("/image/{filename}")
    public ResponseEntity<Void> deleteImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(getUploadDir(), filename);
            Files.deleteIfExists(filePath);
            return ResponseEntity.noContent().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
