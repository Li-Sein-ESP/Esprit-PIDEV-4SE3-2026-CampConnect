package com.campconnect.academy.service.impl;
<<<<<<< HEAD
import com.campconnect.academy.service.ICertificationServices;

import com.campconnect.model.User;

import com.campconnect.academy.dto.CertificationDTO;
import com.campconnect.academy.dto.UserCertificationDTO;
=======

import com.campconnect.academy.service.ICertificationServices;
import com.campconnect.model.User;
import com.campconnect.academy.dto.CertificationDTO;
import com.campconnect.academy.dto.UserCertificationDTO;
import com.campconnect.dto.CertificationStatsDTO;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import com.campconnect.academy.entity.Certification;
import com.campconnect.academy.entity.UserCertification;
import com.campconnect.enums.CertificationStatus;
import com.campconnect.academy.repository.CertificationRepository;
import com.campconnect.academy.repository.UserCertificationRepository;
import com.campconnect.academy.repository.CourseRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.academy.entity.Course;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
<<<<<<< HEAD
import java.util.List;
=======
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import java.util.stream.Collectors;

@Service
public class CertificationServicesImpl implements ICertificationServices {

    @Autowired
    private CertificationRepository certificationRepository;
    
    @Autowired
    private UserCertificationRepository userCertificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Override
    public List<CertificationDTO> getAllCertificationPrograms() {
        return certificationRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CertificationDTO getCertificationProgramById(String id) {
        return certificationRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Override
    public CertificationDTO createCertificationProgram(CertificationDTO dto) {
        Certification cert = convertToEntity(dto);
        return convertToDTO(certificationRepository.save(cert));
    }

    @Override
    public CertificationDTO updateCertificationProgram(String id, CertificationDTO dto) {
        if (!certificationRepository.existsById(id)) return null;
        Certification cert = convertToEntity(dto);
        cert.setId(id);
        return convertToDTO(certificationRepository.save(cert));
    }

    @Override
    public void deleteCertificationProgram(String id) {
        certificationRepository.deleteById(id);
    }

    @Override
    public List<UserCertificationDTO> getUserCertifications(String userId) {
        return userCertificationRepository.findByUserId(userId).stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }

    @Override
    public UserCertificationDTO earnCertification(UserCertificationDTO dto) {
        UserCertification userCert = new UserCertification();
        
        certificationRepository.findById(dto.getCertificationId())
            .ifPresent(userCert::setCertification);
            
        userRepository.findById(dto.getUserId())
            .ifPresent(userCert::setUser);
            
        userCert.setEarnedDate(LocalDateTime.now());
        userCert.setExpiryDate(LocalDateTime.now().plusYears(1));
        userCert.setStatus(CertificationStatus.ACTIVE);
        return convertToUserDTO(userCertificationRepository.save(userCert));
    }

<<<<<<< HEAD
=======
    @Override
    public CertificationDTO getCertificationByCourseId(String courseId) {
        List<Certification> certs = certificationRepository.findByRequiredCoursesId(courseId);
        if (certs.isEmpty()) return null;
        return convertToDTO(certs.get(0));
    }

>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
    private CertificationDTO convertToDTO(Certification cert) {
        CertificationDTO dto = new CertificationDTO();
        dto.setId(cert.getId());
        dto.setName(cert.getName());
        dto.setDescription(cert.getDescription());
        dto.setRequirements(cert.getRequirements());
        dto.setValidityPeriod(cert.getValidityPeriod());
        dto.setImageUrl(cert.getImageUrl());
        dto.setIssuer(cert.getIssuer());
        
        if (cert.getCreator() != null) {
            dto.setCreatorId(cert.getCreator().getId());
            dto.setCreatorName(cert.getCreator().getName());
        }

        if (cert.getRequiredCourses() != null) {
            dto.setRequiredCourseIds(cert.getRequiredCourses().stream()
                .filter(course -> course != null && course.getId() != null)
                .map(Course::getId)
                .collect(Collectors.toList()));
        }
        return dto;
    }

    private Certification convertToEntity(CertificationDTO dto) {
        Certification cert = new Certification();
        cert.setName(dto.getName());
        cert.setDescription(dto.getDescription());
        cert.setRequirements(dto.getRequirements());
        cert.setValidityPeriod(dto.getValidityPeriod());
        cert.setImageUrl(dto.getImageUrl());
        cert.setIssuer(dto.getIssuer());
        
        // Handle Traceability: assign creator safely
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof UserDetails) {
            String username = ((UserDetails)auth.getPrincipal()).getUsername();
            userRepository.findByUsername(username).ifPresent(cert::setCreator);
        }

        if (dto.getRequiredCourseIds() != null && !dto.getRequiredCourseIds().isEmpty()) {
            cert.setRequiredCourses(courseRepository.findAllById(dto.getRequiredCourseIds()));
        }
        
        return cert;
    }
    
    private UserCertificationDTO convertToUserDTO(UserCertification cert) {
        UserCertificationDTO dto = new UserCertificationDTO();
        if (cert.getCertification() != null) {
            dto.setCertificationId(cert.getCertification().getId());
            dto.setCertificationName(cert.getCertification().getName());
        }
        if (cert.getUser() != null) {
            dto.setUserId(cert.getUser().getId());
            dto.setUsername(cert.getUser().getUsername());
        }
        dto.setEarnedDate(cert.getEarnedDate());
        dto.setExpiryDate(cert.getExpiryDate());
        dto.setCertificateUrl(cert.getCertificateUrl());
        dto.setStatus(cert.getStatus());
        return dto;
    }
<<<<<<< HEAD
=======

    /**
     * TÂCHE 2 – Complex MongoDB Aggregation Logic (represented by Java Stream grouping).
     *
     * In this implementation, we simulate the aggregation pipeline by:
     * 1. Retrieving all UserCertifications from the database
     * 2. Grouping them by their parent Certification program
     * 3. Aggregating counts for total issued, active, and expired status
     *
     * This provides the statistics required by the Admin Governance Dashboard.
     */
    @Override
    public List<CertificationStatsDTO> getCertificationStats() {
        List<UserCertification> allUserCerts = userCertificationRepository.findAll();

        Map<String, List<UserCertification>> groupedByCertification = allUserCerts.stream()
            .filter(uc -> uc.getCertification() != null)
            .collect(Collectors.groupingBy(uc -> uc.getCertification().getId()));

        List<CertificationStatsDTO> stats = new ArrayList<>();
        for (Map.Entry<String, List<UserCertification>> entry : groupedByCertification.entrySet()) {
            String certId = entry.getKey();
            List<UserCertification> certsForProgram = entry.getValue();

            long total = certsForProgram.size();
            long activeCount = certsForProgram.stream()
                .filter(uc -> CertificationStatus.ACTIVE.equals(uc.getStatus()))
                .count();
            long expiredCount = certsForProgram.stream()
                .filter(uc -> CertificationStatus.EXPIRED.equals(uc.getStatus()))
                .count();

            String certName = certsForProgram.get(0).getCertification().getName();

            stats.add(new CertificationStatsDTO(certId, certName, total, activeCount, expiredCount));
        }

        return stats;
    }

    /**
     * TÂCHE 3 – Multi-entity technical requirement.
     *
     * This method leverages the custom repository method 'findByUser_IdAndStatus'
     * which traverses the @DBRef to User while filtering by Status.
     */
    @Override
    public List<UserCertificationDTO> getUserCertificationsByStatus(String userId, String status) {
        CertificationStatus certStatus = CertificationStatus.fromString(status);
        if (certStatus == null) return List.of();
        
        return userCertificationRepository.findByUser_IdAndStatus(userId, certStatus).stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
