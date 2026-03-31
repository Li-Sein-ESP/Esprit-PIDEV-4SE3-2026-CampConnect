package com.campconnect.service;

import com.campconnect.dto.CertificationDTO;
import com.campconnect.dto.UserCertificationDTO;
import java.util.List;

public interface ICertificationServices {
    List<CertificationDTO> getAllCertificationPrograms();
    CertificationDTO getCertificationProgramById(String id);
    CertificationDTO createCertificationProgram(CertificationDTO dto);
    CertificationDTO updateCertificationProgram(String id, CertificationDTO dto);
    void deleteCertificationProgram(String id);
    List<UserCertificationDTO> getUserCertifications(String userId);
    UserCertificationDTO earnCertification(UserCertificationDTO dto);
    CertificationDTO getCertificationByCourseId(String courseId);
}
