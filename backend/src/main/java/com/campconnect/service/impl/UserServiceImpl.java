package com.campconnect.service.impl;

import com.campconnect.model.ERole;
import com.campconnect.model.Role;
import com.campconnect.model.User;
import com.campconnect.repository.RoleRepository;
import com.campconnect.repository.UserRepository;
import com.campconnect.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public User findById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public void assignRoleToUser(String username, String roleName) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        ERole eRole = ERole.valueOf("ROLE_" + roleName.toUpperCase());
        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Error: Role not found."));
        
        user.addRole(role);
        userRepository.save(user);
    }

    @Override
    public void removeRoleFromUser(String username, String roleName) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
        
        ERole eRole = ERole.valueOf("ROLE_" + roleName.toUpperCase());
        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Error: Role not found."));
        
        user.removeRole(role);
        userRepository.save(user);
    }

    @Override
    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
    }

    @Override
    public java.util.List<User> findAll() {
        return userRepository.findAll();
    }
}
