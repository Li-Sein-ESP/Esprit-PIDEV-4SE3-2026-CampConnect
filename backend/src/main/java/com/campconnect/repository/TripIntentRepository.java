package com.campconnect.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.campconnect.model.TripIntent;
import com.campconnect.model.TripIntentStatus;

@Repository
public interface TripIntentRepository extends MongoRepository<TripIntent, String> {
    List<TripIntent> findByCreatorUserId(String creatorUserId);

    List<TripIntent> findByStatus(TripIntentStatus status);

    List<TripIntent> findByStatusAndDateToBefore(TripIntentStatus status, java.time.LocalDateTime date);
    
    List<TripIntent> findByStatusAndDateToAfter(TripIntentStatus status, java.time.LocalDateTime date);

    List<TripIntent> findByCampingStyle(String campingStyle);

    List<TripIntent> findByIsTrendingTrue();

    @Aggregation(pipeline = {
            "{ $addFields: { idString: { $toString: '$_id' } } }",
            "{ $lookup: { from: 'groups', localField: 'idString', foreignField: 'tripId', as: 'groupDocs' } }",
            "{ $unwind: { path: '$groupDocs', preserveNullAndEmptyArrays: false } }",
            "{ $addFields: { memberCount: { $size: '$groupDocs.memberUserIds' } } }",
            "{ $match: { memberCount: { $gt: 3 } } }"
    })
    List<TripIntent> findTrendingCandidates();

    // EXIGENCE 2: Complex Aggregation with Joins
    @Aggregation(pipeline = {
            "{ $match: { status: 'OPEN' } }",
            "{ $addFields: { idString: { $toString: '$_id' } } }",
            "{ $lookup: { from: 'groups', localField: 'idString', foreignField: 'tripId', as: 'groupDocs' } }",
            "{ $unwind: { path: '$groupDocs', preserveNullAndEmptyArrays: false } }",
            "{ $addFields: { memberCount: { $size: '$groupDocs.memberUserIds' } } }",
            "{ $match: { memberCount: { $lt: 3 } } }"
    })
    List<TripIntent> findSmallOpenTrips();

    // EXIGENCE 3: Complex Keyword Query
    List<TripIntent> findByPreferredZoneAndCampingStyleAndStatus(String preferredZone, String campingStyle, TripIntentStatus status);
}
