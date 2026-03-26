package com.campconnect.user.service.impl;

import com.campconnect.user.entity.User;
import com.campconnect.user.repository.UserRepository;
import com.campconnect.user.service.IUserService;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements IUserService {
    private final UserRepository userRepository;

    @Override
    public User findById(String id) { return userRepository.findById(id).orElse(null); }

    @Override
    public List<User> findAll() { return userRepository.findAll(); }

    @Override
    public User save(User user) { return userRepository.save(user); }
}
