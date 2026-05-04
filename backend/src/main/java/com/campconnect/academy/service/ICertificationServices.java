package com.campconnect.academy.service;

import com.campconnect.academy.dto.CertificationDTO;
import com.campconnect.academy.dto.UserCertificationDTO;
<<<<<<< HEAD
=======
import com.campconnect.dto.CertificationStatsDTO;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import java.util.List;

public interface ICertificationServices {
    List<CertificationDTO> getAllCertificationPrograms();
    CertificationDTO getCertificationProgramById(String id);
    CertificationDTO createCertificationProgram(CertificationDTO dto);
    CertificationDTO updateCertificationProgram(String id, CertificationDTO dto);
    void deleteCertificationProgram(String id);
    List<UserCertificationDTO> getUserCertifications(String userId);
    UserCertificationDTO earnCertification(UserCertificationDTO dto);
<<<<<<< HEAD
=======
    List<CertificationStatsDTO> getCertificationStats();
    List<UserCertificationDTO> getUserCertificationsByStatus(String userId, String status);
    CertificationDTO getCertificationByCourseId(String courseId);
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
