package com.campconnect.user.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.campconnect.config.JwtUtils;
import com.campconnect.user.dto.AuthResponse;
import com.campconnect.user.dto.LoginRequest;
import com.campconnect.user.dto.RegisterRequest;
import com.campconnect.user.entity.ERole;
import com.campconnect.user.entity.Role;
import com.campconnect.user.entity.User;
import com.campconnect.user.repository.RoleRepository;
import com.campconnect.user.repository.UserRepository;

@Service
public class AuthService {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    RoleRepository roleRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        return new AuthResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles,
                userDetails.getProfileDetails());
    }

    public void registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            throw new RuntimeException("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()),
                signUpRequest.getName());

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        if (strRoles == null || strRoles.isEmpty()) {
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            if (strRoles.size() > 1) {
                throw new RuntimeException("Error: You can only select one role explicitly.");
            }
            strRoles.forEach(role -> {
                switch (role) {
                    case "camper":
                        Role camperRole = roleRepository.findByName(ERole.ROLE_CAMPER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(camperRole);
                        break;
                    case "equipment_provider":
                        Role equipmentProviderRole = roleRepository.findByName(ERole.ROLE_EQUIPMENT_PROVIDER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(equipmentProviderRole);
                        break;
                    case "site_owner":
                        Role siteOwnerRole = roleRepository.findByName(ERole.ROLE_SITE_OWNER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(siteOwnerRole);
                        break;
                    case "organizer":
                        Role organizerRole = roleRepository.findByName(ERole.ROLE_ORGANIZER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(organizerRole);
                        break;
                    case "delivery_provider":
                        Role deliveryProviderRole = roleRepository.findByName(ERole.ROLE_DELIVERY_PROVIDER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(deliveryProviderRole);
                        break;
                    case "admin":
                        throw new RuntimeException("Error: Admin role cannot be selected manually.");
                    default:
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);

        if (signUpRequest.getProfileDetails() != null) {
            user.setProfileDetails(signUpRequest.getProfileDetails());
        }

        user.setRoles(roles);
        userRepository.save(user);
    }
}
