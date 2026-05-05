package com.campconnect.controller;

import com.campconnect.moderation.dto.ModerationAdminDecisionRequest;
import com.campconnect.moderation.model.PostModerationRecord;
import com.campconnect.moderation.service.PostModerationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/community/moderation")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(originPatterns = "*")
public class ModerationAdminController {

    private final PostModerationService postModerationService;

    @GetMapping("/pending-posts")
    public ResponseEntity<List<PostModerationRecord>> getPendingModerationPosts() {
        return ResponseEntity.ok(postModerationService.getPendingRecords());
    }

    @PostMapping("/train-model")
    public ResponseEntity<Map<String, Object>> trainModerationModel() {
        postModerationService.trainModel();
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "ok");
        response.put("message", "Model training started in the background");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/model-status")
    public ResponseEntity<Map<String, Object>> getModelStatus() {
        return ResponseEntity.ok(postModerationService.getModelStatus());
    }

    @PutMapping("/records/{recordId}/approve")
    public ResponseEntity<PostModerationRecord> approveRecord(
            @PathVariable String recordId,
            @RequestBody(required = false) ModerationAdminDecisionRequest request
    ) {
        String adminUserId = request != null && request.getAdminUserId() != null
                ? request.getAdminUserId()
                : "admin";
        String note = request != null ? request.getNote() : null;
        return ResponseEntity.ok(postModerationService.approveRecord(recordId, adminUserId, note));
    }

    @PutMapping("/records/{recordId}/reject")
    public ResponseEntity<PostModerationRecord> rejectRecord(
            @PathVariable String recordId,
            @RequestBody(required = false) ModerationAdminDecisionRequest request
    ) {
        String adminUserId = request != null && request.getAdminUserId() != null
                ? request.getAdminUserId()
                : "admin";
        String note = request != null ? request.getNote() : null;
        boolean banUser = request != null && Boolean.TRUE.equals(request.getBanUser());
        return ResponseEntity.ok(postModerationService.rejectRecord(recordId, adminUserId, note, banUser));
    }
}
