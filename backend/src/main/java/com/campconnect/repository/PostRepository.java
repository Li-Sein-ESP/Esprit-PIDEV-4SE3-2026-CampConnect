package com.campconnect.repository;

import com.campconnect.model.Post;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    void deleteByThreadId(String threadId);
    
    @Query("{ 'threadId' : ?0 }")
    List<Post> findByThreadId(String threadId);

    @Query("{ 'moderationStatus' : ?0 }")
    List<Post> findByModerationStatus(String moderationStatus);

    // ── Fonction Complexe (Aggregation = "Join" MongoDB) ─────────────────────
    // Equivalent d'un JOIN SQL entre la collection 'follows' et 'posts' :
    //   SELECT posts.* FROM posts
    //   WHERE posts.authorId IN (SELECT followingId FROM follows WHERE followerId = ?0)
    //   AND posts.moderationStatus = 'APPROVED'
    //   ORDER BY posts.createdAt DESC
    @Aggregation(pipeline = {
        // Étape 1 : Filtrer les follows de l'utilisateur connecté (followerId = paramètre entré)
        "{ '$match': { 'authorId': { '$in': ?0 }, 'moderationStatus': 'APPROVED' } }",
        // Étape 2 : Trier par date de création (plus récent en premier)
        "{ '$sort': { 'createdAt': -1 } }"
    })
    List<Post> findApprovedPostsByAuthorIds(List<String> authorIds);
}
