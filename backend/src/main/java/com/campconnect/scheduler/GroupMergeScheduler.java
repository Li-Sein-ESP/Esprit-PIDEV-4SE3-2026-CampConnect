package com.campconnect.scheduler;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.campconnect.model.Group;
import com.campconnect.model.GroupMergeProposal;
import com.campconnect.model.TripIntent;
import com.campconnect.model.TripIntentStatus;
import com.campconnect.repository.GroupMergeProposalRepository;
import com.campconnect.repository.TripIntentRepository;
import com.campconnect.service.IGroupService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class GroupMergeScheduler {

    private final TripIntentRepository tripIntentRepository;
    private final GroupMergeProposalRepository proposalRepository;
    private final IGroupService groupService;

    // Runs every minute for demonstration purposes
    @Scheduled(fixedRate = 60000)
    public void generateMergeProposals() {
        try {
            log.info("Starting Group Merge Scheduler...");

            // 1. Find all small open trips (Aggregation with Join)
            List<TripIntent> smallTrips = tripIntentRepository.findSmallOpenTrips();
            log.info("Found {} small trips (less than 3 members)", smallTrips.size());

            for (TripIntent sourceTrip : smallTrips) {
                try {
                    // Ensure source group exists
                    if (sourceTrip.getGroupId() == null) {
                        groupService.getGroupByTripId(sourceTrip.getId())
                                .ifPresent(g -> sourceTrip.setGroupId(g.getId()));
                    }
                    if (sourceTrip.getGroupId() == null) continue;

                    // 2. Find similar trips using complex Keyword Query
                    List<TripIntent> similarTrips = tripIntentRepository.findByPreferredZoneAndCampingStyleAndStatus(
                        sourceTrip.getPreferredZone(),
                        sourceTrip.getCampingStyle(),
                        TripIntentStatus.OPEN
                    );

                    for (TripIntent targetTrip : similarTrips) {
                        if (sourceTrip.getId().equals(targetTrip.getId())) continue;

                        if (targetTrip.getGroupId() == null) {
                            groupService.getGroupByTripId(targetTrip.getId())
                                    .ifPresent(g -> targetTrip.setGroupId(g.getId()));
                        }
                        if (targetTrip.getGroupId() == null) continue;

                        // Check if proposal already exists (both directions)
                        boolean exists = proposalRepository.findBySourceGroupIdAndTargetGroupId(
                                sourceTrip.getGroupId(), targetTrip.getGroupId()).isPresent() ||
                            proposalRepository.findBySourceGroupIdAndTargetGroupId(
                                targetTrip.getGroupId(), sourceTrip.getGroupId()).isPresent();

                        if (!exists) {
                            GroupMergeProposal proposal = GroupMergeProposal.builder()
                                .sourceGroupId(sourceTrip.getGroupId())
                                .targetGroupId(targetTrip.getGroupId())
                                .targetTripTitle(targetTrip.getTitle())
                                .status("PENDING")
                                .message("L'IA a trouvé un groupe similaire allant vers "
                                    + sourceTrip.getPreferredZone() + ". Fusionnez pour économiser !")
                                .matchScore(85.5 + (Math.random() * 10))
                                .createdAt(LocalDateTime.now())
                                .build();

                            proposalRepository.save(proposal);
                            log.info("Created merge proposal between {} and {}",
                                sourceTrip.getGroupId(), targetTrip.getGroupId());
                            break; // One proposal per source trip per run
                        }
                    }
                } catch (Exception innerEx) {
                    log.error("Error processing sourceTrip {}: {}", sourceTrip.getId(), innerEx.getMessage(), innerEx);
                }
            }
        } catch (Exception ex) {
            // CRITICAL: must catch here — uncaught exceptions kill the @Scheduled thread permanently
            log.error("GroupMergeScheduler failed: {}", ex.getMessage(), ex);
        }
    }
}
