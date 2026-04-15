package com.campconnect.dto;

import com.campconnect.model.Role;

import java.util.Set;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    private String name;
    private Set<String> role;
    private java.util.Map<String, Object> profileDetails;
}
