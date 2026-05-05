package com.campconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.campconnect.enums.CertificationStatus;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCertificationDTO {
    private String certificationId;
    private String certificationName;
    private String userId;
    private String username;
    private LocalDateTime earnedDate;
    private LocalDateTime expiryDate;
    private String certificateUrl;
    private CertificationStatus status;
}
