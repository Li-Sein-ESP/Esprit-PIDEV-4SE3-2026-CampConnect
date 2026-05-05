package com.campconnect.academy.controller;

import com.campconnect.model.User;

import com.campconnect.academy.dto.CourseDTO;
import com.campconnect.academy.dto.BadgeDTO;
import com.campconnect.academy.dto.CertificationDTO;
import com.campconnect.academy.service.ICourseServices;
import com.campconnect.academy.service.IBadgeServices;
import com.campconnect.academy.service.ICertificationServices;
import com.campconnect.academy.service.IVideoServices;
import com.campconnect.academy.dto.VideoDTO;
import com.campconnect.academy.dto.UserSummaryDTO;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

import com.campconnect.academy.dto.UserCertificationDTO;
import com.campconnect.dto.CertificationStatsDTO;
import com.campconnect.dto.CommentDTO;
import com.campconnect.service.AiIntegrationService;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/academy")
public class AcademyController {

    @Autowired
    private ICourseServices courseService;

    @Autowired
    private IBadgeServices badgeService;

    @Autowired
    private ICertificationServices certificationService;

    @Autowired
    private IVideoServices videoService;

    @Autowired
    private AiIntegrationService aiIntegrationService;

    // Courses
    @GetMapping("/courses")
    public List<CourseDTO> getAllCourses() {
        return courseService.getAllCourses();
    }

    @GetMapping("/experts")
    public List<UserSummaryDTO> getExperts() {
        return courseService.getExperts();
    }

    @GetMapping("/courses/{id}")
    public ResponseEntity<CourseDTO> getCourseById(@PathVariable String id) {
        CourseDTO course = courseService.getCourseById(id);
        return course != null ? ResponseEntity.ok(course) : ResponseEntity.notFound().build();
    }

    @PostMapping("/courses")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EXPERT') or hasRole('ORGANIZER')")
    public ResponseEntity<CourseDTO> createCourse(@Valid @RequestBody CourseDTO courseDTO) {
        return ResponseEntity.ok(courseService.createCourse(courseDTO));
    }

