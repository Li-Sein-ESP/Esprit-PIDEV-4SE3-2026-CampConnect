package com.campconnect.service;

import com.campconnect.model.ERole;
import com.campconnect.model.User;

public interface UserService {
    void assignRoleToUser(String username, String roleName);
    void removeRoleFromUser(String username, String roleName);
    User getUserById(String id);
    User findById(String id);
    java.util.List<User> findAll();
}
