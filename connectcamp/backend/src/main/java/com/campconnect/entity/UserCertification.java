package com.campconnect.entity;

import com.campconnect.model.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.campconnect.enums.CertificationStatus;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Document(collection = "user_certifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserCertification {
    @Id
    private String id;

    @DBRef
    private Certification certification;

    @DBRef
    private User user;
    private LocalDateTime earnedDate;
    private LocalDateTime expiryDate;
    private String certificateUrl;
    private CertificationStatus status; // 'active', 'expired', 'revoked'
}
