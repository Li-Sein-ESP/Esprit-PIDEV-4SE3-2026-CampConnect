package com.campconnect.academy.service;

import com.campconnect.academy.dto.CourseDTO;
import com.campconnect.academy.dto.UserSummaryDTO;
import java.util.List;

public interface ICourseServices {
    List<CourseDTO> getAllCourses();
    List<UserSummaryDTO> getExperts();
    CourseDTO getCourseById(String id);
    CourseDTO createCourse(CourseDTO courseDTO);
    CourseDTO updateCourse(String id, CourseDTO courseDTO);
    void deleteCourse(String id);
}
