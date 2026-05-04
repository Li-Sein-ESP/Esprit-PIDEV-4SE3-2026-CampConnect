package com.campconnect.dto;

<<<<<<< HEAD
import java.util.Map;
=======
import com.campconnect.model.Role;

>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import java.util.Set;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String name;
    private Set<String> role;
<<<<<<< HEAD
    private Map<String, Object> profileDetails;
=======
    private java.util.Map<String, Object> profileDetails;
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
}
