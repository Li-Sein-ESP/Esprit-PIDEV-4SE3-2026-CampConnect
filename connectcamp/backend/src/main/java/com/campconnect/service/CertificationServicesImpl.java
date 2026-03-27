package com.campconnect.service;

import com.campconnect.model.User;

import com.campconnect.dto.CertificationDTO;
import com.campconnect.dto.UserCertificationDTO;
import com.campconnect.entity.Certification;
import com.campconnect.entity.UserCertification;
import com.campconnect.enums.CertificationStatus;
import com.campconnect.repository.CertificationRepository;
import com.campconnect.repository.UserCertificationRepository;
import com.campconnect.repository.CourseRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.entity.Course;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
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
}