    @PutMapping("/courses/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EXPERT') or hasRole('ORGANIZER')")
    public ResponseEntity<CourseDTO> updateCourse(@PathVariable String id, @Valid @RequestBody CourseDTO courseDTO) {
        CourseDTO updated = courseService.updateCourse(id, courseDTO);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @PatchMapping("/courses/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CourseDTO> updateCourseStatus(@PathVariable String id, @RequestParam com.campconnect.enums.CourseStatus status) {
        CourseDTO updated = courseService.updateCourseStatus(id, status);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/courses/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCourse(@PathVariable String id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/courses/{id}/generate-quiz")
    public ResponseEntity<Map<String, Object>> generateCourseQuiz(@PathVariable String id) {
        CourseDTO course = courseService.getCourseById(id);
        if (course == null) {
            return ResponseEntity.notFound().build();
        }
        
        Map<String, Object> quizResponse = aiIntegrationService.generateQuizForCourse(course.getTitle(), course.getDescription());
        if (quizResponse == null || !quizResponse.containsKey("questions")) {
            // Fallback en cas d'erreur de l'IA
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("status", "error");
            fallback.put("message", "Le service IA est indisponible. Veuillez réessayer plus tard.");
            return ResponseEntity.status(503).body(fallback);
        }
        return ResponseEntity.ok(quizResponse);
    }

    // Badges
    @GetMapping("/badges")
    public List<BadgeDTO> getAllBadges() {
        return badgeService.getAllBadges();
    }

    @GetMapping("/badges/{id}")
    public ResponseEntity<BadgeDTO> getBadgeById(@PathVariable String id) {
        BadgeDTO badge = badgeService.getBadgeById(id);
        return badge != null ? ResponseEntity.ok(badge) : ResponseEntity.notFound().build();
    }

    @PostMapping("/badges")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BadgeDTO> createBadge(@Valid @RequestBody BadgeDTO badgeDTO) {
        return ResponseEntity.ok(badgeService.createBadge(badgeDTO));
    }

    @PutMapping("/badges/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BadgeDTO> updateBadge(@PathVariable String id, @Valid @RequestBody BadgeDTO badgeDTO) {
        BadgeDTO updated = badgeService.updateBadge(id, badgeDTO);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/badges/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBadge(@PathVariable String id) {
        badgeService.deleteBadge(id);
        return ResponseEntity.noContent().build();
    }

    // Certifications (Programs)
    @GetMapping("/certifications")
    public List<CertificationDTO> getAllCertificationPrograms() {
        return certificationService.getAllCertificationPrograms();
    }

    @GetMapping("/certifications/{id}")
    public ResponseEntity<CertificationDTO> getCertificationProgramById(@PathVariable String id) {
        CertificationDTO cert = certificationService.getCertificationProgramById(id);
        return cert != null ? ResponseEntity.ok(cert) : ResponseEntity.notFound().build();
    }

    @PostMapping("/certifications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CertificationDTO> createCertificationProgram(@Valid @RequestBody CertificationDTO dto) {
        return ResponseEntity.ok(certificationService.createCertificationProgram(dto));
    }

    @PutMapping("/certifications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CertificationDTO> updateCertificationProgram(@PathVariable String id, @Valid @RequestBody CertificationDTO dto) {
        CertificationDTO updated = certificationService.updateCertificationProgram(id, dto);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/certifications/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCertificationProgram(@PathVariable String id) {
        certificationService.deleteCertificationProgram(id);
        return ResponseEntity.noContent().build();
    }

    // User Certifications (Earned)
    @GetMapping("/users/{userId}/certifications")
    public List<UserCertificationDTO> getMyCertifications(@PathVariable String userId) {
        return certificationService.getUserCertifications(userId);
    }

    @GetMapping("/certifications/by-course/{courseId}")
    public ResponseEntity<CertificationDTO> getCertificationByCourseId(@PathVariable String courseId) {
        CertificationDTO cert = certificationService.getCertificationByCourseId(courseId);
        return cert != null ? ResponseEntity.ok(cert) : ResponseEntity.notFound().build();
    }

    @GetMapping("/certifications/search")
    public ResponseEntity<List<CertificationDTO>> searchCertifications(@RequestParam String q) {
        return ResponseEntity.ok(certificationService.searchCertifications(q));
    }

    /**
     * TÂCHE 2 – Endpoint for complex MongoDB aggregation (equivalent to JPQL JOIN).
     * Accessible to ADMIN only for dashboard analytics.
     */
    @GetMapping("/certifications/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CertificationStatsDTO>> getCertificationStats() {
        return ResponseEntity.ok(certificationService.getCertificationStats());
    }

    /**
     * TÂCHE 3 – Multi-entity keyword filter endpoint.
     */
    @GetMapping("/users/{userId}/certifications/filter")
    public ResponseEntity<List<UserCertificationDTO>> getUserCertificationsByStatus(
            @PathVariable String userId,
            @RequestParam String status) {
        return ResponseEntity.ok(certificationService.getUserCertificationsByStatus(userId, status));
    }

    @PostMapping("/users/certifications")
    public ResponseEntity<UserCertificationDTO> earnCertification(@Valid @RequestBody UserCertificationDTO dto) {
        return ResponseEntity.ok(certificationService.earnCertification(dto));
    }

    // Videos
    @GetMapping("/videos")
    public List<VideoDTO> getAllVideos() {
        return videoService.getAllVideos();
    }

    @GetMapping("/videos/{id}")
    public ResponseEntity<VideoDTO> getVideoById(@PathVariable String id) {
        VideoDTO video = videoService.getVideoById(id);
        return video != null ? ResponseEntity.ok(video) : ResponseEntity.notFound().build();
    }

    @PostMapping("/videos")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EXPERT') or hasRole('ORGANIZER')")
    public ResponseEntity<VideoDTO> createVideo(@Valid @RequestBody VideoDTO videoDTO) {
        return ResponseEntity.ok(videoService.createVideo(videoDTO));
    }

    @PutMapping("/videos/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('EXPERT') or hasRole('ORGANIZER')")
    public ResponseEntity<VideoDTO> updateVideo(@PathVariable String id, @Valid @RequestBody VideoDTO videoDTO) {
        VideoDTO updated = videoService.updateVideo(id, videoDTO);
        return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/videos/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVideo(@PathVariable String id) {
        videoService.deleteVideo(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/videos/category/{category}")
    public List<VideoDTO> getVideosByCategory(@PathVariable String category) {
        return videoService.getVideosByCategory(category);
    }

    @PostMapping("/videos/{id}/comments")
    public ResponseEntity<CommentDTO> addCommentToVideo(@PathVariable String id, @Valid @RequestBody CommentDTO commentDTO) {
        return ResponseEntity.ok(videoService.addComment(id, commentDTO));
    }

    @PostMapping("/videos/{id}/helpful")
    public ResponseEntity<VideoDTO> toggleVideoHelpful(@PathVariable String id) {
        return ResponseEntity.ok(videoService.toggleHelpful(id));
    }
}
