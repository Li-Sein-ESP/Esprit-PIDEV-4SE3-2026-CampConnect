package com.campconnect.controller;

import com.campconnect.dto.CourseDTO;
import com.campconnect.dto.BadgeDTO;
import com.campconnect.dto.CertificationDTO;
import com.campconnect.dto.VideoDTO;
import com.campconnect.service.ICourseServices;
import com.campconnect.service.IBadgeServices;
import com.campconnect.service.ICertificationServices;
import com.campconnect.service.IVideoServices;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AcademyControllerTest {

    private MockMvc mockMvc;
    private ObjectMapper objectMapper;

    @Mock private ICourseServices courseService;
    @Mock private IBadgeServices badgeService;
    @Mock private ICertificationServices certificationService;
    @Mock private IVideoServices videoService;

    @InjectMocks
    private AcademyController academyController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(academyController).build();
        objectMapper = new ObjectMapper();
    }

    // ─── COURSES ───────────────────────────────────────────────
    @Test
    void getAllCourses_ShouldReturn200AndList() throws Exception {
        CourseDTO c1 = new CourseDTO(); c1.setId("1"); c1.setTitle("Wilderness Survival");
        CourseDTO c2 = new CourseDTO(); c2.setId("2"); c2.setTitle("Navigation Skills");

        when(courseService.getAllCourses()).thenReturn(Arrays.asList(c1, c2));

        mockMvc.perform(get("/api/academy/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(2))
                .andExpect(jsonPath("$[0].title").value("Wilderness Survival"));
    }

    @Test
    void getCourseById_WhenExists_ShouldReturn200() throws Exception {
        CourseDTO course = new CourseDTO(); course.setId("1"); course.setTitle("Fire Craft 101");
        when(courseService.getCourseById("1")).thenReturn(course);

        mockMvc.perform(get("/api/academy/courses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Fire Craft 101"));
    }

    @Test
    void getCourseById_WhenNotFound_ShouldReturn404() throws Exception {
        when(courseService.getCourseById("999")).thenReturn(null);

        mockMvc.perform(get("/api/academy/courses/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteCourse_ShouldReturn204() throws Exception {
        doNothing().when(courseService).deleteCourse("1");

        mockMvc.perform(delete("/api/academy/courses/1"))
                .andExpect(status().isNoContent());

        verify(courseService, times(1)).deleteCourse("1");
    }

    // ─── CERTIFICATIONS ────────────────────────────────────────
    @Test
    void getAllCertifications_ShouldReturn200AndList() throws Exception {
        CertificationDTO cert = new CertificationDTO();
        cert.setId("cert-1"); cert.setName("Master Camper");

        when(certificationService.getAllCertificationPrograms()).thenReturn(List.of(cert));

        mockMvc.perform(get("/api/academy/certifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Master Camper"));
    }

    @Test
    void getCertificationById_WhenNotFound_ShouldReturn404() throws Exception {
        when(certificationService.getCertificationProgramById("999")).thenReturn(null);

        mockMvc.perform(get("/api/academy/certifications/999"))
                .andExpect(status().isNotFound());
    }

    // ─── VIDEOS ────────────────────────────────────────────────
    @Test
    void getAllVideos_ShouldReturn200AndList() throws Exception {
        VideoDTO video = new VideoDTO(); video.setId("v1"); video.setTitle("How to Build a Shelter");

        when(videoService.getAllVideos()).thenReturn(List.of(video));

        mockMvc.perform(get("/api/academy/videos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("How to Build a Shelter"));
    }

    @Test
    void deleteVideo_ShouldReturn204() throws Exception {
        doNothing().when(videoService).deleteVideo("v1");

        mockMvc.perform(delete("/api/academy/videos/v1"))
                .andExpect(status().isNoContent());

        verify(videoService, times(1)).deleteVideo("v1");
    }
}
