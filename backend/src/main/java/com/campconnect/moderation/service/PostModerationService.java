package com.campconnect.moderation.service;

import com.campconnect.moderation.dto.PostModerationResult;
import com.campconnect.moderation.model.PostModerationRecord;

import java.util.List;
import java.util.Map;

public interface PostModerationService {
    PostModerationResult moderatePost(String content, List<String> imageUrls);
    PostModerationRecord saveRecord(String postId, String authorId, String authorName, String content, List<String> imageUrls, PostModerationResult result);
    List<PostModerationRecord> getPendingRecords();
    void trainModel();
    Map<String, Object> getModelStatus();
    PostModerationRecord approveRecord(String recordId, String adminUserId, String note);
    PostModerationRecord rejectRecord(String recordId, String adminUserId, String note, boolean banUser);
}
