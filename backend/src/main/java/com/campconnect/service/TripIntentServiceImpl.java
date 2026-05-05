package com.campconnect.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.campconnect.model.Group;
import com.campconnect.model.GroupStatus;
import com.campconnect.model.TripIntent;
import com.campconnect.model.TripIntentStatus;
import com.campconnect.repository.TripIntentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripIntentServiceImpl implements ITripIntentService {

    private final TripIntentRepository tripIntentRepository;
    private final IGroupService groupService;
    private final MatchingService matchingService;
    private final com.campconnect.repository.UserRepository userRepository;
    private final NotificationService notificationService;

    @Override
    public TripIntent createTripIntent(TripIntent tripIntent) {
        tripIntent.setCreatedAt(LocalDateTime.now());
        if (tripIntent.getStatus() == null) {
            tripIntent.setStatus(TripIntentStatus.OPEN);
        }
        
        TripIntent savedTrip = tripIntentRepository.save(tripIntent);
        
        // Ensure a group is created
        Group group = new Group();
        group.setTripId(savedTrip.getId());
        group.setName(savedTrip.getTitle());
        group.setCreatorUserId(savedTrip.getCreatorUserId());
        group.setStatus(GroupStatus.ACTIVE);
        group.setMemberUserIds(new java.util.ArrayList<>());
        group.getMemberUserIds().add(savedTrip.getCreatorUserId());
        
        groupService.createGroup(group);
        System.out.println("Auto-created group for trip: " + savedTrip.getId());
        
        // AI Matching & Notifications
        new Thread(() -> {
            try {
                List<Double> creatorProfile = getUserPersonalityProfile(savedTrip.getCreatorUserId());
                List<com.campconnect.model.User> allUsers = userRepository.findAll();
                
                for (com.campconnect.model.User u : allUsers) {
                    if (u.getId().equals(savedTrip.getCreatorUserId())) continue;
                    
                    List<Double> uProfile = getUserPersonalityProfile(u.getId());
                    Double score = matchingService.getCompatibilityScore(creatorProfile, uProfile);
                    
                    if (score != null && score >= 50.0) {
                        notificationService.createNotification(
                            u.getId(),
                            "Suggestion de Trip IA \u2728",
                            "Un nouveau trip qui correspond parfaitement à votre profil vient d'être publié ! (" + Math.round(score) + "% match)",
                            com.campconnect.model.NotificationType.TRIP_RECOMMENDATION,
                            savedTrip.getId()
                        );
                    }
                }
            } catch (Exception e) {
                System.err.println("Failed to process AI recommendations: " + e.getMessage());
            }
        }).start();
        
        return savedTrip;
    }

    @Override
    public TripIntent getTripIntentById(String id) {
        return getTripIntentById(id, null);
    }

    @Override
    public TripIntent getTripIntentById(String id, String currentUserId) {
        TripIntent intent = tripIntentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TripIntent not found with id: " + id));
        populateCreatorName(intent);
        if (currentUserId != null && !currentUserId.isEmpty()) {
            calculateCompatibility(intent, currentUserId);
        }
        return intent;
    }

    @Override
    public List<TripIntent> getTripIntentsByCreator(String creatorUserId) {
        List<TripIntent> intents = tripIntentRepository.findByCreatorUserId(creatorUserId);
        for (TripIntent intent : intents) {
            populateCreatorName(intent);
        }
        return intents;
    }

    @Override
    public List<TripIntent> getAllOpenTripIntents(String currentUserId) {
        List<TripIntent> intents = tripIntentRepository.findByStatus(TripIntentStatus.OPEN);
        
        if (currentUserId == null || currentUserId.isEmpty()) {
            for (TripIntent intent : intents) {
                populateCreatorName(intent);
            }
            return intents;
        }

        for (TripIntent intent : intents) {
            populateCreatorName(intent);
            calculateCompatibility(intent, currentUserId);
        }
        
        return intents;
    }

    private void calculateCompatibility(TripIntent intent, String currentUserId) {
        if (intent.getCreatorUserId() != null && intent.getCreatorUserId().equals(currentUserId)) {
            intent.setCompatibilityScore(null);
            return;
        }

        try {
            List<Double> currentUserProfile = getUserPersonalityProfile(currentUserId);
            java.util.Optional<Group> groupOpt = groupService.getGroupByTripId(intent.getId());
            if (groupOpt.isPresent()) {
                List<String> memberIds = groupOpt.get().getMemberUserIds();
                if (memberIds != null && !memberIds.isEmpty()) {
                    double totalScore = 0.0;
                    int matchedMembersCount = 0;
                    for (String memberId : memberIds) {
                        if (memberId.equals(currentUserId)) continue;
                        List<Double> memberProfile = getUserPersonalityProfile(memberId);
                        Double score = matchingService.getCompatibilityScore(currentUserProfile, memberProfile);
                        if (score != null) {
                            totalScore += score;
                            matchedMembersCount++;
                            
                            // Retrieve the user's name to put in the map
                            String memberName = userRepository.findById(memberId)
                                .map(u -> {
                                    String n = u.getName();
                                    return (n != null && !n.isEmpty()) ? n : u.getUsername();
                                }).orElse("Aventurier");
                            intent.getParticipantScores().put(memberName, score);
                        }
                    }
                    if (matchedMembersCount > 0) {
                        intent.setCompatibilityScore(totalScore / matchedMembersCount);
                    } else {
                        List<Double> creatorProfile = getUserPersonalityProfile(intent.getCreatorUserId());
                        Double score = matchingService.getCompatibilityScore(currentUserProfile, creatorProfile);
                        intent.setCompatibilityScore(score != null ? score : 0.0);
                    }
                } else {
                    List<Double> creatorProfile = getUserPersonalityProfile(intent.getCreatorUserId());
                    Double score = matchingService.getCompatibilityScore(currentUserProfile, creatorProfile);
                    intent.setCompatibilityScore(score != null ? score : 0.0);
                }
            } else {
                List<Double> creatorProfile = getUserPersonalityProfile(intent.getCreatorUserId());
                Double score = matchingService.getCompatibilityScore(currentUserProfile, creatorProfile);
                intent.setCompatibilityScore(score != null ? score : 0.0);
            }
        } catch (Exception e) {
            System.err.println("Error calculating score for intent " + intent.getId() + ": " + e.getMessage());
            // Fallback score if ML service is down or error occurs
            intent.setCompatibilityScore(0.0);
        }
    }

    private void populateCreatorName(TripIntent intent) {
        // Populate Group ID for linking
        groupService.getGroupByTripId(intent.getId()).ifPresent(group -> {
            intent.setGroupId(group.getId());
        });

        if (intent.getCreatorUserId() != null) {
            String userId = intent.getCreatorUserId();
            userRepository.findById(userId).ifPresentOrElse(user -> {
                String name = user.getName();
                if (name == null || name.isEmpty()) {
                    name = user.getUsername();
                }
                intent.setCreatorName(name);
            }, () -> {
                // Fallback for demo if user not found in DB
                if (userId.equals("69c30a320f9f355b3f6b8ab3")) {
                    intent.setCreatorName("Robota(votre coach IA 🤖)");
                } else {
                    intent.setCreatorName("Un aventurier mystérieux 🕵️‍♂️");
                }
            });
        }
    }

    private List<Double> getUserPersonalityProfile(String userId) {
        return userRepository.findById(userId)
                .map(user -> {
                    // Si l'utilisateur a des traits dans profileDetails, on les utilise
                    // Sinon, on génère un profil par défaut basé sur son ID pour la démo
                    if (user.getProfileDetails() == null) {
                        return generateDefaultProfile(userId);
                    }
                    Object traits = user.getProfileDetails().get("personalityTraits");
                    if (traits instanceof List) {
                        return ((List<?>) traits).stream()
                                .map(o -> Double.valueOf(o.toString()))
                                .collect(java.util.stream.Collectors.toList());
                    }
                    return generateDefaultProfile(userId);
                })
                .orElseGet(() -> generateDefaultProfile(userId));
    }

    private List<Double> generateDefaultProfile(String seed) {
        // Génère 5 traits entre 0.0 et 1.0 de manière déterministe pour le prof
        java.util.Random random = new java.util.Random(seed.hashCode());
        List<Double> profile = new java.util.ArrayList<>();
        for (int i = 0; i < 5; i++) {
            profile.add(0.3 + (random.nextDouble() * 0.4)); // Concentré entre 0.3 et 0.7
        }
        return profile;
    }

    @Override
    public List<TripIntent> getAllOpenTripIntents() {
        return getAllOpenTripIntents(null);
    }

    @Override
    public TripIntent updateTripIntent(String id, TripIntent tripIntent) {
        TripIntent existing = getTripIntentById(id);

        existing.setTitle(tripIntent.getTitle());
        existing.setDateFrom(tripIntent.getDateFrom());
        existing.setDateTo(tripIntent.getDateTo());
        existing.setBudgetMax(tripIntent.getBudgetMax());
        existing.setCampingStyle(tripIntent.getCampingStyle());
        existing.setExperienceLevel(tripIntent.getExperienceLevel());
        existing.setPreferredZone(tripIntent.getPreferredZone());
        existing.setStatus(tripIntent.getStatus());
        existing.setImageUrl(tripIntent.getImageUrl());

        TripIntent updated = tripIntentRepository.save(existing);
        
        // Sync with Group name
        groupService.getGroupByTripId(id).ifPresent(group -> {
            boolean modified = false;
            if (!group.getName().equals(updated.getTitle())) {
                group.setName(updated.getTitle());
                modified = true;
            }
            if (updated.getStatus() == TripIntentStatus.CLOSED) {
                group.setStatus(GroupStatus.INACTIVE);
                modified = true;
            }
            if (modified) {
                groupService.updateGroup(group.getId(), group);
            }
        });
        
        return updated;
    }

    @Override
    public void deleteTripIntent(String id) {
        TripIntent existing = getTripIntentById(id);
        existing.setStatus(TripIntentStatus.CLOSED);
        tripIntentRepository.save(existing);
    }
}
