package com.campconnect.controller;

import com.campconnect.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Tag(name = "File Upload", description = "Endpoints for uploading files")
public class FileUploadController {

    private final FileStorageService fileStorageService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload a file (e.g., product image)")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileDownloadUri = fileStorageService.storeFile(file);

        Map<String, String> response = new HashMap<>();
        response.put("url", fileDownloadUri);

        return ResponseEntity.ok(response);
    }
}
