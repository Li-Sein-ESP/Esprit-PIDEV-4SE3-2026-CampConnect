package com.campconnect.service;

import com.campconnect.model.User;

import com.campconnect.dto.CourseDTO;
import com.campconnect.entity.Course;
import com.campconnect.repository.CourseRepository;
import com.campconnect.repository.CategoryRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.entity.Category;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseServicesImpl implements ICourseServices {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public List<CourseDTO> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<com.campconnect.dto.UserSummaryDTO> getExperts() {
        return userRepository.findAll().stream()
                .map(user -> new com.campconnect.dto.UserSummaryDTO(user.getId(), user.getUsername(), user.getName(), user.isVerifiedExpert()))
                .collect(Collectors.toList());
    }

    @Override
    public CourseDTO getCourseById(String id) {
        return courseRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public CourseDTO createCourse(CourseDTO courseDTO) {
        Course course = convertToEntity(courseDTO);
        Course savedCourse = courseRepository.save(course);
        return convertToDTO(savedCourse);
    }

    @Override
    public CourseDTO updateCourse(String id, CourseDTO courseDTO) {
        if (!courseRepository.existsById(id)) return null;
        Course course = convertToEntity(courseDTO);
        course.setId(id);
        Course updatedCourse = courseRepository.save(course);
        return convertToDTO(updatedCourse);
    }

    @Override
    public void deleteCourse(String id) {
        courseRepository.deleteById(id);
    }

    private CourseDTO convertToDTO(Course course) {
        CourseDTO dto = new CourseDTO();
        dto.setId(course.getId());
        dto.setTitle(course.getTitle());
        try {
            if (course.getCategory() != null) {
                dto.setCategoryName(course.getCategory().getName());
            }
        } catch (Exception e) {
            // Handle dangling DBRef
        }

        dto.setDifficulty(com.campconnect.enums.DifficultyLevel.fromString(course.getDifficulty()));
        dto.setDuration(course.getDuration());
        dto.setEnrolledCount(course.getEnrolledCount());
        dto.setRating(course.getRating());
        dto.setReviews(course.getReviews());
        dto.setPrice(course.getPrice());
        dto.setImageUrl(course.getImageUrl());
        dto.setDocumentUrl(course.getDocumentUrl());
        dto.setTags(course.getTags());
        dto.setPrerequisites(course.getPrerequisites());
        dto.setPassingScore(course.getPassingScore());
        dto.setDescription(course.getDescription());
        
        try {
            if (course.getCreator() != null) {
                dto.setCreatorId(course.getCreator().getId());
                dto.setCreatorName(course.getCreator().getName());
            }
        } catch (Exception e) {
            // Handle dangling DBRef
        }
        
        try {
            if (course.getInstructor() != null) {
                dto.setInstructorId(course.getInstructor().getId());
                dto.setInstructorName(course.getInstructor().getName());
            }
        } catch (Exception e) {
            // Handle dangling DBRef
        }
        return dto;
    }

    private Course convertToEntity(CourseDTO dto) {
        Course course = new Course();
        course.setTitle(dto.getTitle());
        course.setDescription(dto.getDescription());
        
        // Handle Category
        if (dto.getCategoryName() != null) {
            Category category = categoryRepository.findByName(dto.getCategoryName())
                .orElseGet(() -> categoryRepository.save(new Category(dto.getCategoryName(), "")));
            course.setCategory(category);
        }
        
        course.setDifficulty(dto.getDifficulty() != null ? dto.getDifficulty().name() : null);
        course.setDuration(dto.getDuration());
        course.setPrice(dto.getPrice());
        course.setImageUrl(dto.getImageUrl());
        course.setDocumentUrl(dto.getDocumentUrl());
        course.setTags(dto.getTags());
        course.setPrerequisites(dto.getPrerequisites());
        course.setPassingScore(dto.getPassingScore());
        
        // Handle traceability: assign creator safely
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails)auth.getPrincipal()).getUsername();
            userRepository.findByUsername(username).ifPresent(course::setCreator);
        }

        // Handle Instructor
        if (dto.getInstructorId() != null) {
            userRepository.findById(dto.getInstructorId()).ifPresent(course::setInstructor);
        }
        
        return course;
    }
}
