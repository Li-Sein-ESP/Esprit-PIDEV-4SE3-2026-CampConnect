package com.campconnect.academy.service;

import com.campconnect.academy.dto.CertificationDTO;
import com.campconnect.academy.dto.UserCertificationDTO;
import com.campconnect.dto.CertificationStatsDTO;
import java.util.List;

public interface ICertificationServices {
    List<CertificationDTO> getAllCertificationPrograms();
    CertificationDTO getCertificationProgramById(String id);
    CertificationDTO createCertificationProgram(CertificationDTO dto);
    CertificationDTO updateCertificationProgram(String id, CertificationDTO dto);
    void deleteCertificationProgram(String id);
    List<UserCertificationDTO> getUserCertifications(String userId);
    UserCertificationDTO earnCertification(UserCertificationDTO dto);
    List<CertificationStatsDTO> getCertificationStats();
    List<UserCertificationDTO> getUserCertificationsByStatus(String userId, String status);
    CertificationDTO getCertificationByCourseId(String courseId);
    List<CertificationDTO> searchCertifications(String keyword);
}
