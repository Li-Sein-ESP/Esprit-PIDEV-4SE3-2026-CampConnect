package com.campconnect.user.service;

import com.campconnect.user.entity.User;
import com.campconnect.user.dto.UserDTO;
import java.util.List;

public interface IUserService {
    User findById(String id);
    List<User> findAll();
    User save(User user);
}
