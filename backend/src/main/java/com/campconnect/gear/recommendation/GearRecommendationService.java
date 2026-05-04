package com.campconnect.gear.recommendation;

import com.campconnect.gear.model.Gear;
import com.campconnect.gear.model.GearStatus;
import com.campconnect.gear.model.Rental;
import com.campconnect.gear.model.RentalStatus;
import com.campconnect.gear.repository.GearRepository;
import com.campconnect.gear.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GearRecommendationService {

    private final RestTemplate restTemplate;
    private final GearRepository gearRepository;
    private final RentalRepository rentalRepository;

    @Value("${ml.gear.recommendation.url}")
    private String mlBaseUrl;

    /**
     * Phase 1 — ML only: returns what categories of gear the camper needs.
     * No database query, just the Flask model prediction.
     */
    public FlaskRecommendationResponse getCategories(GearRecommendationRequest request) {
        Map<String, Object> flaskPayload = buildFlaskPayload(request);

        FlaskRecommendationResponse flaskResponse;
        try {
            flaskResponse = restTemplate.postForObject(
                    mlBaseUrl + "/recommend",
                    flaskPayload,
                    FlaskRecommendationResponse.class
            );
        } catch (ResourceAccessException e) {
            throw new RuntimeException(
                    "ML service unavailable — make sure gear_rec_app.py is running on port 5001", e);
        }

        if (flaskResponse == null || flaskResponse.getRecommendations() == null) {
            throw new RuntimeException("Empty response from ML service");
        }

        return flaskResponse;
    }

    /**
     * Phase 2 — returns actual gear items from the marketplace matching
     * the recommended categories. Called only when the camper wants to browse.
     */
    public GearRecommendationResult getMatchingItems(GearRecommendationRequest request) {
        FlaskRecommendationResponse flaskResponse = getCategories(request);

        // Parse dates if provided
        LocalDate startDate = request.getStartDate() != null ? LocalDate.parse(request.getStartDate()) : null;
        LocalDate endDate = request.getEndDate() != null ? LocalDate.parse(request.getEndDate()) : null;

        Map<String, List<GearSuggestion>> groupedByPriority = new LinkedHashMap<>();

        for (GearCategoryRecommendation rec : flaskResponse.getRecommendations()) {
            String category = rec.getCategory();
            String priority = rec.getPriority();

            Pageable pageable = PageRequest.of(0, 20);
            Page<Gear> gearPage = gearRepository.findByStatusAndCategoryAndDeletedFalse(
                    GearStatus.AVAILABLE, category, pageable);

            List<Gear> gearList = gearPage.getContent();

            List<GearSuggestion> suggestions = gearList.stream()
                    .map(gear -> {
                        double rating = gear.getAverageRating() != null ? gear.getAverageRating() : 0.0;
                        double price = gear.getDailyPrice() != null ? gear.getDailyPrice().doubleValue() :
                                (gear.getPrice() != null ? gear.getPrice().doubleValue() : 1.0);
                        if (price <= 0) price = 1.0;

                        double valueScore = (rating * 0.6) + (1.0 / price * 0.4);

                        boolean available = true;
                        if (startDate != null && endDate != null) {
                            available = isAvailableForDates(gear.getId(), startDate, endDate);
                        }

                        String imageUrl = (gear.getImages() != null && !gear.getImages().isEmpty())
                                ? gear.getImages().get(0).getImageUrl()
                                : null;

                        GearSuggestion suggestion = new GearSuggestion();
                        suggestion.setGearId(gear.getId());
                        suggestion.setGearName(gear.getName());
                        suggestion.setCategory(gear.getCategory());
                        suggestion.setImageUrl(imageUrl);
                        suggestion.setPricePerDay(price);
                        suggestion.setAverageRating(rating);
                        suggestion.setAvailableForDates(available);
                        suggestion.setProviderId(gear.getOwnerId());

                        return new AbstractMap.SimpleEntry<>(valueScore, suggestion);
                    })
                    .sorted((a, b) -> Double.compare(b.getKey(), a.getKey()))
                    .limit(3)
                    .map(AbstractMap.SimpleEntry::getValue)
                    .collect(Collectors.toList());

            groupedByPriority.computeIfAbsent(priority, k -> new ArrayList<>()).addAll(suggestions);
        }

        List<String> priorityOrder = Arrays.asList("essential", "recommended", "optional");
        List<RecommendedGearGroup> groups = new ArrayList<>();

        for (String priority : priorityOrder) {
            List<GearSuggestion> items = groupedByPriority.get(priority);
            if (items != null && !items.isEmpty()) {
                groups.add(new RecommendedGearGroup(priority, items));
            }
        }

        return new GearRecommendationResult(
                flaskResponse.getDestination(),
                flaskResponse.getTerrain(),
                flaskResponse.getSeason(),
                groups
        );
    }

    public String checkFlaskHealth() {
        try {
            return restTemplate.getForObject(mlBaseUrl + "/health", String.class);
        } catch (ResourceAccessException e) {
            throw new RuntimeException(
                    "ML service unavailable — make sure gear_rec_app.py is running on port 5001", e);
        }
    }

    /**
     * Converts the camelCase Java request into a snake_case map that Flask expects.
     */
    private Map<String, Object> buildFlaskPayload(GearRecommendationRequest request) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("destination", request.getDestination());
        payload.put("month", request.getMonth());
        payload.put("duration_days", request.getDurationDays());
        payload.put("group_size", request.getGroupSize());
        payload.put("activity", request.getActivity());
        payload.put("experience_level", request.getExperienceLevel());
        return payload;
    }

    private boolean isAvailableForDates(String gearId, LocalDate startDate, LocalDate endDate) {
        List<RentalStatus> blockingStatuses = Arrays.asList(
                RentalStatus.APPROVED, RentalStatus.ACTIVE, RentalStatus.PENDING);
        List<Rental> rentals = rentalRepository.findByGearIdAndStatusIn(gearId, blockingStatuses);

        for (Rental rental : rentals) {
            if (rental.getStartDate().isBefore(endDate) && rental.getEndDate().isAfter(startDate)) {
                return false;
            }
        }
        return true;
    }
}
