package com.campconnect.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campconnect.model.GroupMessage;
import com.campconnect.repository.GroupMessageRepository;

import lombok.RequiredArgsConstructor;

@CrossOrigin(origins = "http://localhost:4200", maxAge = 3600)
@RestController
@RequestMapping("/api/group-chat")
@RequiredArgsConstructor
public class GroupChatController {

    private final GroupMessageRepository groupMessageRepository;

    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<GroupMessage>> getMessages(@PathVariable("groupId") String groupId) {
        return ResponseEntity.ok(groupMessageRepository.findByGroupIdOrderByCreatedAtAsc(groupId));
    }

    @PostMapping("/send")
    public ResponseEntity<GroupMessage> sendMessage(@RequestBody GroupMessage message) {
        message.setCreatedAt(LocalDateTime.now());
        return ResponseEntity.ok(groupMessageRepository.save(message));
    }

    @org.springframework.web.bind.annotation.DeleteMapping("/{messageId}")
    public ResponseEntity<Void> deleteMessage(@PathVariable("messageId") String messageId) {
        groupMessageRepository.deleteById(messageId);
        return ResponseEntity.noContent().build();
    }
}
