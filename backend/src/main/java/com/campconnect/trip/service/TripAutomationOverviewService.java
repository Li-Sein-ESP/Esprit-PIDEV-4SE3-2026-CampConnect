package com.campconnect.trip.service;

import com.campconnect.transport.entity.Transport;
import com.campconnect.transport.enums.TransportStatus;
import com.campconnect.transport.repository.TransportRepository;
import com.campconnect.trip.dto.TripAutomationOverviewResponse;
import com.campconnect.trip.dto.TripAutomationOverviewResponse.DelayedTransportSnapshotDto;
import com.campconnect.trip.dto.TripAutomationOverviewResponse.SchedulerCadenceDto;
import com.campconnect.trip.dto.TripAutomationOverviewResponse.TripStatusEngineDto;
import com.campconnect.trip.dto.TripAutomationOverviewResponse.UpcomingRemindersDto;
import com.campconnect.trip.entity.Activity;
import com.campconnect.trip.entity.Trip;
import com.campconnect.trip.enums.TripStatus;
import com.campconnect.trip.repository.ActivityRepository;
import com.campconnect.trip.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripAutomationOverviewService {

    private final TransportRepository transportRepository;
    private final ActivityRepository activityRepository;
    private final TripRepository tripRepository;

    public TripAutomationOverviewResponse buildOverview(boolean adminScope, String currentUserId) {
        Instant now = Instant.now();
        Instant oneHour = now.plus(1, ChronoUnit.HOURS);

        List<Trip> allTrips = tripRepository.findAll();
        List<Trip> visibleTrips = adminScope
                ? allTrips
                : allTrips.stream()
                        .filter(t -> currentUserId != null && currentUserId.equals(t.getUserId()))
                        .collect(Collectors.toList());

        List<DelayedTransportSnapshotDto> delayed = transportRepository.findAll().stream()
                .filter(t -> t.getStatus() == TransportStatus.DELAYED && t.getDelayMinutes() > 0)
                .filter(t -> canSeeTransport(t, visibleTrips, adminScope))
                .map(t -> toDelayedSnapshot(t, allTrips))
                .collect(Collectors.toList());

        List<Activity> upcomingActs = activityRepository.findAll().stream()
                .filter(a -> a.getStartTime() != null
                        && a.getStartTime().isAfter(now)
                        && a.getStartTime().isBefore(oneHour))
                .filter(a -> belongsToVisibleTrip(a, visibleTrips))
                .collect(Collectors.toList());

        List<Transport> upcomingTransports = transportRepository.findAll().stream()
                .filter(tr -> tr.getDepartureTime() != null
                        && tr.getDepartureTime().isAfter(now)
                        && tr.getDepartureTime().isBefore(oneHour))
                .filter(tr -> canSeeTransport(tr, visibleTrips, adminScope))
                .collect(Collectors.toList());

        List<String> actSummaries = upcomingActs.stream()
                .limit(20)
                .map(a -> String.format("%s @ %s", a.getName(), a.getStartTime()))
                .collect(Collectors.toList());

        List<String> trSummaries = upcomingTransports.stream()
                .limit(20)
                .map(tr -> String.format("%s %s — départ %s", Optional.ofNullable(tr.getProvider()).orElse("?"),
                        Optional.ofNullable(tr.getMode()).map(Enum::name).orElse(""),
                        tr.getDepartureTime()))
                .collect(Collectors.toList());

        long plannedToOngoing = visibleTrips.stream()
                .filter(t -> t.getStatus() == TripStatus.PLANNED
                        && t.getStartDate() != null && t.getStartDate().isBefore(now)
                        && t.getEndDate() != null && t.getEndDate().isAfter(now))
                .count();
        long toCompleted = visibleTrips.stream()
                .filter(t -> (t.getStatus() == TripStatus.ONGOING || t.getStatus() == TripStatus.PLANNED)
                        && t.getEndDate() != null && t.getEndDate().isBefore(now))
                .count();

        return TripAutomationOverviewResponse.builder()
                .generatedAt(now)
                .adminScope(adminScope)
                .schedulers(SchedulerCadenceDto.builder()
                        .smartReschedule("every 30 seconds — SmartRescheduleScheduler")
                        .itineraryNotifications("every 15 minutes — ItineraryNotificationScheduler")
                        .tripStatusUpdates("every 1 hour — TripStatusScheduler")
                        .build())
                .delayedTransports(delayed)
                .upcomingReminders(UpcomingRemindersDto.builder()
                        .windowStart(now)
                        .windowEnd(oneHour)
                        .activityCount(upcomingActs.size())
                        .transportCount(upcomingTransports.size())
                        .activitySummaries(actSummaries)
                        .transportSummaries(trSummaries)
                        .build())
                .tripStatusEngine(TripStatusEngineDto.builder()
                        .tripsEligiblePlannedToOngoing(plannedToOngoing)
                        .tripsEligibleToCompleted(toCompleted)
                        .build())
                .build();
    }

    private boolean canSeeTransport(Transport t, List<Trip> visibleTrips, boolean adminScope) {
        if (adminScope) {
            return true;
        }
        if (t.getTripId() == null) {
            return false;
        }
        return visibleTrips.stream().anyMatch(tr -> tr.getId().equals(t.getTripId()));
    }

    private DelayedTransportSnapshotDto toDelayedSnapshot(Transport t, List<Trip> allTrips) {
        String title = allTrips.stream()
                .filter(tr -> t.getTripId() != null && t.getTripId().equals(tr.getId()))
                .map(Trip::getTitle)
                .findFirst()
                .orElse("—");
        return DelayedTransportSnapshotDto.builder()
                .transportId(t.getId())
                .tripId(t.getTripId())
                .tripTitle(title)
                .delayMinutes(t.getDelayMinutes())
                .provider(t.getProvider())
                .mode(t.getMode() != null ? t.getMode().name() : null)
                .build();
    }

    private boolean belongsToVisibleTrip(Activity activity, List<Trip> visibleTrips) {
        if (activity.getItineraryId() == null) {
            return false;
        }
        return visibleTrips.stream()
                .anyMatch(trip -> trip.getItineraryIds() != null
                        && trip.getItineraryIds().contains(activity.getItineraryId()));
    }
}
