package com.campconnect.controller;

import com.campconnect.model.GroupMessage;
import com.campconnect.repository.GroupMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class GroupChatWebSocketController {

    private final SimpMessagingTemplate messagingTemplate;
    private final GroupMessageRepository groupMessageRepository;

    @MessageMapping("/chat.sendMessage/{groupId}")
    public void sendMessage(@DestinationVariable String groupId, @Payload Map<String, Object> chatMessage) {
        // Log for debugging
        System.out.println("Received message for group " + groupId + ": " + chatMessage.get("content"));

        // Map payload to model and save to MongoDB
        GroupMessage message = GroupMessage.builder()
                .groupId(groupId)
                .senderUserId((String) chatMessage.get("senderId"))
                .content((String) chatMessage.get("content"))
                .imageUrl((String) chatMessage.get("imageUrl"))
                .createdAt(LocalDateTime.now())
                .build();
        
        GroupMessage savedMessage = groupMessageRepository.save(message);
        
        // Add additional info for the frontend
        chatMessage.put("id", savedMessage.getId());
        chatMessage.put("groupId", groupId); // Ensure groupId is included
        chatMessage.put("timestamp", savedMessage.getCreatedAt().toString());

        // Broadcast the message to all members subscribed to this group's topic
        messagingTemplate.convertAndSend("/topic/group/" + groupId, chatMessage);
    }
}
