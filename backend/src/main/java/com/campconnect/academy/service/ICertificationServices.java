package com.campconnect.academy.service;

import com.campconnect.academy.dto.CertificationDTO;
import com.campconnect.academy.dto.UserCertificationDTO;
import java.util.List;

public interface ICertificationServices {
    List<CertificationDTO> getAllCertificationPrograms();
    CertificationDTO getCertificationProgramById(String id);
    CertificationDTO createCertificationProgram(CertificationDTO dto);
    CertificationDTO updateCertificationProgram(String id, CertificationDTO dto);
    void deleteCertificationProgram(String id);
    List<UserCertificationDTO> getUserCertifications(String userId);
    UserCertificationDTO earnCertification(UserCertificationDTO dto);
}
