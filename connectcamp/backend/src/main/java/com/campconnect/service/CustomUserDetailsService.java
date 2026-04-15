package com.campconnect.service;

import com.campconnect.model.User;

import com.campconnect.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomUserDetailsService implements UserDetailsService {
	@Autowired
	UserRepository userRepository;

	@Override
	@Transactional
	public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
		User user = userRepository.findByUsernameOrEmail(identifier, identifier)
				.orElseThrow(() -> new UsernameNotFoundException("User Not Found with username or email: " + identifier));

		return UserDetailsImpl.build(user);
	}
}
