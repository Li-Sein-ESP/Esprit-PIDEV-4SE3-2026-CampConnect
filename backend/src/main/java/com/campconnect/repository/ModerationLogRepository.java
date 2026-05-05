package com.campconnect.repository;

import com.campconnect.model.ModerationLog;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface ModerationLogRepository extends MongoRepository<ModerationLog, String> {

    // RÈGLE 2 : Équivalent JPQL (Jointure Complexe avec Agrégation)
    // Cette requête joint la table ModerationLog avec la table User pour enrichir les logs.
    @Aggregation(pipeline = {
        "{ '$lookup': { 'from': 'users', 'let': { 'uId': '$userId' }, 'pipeline': [ { '$match': { '$expr': { '$eq': [ { '$toString': '$_id' }, '$$uId' ] } } } ], 'as': 'userDetails' } }",
        "{ '$unwind': { 'path': '$userDetails', 'preserveNullAndEmptyArrays': true } }",
        "{ '$project': { 'id': 1, 'userId': 1, 'username': { '$ifNull': ['$userDetails.username', 'Utilisateur Inconnu'] }, 'entityType': 1, 'originalContent': 1, 'reason': 1, 'createdAt': 1, 'strikeCount': { '$ifNull': ['$userDetails.banCount', 0] } } }",
        "{ '$sort': { 'createdAt': -1 } }"
    })
    List<Map<String, Object>> findAllWithUserDetails();
    
    List<ModerationLog> findByUserIdOrderByCreatedAtDesc(String userId);
}
