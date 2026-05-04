package com.campconnect.service.impl;

import com.campconnect.dto.LeaderboardEntryDTO;
import com.campconnect.dto.LeaderboardResponseDTO;
import com.campconnect.model.Comment;
import com.campconnect.model.Incident;
import com.campconnect.model.Post;
import com.campconnect.model.Trip;
import com.campconnect.model.User;
import com.campconnect.model.UserStats;
import com.campconnect.repository.CommentRepository;
import com.campconnect.repository.IncidentRepository;
import com.campconnect.repository.PostRepository;
import com.campconnect.repository.TripRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.repository.UserStatsRepository;
import com.campconnect.service.LeaderboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardServiceImpl implements LeaderboardService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final TripRepository tripRepository;
    private final IncidentRepository incidentRepository;
    private final UserStatsRepository userStatsRepository;

    @Override
    public LeaderboardResponseDTO getLeaderboard(String period, String currentUserId) {
        List<User> users = userRepository.findAll();
        List<Post> posts = postRepository.findAll();
        List<Comment> comments = commentRepository.findAll();
        List<Trip> trips = tripRepository.findAll();
        List<Incident> incidents = incidentRepository.findAll();

        Map<String, Integer> postsByUser = new HashMap<>();
        Map<String, Integer> commentsByUser = new HashMap<>();
        Map<String, Integer> tripsByUser = new HashMap<>();
        Map<String, Integer> incidentsByUser = new HashMap<>();

        for (Post p : posts) {
            if (p.getAuthorId() != null) {
                postsByUser.merge(p.getAuthorId(), 1, Integer::sum);
            }
        }

        for (Comment c : comments) {
            if (c.getAuthorId() != null) {
                commentsByUser.merge(c.getAuthorId(), 1, Integer::sum);
            }
        }

        for (Trip t : trips) {
            if (t.getCreatorId() != null) {
                tripsByUser.merge(t.getCreatorId(), 1, Integer::sum);
            }
        }

        for (Incident i : incidents) {
            if (i.getReporterId() != null) {
                incidentsByUser.merge(i.getReporterId(), 1, Integer::sum);
            }
        }

        List<LeaderboardEntryDTO> entries = new ArrayList<>();
        for (User user : users) {
            int postCount = postsByUser.getOrDefault(user.getId(), 0);
            int commentCount = commentsByUser.getOrDefault(user.getId(), 0);
            int tripCount = tripsByUser.getOrDefault(user.getId(), 0);
            int incidentCount = incidentsByUser.getOrDefault(user.getId(), 0);

            UserStats stats = userStatsRepository.findByUserId(user.getId()).orElseGet(() -> {
                UserStats s = new UserStats();
                s.setUserId(user.getId());
                s.setUsername(user.getUsername());
                s.setEmail(user.getEmail());
                s.setJoinedAt(user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now());
                s.setLastActiveAt(LocalDateTime.now());
                return s;
            });

            stats.setPostsCount(postCount);
            stats.setCommentsCount(commentCount);
            stats.setTripsCount(tripCount);
            stats.setIncidentsReportedCount(incidentCount);

            int recalculatedPoints = (postCount * 10) + (commentCount * 5) + (tripCount * 25) + (incidentCount * 15);
            stats.setTotalPoints(recalculatedPoints);
            stats.setWeeklyPoints((int) Math.round(recalculatedPoints * 0.25));
            stats.setMonthlyPoints((int) Math.round(recalculatedPoints * 0.60));
            stats.setYearlyPoints((int) Math.round(recalculatedPoints * 0.85));

            ensureDefaultBadges(stats, postCount, commentCount, tripCount, incidentCount);
            stats.recalculateTrustScore();
            userStatsRepository.save(stats);

            LeaderboardEntryDTO entry = toEntry(stats, user, period, currentUserId);
            entries.add(entry);
        }

        entries = entries.stream()
                .sorted(Comparator.comparingInt(LeaderboardEntryDTO::getPoints).reversed())
                .collect(Collectors.toList());

        for (int i = 0; i < entries.size(); i++) {
            entries.get(i).setRank(i + 1);
        }

        int totalBadges = entries.stream().mapToInt(e -> e.getBadges() == null ? 0 : e.getBadges().size()).sum();
        int totalTrips = users.stream().mapToInt(u -> tripsByUser.getOrDefault(u.getId(), 0)).sum();
        int avgTrust = entries.isEmpty() ? 0 : (int) Math.round(entries.stream().mapToInt(LeaderboardEntryDTO::getTrustScore).average().orElse(0));

        LeaderboardResponseDTO response = new LeaderboardResponseDTO();
        response.setPeriod(period == null || period.isBlank() ? "month" : period.toLowerCase(Locale.ROOT));
        response.setEntries(entries);
        response.setActiveCampers(entries.size());
        response.setTotalBadges(totalBadges);
        response.setTotalTrips(totalTrips);
        response.setAvgTrustScore(avgTrust);
        return response;
    }

    private LeaderboardEntryDTO toEntry(UserStats stats, User user, String period, String currentUserId) {
        String normalized = period == null ? "month" : period.toLowerCase(Locale.ROOT);
        int points = switch (normalized) {
            case "week" -> stats.getWeeklyPoints();
            case "year" -> stats.getYearlyPoints();
            case "all" -> stats.getTotalPoints();
            default -> stats.getMonthlyPoints();
        };

        LeaderboardEntryDTO dto = new LeaderboardEntryDTO();
        dto.setId(stats.getUserId());
        dto.setUserId(stats.getUserId());
        dto.setUsername(user.getUsername() != null ? user.getUsername() : "Camper");
        dto.setHandle("@" + (user.getUsername() != null ? user.getUsername().toLowerCase(Locale.ROOT).replace(" ", "_") : "camper"));
        dto.setAvatar(null);
        dto.setInitials(toInitials(user.getUsername()));
        dto.setAvatarBg("#e8efe8");
        dto.setAvatarColor("#2f5d44");
        dto.setTrustScore(stats.getTrustScore());
        dto.setPoints(points);
        dto.setRankChange(stats.getRankChange());
        dto.setTrips(stats.getTripsCount());
        dto.setJoinedDate(formatJoinedDate(stats.getJoinedAt()));
        dto.setBadges(stats.getBadges().stream()
                .map(b -> new LeaderboardEntryDTO.BadgeDto(b.getTitle(), b.getTheme(), b.getIcon()))
                .collect(Collectors.toList()));
        dto.setSelf(currentUserId != null && !currentUserId.isBlank() && currentUserId.equals(stats.getUserId()));
        return dto;
    }

    private String toInitials(String username) {
        if (username == null || username.isBlank()) {
            return "CC";
        }
        String[] parts = username.trim().split("\\s+");
        if (parts.length == 1) {
            String one = parts[0];
            return one.substring(0, Math.min(2, one.length())).toUpperCase(Locale.ROOT);
        }
        return ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase(Locale.ROOT);
    }

    private String formatJoinedDate(LocalDateTime dt) {
        if (dt == null) {
            return "N/A";
        }
        return dt.format(DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH));
    }

    private void ensureDefaultBadges(UserStats stats, int posts, int comments, int trips, int incidents) {
        if (stats.getBadges() == null) {
            stats.setBadges(new ArrayList<>());
        }
        addBadgeIfMissing(stats, posts >= 1, "first-camp", "First Camp", "forest", "tent");
        addBadgeIfMissing(stats, posts >= 5, "trailblazer", "Trailblazer", "terra", "trail");
        addBadgeIfMissing(stats, comments >= 5, "fire-starter", "Fire Starter", "amber", "fire");
        addBadgeIfMissing(stats, trips >= 3, "gear-master", "Gear Master", "gold", "star");
        addBadgeIfMissing(stats, incidents >= 1, "eco-warrior", "Eco Warrior", "sage", "leaf");
        addBadgeIfMissing(stats, comments >= 15, "wildlife-spotter", "Wildlife Spotter", "teal", "binoculars");
    }

    private void addBadgeIfMissing(UserStats stats, boolean condition, String id, String title, String theme, String icon) {
        if (!condition) {
            return;
        }
        boolean exists = stats.getBadges().stream().anyMatch(b -> id.equals(b.getId()));
        if (!exists) {
            stats.getBadges().add(new UserStats.Badge(id, title, theme, icon, LocalDateTime.now()));
        }
    }
}
