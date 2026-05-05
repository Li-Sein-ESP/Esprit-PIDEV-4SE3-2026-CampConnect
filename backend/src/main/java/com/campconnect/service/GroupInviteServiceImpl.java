package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.campconnect.model.*;
import org.springframework.stereotype.Service;

import com.campconnect.dto.GroupInviteDetailDto;
import com.campconnect.repository.GroupInviteRepository;
import com.campconnect.repository.GroupRepository;
import com.campconnect.repository.TripIntentRepository;
import com.campconnect.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupInviteServiceImpl implements IGroupInviteService {

    private final GroupInviteRepository groupInviteRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final TripIntentRepository tripIntentRepository;
    private final MatchingService matchingService;
    private final NotificationService notificationService;

    @Override
    public GroupInvite createInvite(GroupInvite invite) {
        invite.setCreatedAt(LocalDateTime.now());
        invite.setStatus(GroupInviteStatus.PENDING);
        
        // Pre-calculate AI score to avoid slowness in list views
        try {
            List<Double> p1 = getUserProfile(invite.getFromUserId());
            List<Double> p2 = getUserProfile(invite.getToUserId());
            Double score = matchingService.getCompatibilityScore(p1, p2);
            invite.setCompatibilityScore(score);
        } catch (Exception e) {
            invite.setCompatibilityScore(0.0);
        }
        
        GroupInvite saved = groupInviteRepository.save(invite);
        
        // Send Notification
        String senderName = userRepository.findById(invite.getFromUserId())
                                          .map(u -> u.getName() != null ? u.getName() : u.getUsername())
                                          .orElse("Quelqu'un");
        
        String tripTitle = tripIntentRepository.findById(invite.getTripIntentId())
                                               .map(TripIntent::getTitle)
                                               .orElse("un projet de camping");

        notificationService.createNotification(
            saved.getToUserId(),
            "Nouvelle Invitation !",
            senderName + " vous a envoyé une invitation pour le groupe : " + tripTitle + ".",
            NotificationType.INVITE_RECEIVED,
            saved.getId()
        );
        
        return saved;
    }

    @Override
    public GroupInvite getInviteById(String id) {
        return groupInviteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("GroupInvite not found with id: " + id));
    }

    @Override
    public List<GroupInvite> getInvitesForUser(String userId) {
        return groupInviteRepository.findByToUserId(userId);
    }

    @Override
    public List<GroupInvite> getInvitesByFromUser(String userId) {
        return groupInviteRepository.findByFromUserId(userId);
    }

    @Override
    public List<GroupInviteDetailDto> getInviteDetailsForUser(String userId) {
        List<GroupInvite> invites = getInvitesForUser(userId);
        return bulkMapToDetailDto(invites);
    }

    @Override
    public List<GroupInviteDetailDto> getInviteDetailsFromUser(String userId) {
        List<GroupInvite> invites = getInvitesByFromUser(userId);
        return bulkMapToDetailDto(invites);
    }

    private List<GroupInviteDetailDto> bulkMapToDetailDto(List<GroupInvite> invites) {
        if (invites == null || invites.isEmpty()) return new ArrayList<>();

        // 1. Collect all IDs for bulk fetching
        java.util.Set<String> userIds = new java.util.HashSet<>();
        java.util.Set<String> tripIds = new java.util.HashSet<>();
        for (GroupInvite inv : invites) {
            userIds.add(inv.getFromUserId());
            userIds.add(inv.getToUserId());
            tripIds.add(inv.getTripIntentId());
        }

        // 2. Bulk fetch entities
        java.util.Map<String, User> userMap = new java.util.HashMap<>();
        userRepository.findAllById(userIds).forEach(u -> userMap.put(u.getId(), u));

        java.util.Map<String, TripIntent> tripMap = new java.util.HashMap<>();
        tripIntentRepository.findAllById(tripIds).forEach(t -> tripMap.put(t.getId(), t));

        // 3. Map to DTOs using the pre-fetched maps
        return invites.stream().map(inv -> {
            GroupInviteDetailDto dto = new GroupInviteDetailDto();
            dto.setId(inv.getId());
            dto.setTripIntentId(inv.getTripIntentId());
            dto.setGroupId(inv.getGroupId());
            dto.setFromUserId(inv.getFromUserId());
            dto.setToUserId(inv.getToUserId());
            dto.setMessage(inv.getMessage());
            dto.setStatus(inv.getStatus());
            dto.setCreatedAt(inv.getCreatedAt());

            dto.setSender(userMap.get(inv.getFromUserId()));
            dto.setReceiver(userMap.get(inv.getToUserId()));
            TripIntent trip = tripMap.get(inv.getTripIntentId());
            dto.setTrip(trip);

            // AI Intelligence
            Double score = inv.getCompatibilityScore();
            if (score == null) {
                try {
                    List<Double> p1 = getUserProfile(inv.getFromUserId());
                    List<Double> p2 = getUserProfile(inv.getToUserId());
                    score = matchingService.getCompatibilityScore(p1, p2);
                } catch (Exception e) {
                    score = 0.0;
                }
            }

            dto.setCompatibilityScore(score);
            dto.setAiInsight(generateAiInsight(score, trip));

            List<Double> p1 = getUserProfile(inv.getFromUserId());
            List<Double> p2 = getUserProfile(inv.getToUserId());
            java.util.Map<String, Double> traits = new java.util.HashMap<>();
            String[] traitNames = {"Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"};
            for (int i = 0; i < 5; i++) {
                double diff = Math.abs(p1.get(i) - p2.get(i));
                double sim = Math.max(0, 100 * (1 - diff)); 
                traits.put(traitNames[i], Math.round(sim * 10.0) / 10.0);
            }
            dto.setTraitScores(traits);

            return dto;
        }).toList();
    }

    private List<Double> getUserProfile(String userId) {
        // Simple mock profile generator (matches logic in TripIntentServiceImpl)
        java.util.Random random = new java.util.Random(userId.hashCode());
        List<Double> profile = new java.util.ArrayList<>();
        for (int i = 0; i < 5; i++) {
            profile.add(0.3 + (random.nextDouble() * 0.4));
        }
        return profile;
    }

    private String generateAiInsight(Double score, TripIntent trip) {
        if (score > 85) return "It's a perfect match! ✨ Pack your bags, your profiles are made for camping together. The adventure looks epic!";
        if (score > 70) return "Very cool! 🙌 Between you two, it should match perfectly around the campfire. The atmosphere will be top-notch!";
        if (score > 50) return "Not bad at all! 👍 A good start for a hassle-free nature getaway. Try a short night to see?";
        return "Why not? 😊 It's a chance to discover a new horizon. Perfect for a short discovery trip!";
    }

    @Override
    public GroupInvite acceptInvite(String id, String reason, Boolean helpful) {
        GroupInvite invite = null;
        try {
            invite = getInviteById(id);
            invite.setDecisionReasonTrait(reason);
            invite.setHelpfulPrediction(helpful);
            
            System.out.println("Processing acceptance for invite ID: " + id + " with reason: " + reason);
            
            // 1. Resolve Group
            Group group = null;
            if (invite.getGroupId() != null) {
                group = groupRepository.findById(invite.getGroupId()).orElse(null);
            }
            
            // Fallback: search by tripId if groupId is null or not found
            if (group == null && invite.getTripIntentId() != null) {
                System.out.println("Group not found by ID, trying by Trip ID: " + invite.getTripIntentId());
                List<Group> groups = groupRepository.findByTripId(invite.getTripIntentId());
                if (!groups.isEmpty()) {
                    group = groups.get(0);
                    System.out.println("Found existing group: " + group.getId());
                    invite.setGroupId(group.getId());
                }
            }

            if (group == null) {
                throw new RuntimeException("Group not found for trip: " + invite.getTripIntentId());
            }

            // 2. Update Group membership
            if (group.getMemberUserIds() == null) {
                group.setMemberUserIds(new ArrayList<>());
            }

            boolean modified = false;
            String senderId = invite.getFromUserId();
            String targetId = invite.getToUserId();

            if (!group.getMemberUserIds().contains(targetId)) {
                group.getMemberUserIds().add(targetId);
                modified = true;
            }
            if (!group.getMemberUserIds().contains(senderId)) {
                group.getMemberUserIds().add(senderId);
                modified = true;
            }

            if (group.getMemberUserIds().size() >= 2) {
                group.setStatus(GroupStatus.ACTIVE);
                modified = true;
            }

            if (modified) {
                System.out.println("Saving updated group: " + group.getId() + " Members: " + group.getMemberUserIds());
                groupRepository.save(group);
            }

            // 3. Update and Save Invite
            invite.setStatus(GroupInviteStatus.ACCEPTED);
            System.out.println("Saving accepted invitation status.");
            GroupInvite saved = groupInviteRepository.save(invite);

            // Send Notification to sender
            String receiverName = userRepository.findById(invite.getToUserId())
                                              .map(u -> u.getName() != null ? u.getName() : u.getUsername())
                                              .orElse("L'utilisateur");
            
            String tripTitle = tripIntentRepository.findById(invite.getTripIntentId())
                                                   .map(TripIntent::getTitle)
                                                   .orElse("votre projet");

            notificationService.createNotification(
                invite.getFromUserId(),
                "Invitation Acceptée !",
                receiverName + " a rejoint votre groupe pour : " + tripTitle + " !",
                NotificationType.INVITE_ACCEPTED,
                group != null ? group.getId() : null
            );

            return saved;

        } catch (Exception e) {
            System.err.println("Critical error during invite acceptance: " + e.getMessage());
            e.printStackTrace();
            if (invite != null) {
                invite.setStatus(GroupInviteStatus.ACCEPTED);
                return groupInviteRepository.save(invite);
            }
            throw new RuntimeException("Failed to accept invite: " + e.getMessage());
        }
    }

    @Override
    public GroupInvite declineInvite(String id, String reason, Boolean helpful) {
        GroupInvite invite = getInviteById(id);
        invite.setDecisionReasonTrait(reason);
        invite.setHelpfulPrediction(helpful);
        invite.setStatus(GroupInviteStatus.DECLINED);
        return groupInviteRepository.save(invite);
    }

    @Override
    public GroupInvite cancelInvite(String id) {
        GroupInvite invite = getInviteById(id);
        invite.setStatus(GroupInviteStatus.CANCELLED);
        return groupInviteRepository.save(invite);
    }
}
