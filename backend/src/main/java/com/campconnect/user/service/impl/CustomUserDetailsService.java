package com.campconnect.user.service.impl;

import com.campconnect.user.entity.User;
import com.campconnect.user.repository.UserRepository;
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
	public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
		// If the input ends with "@admin", resolve to the default admin account
		if (usernameOrEmail != null && usernameOrEmail.toLowerCase().endsWith("@admin")) {
			User admin = userRepository.findByUsername("admin")
					.orElseThrow(() -> new UsernameNotFoundException(
							"Admin user not found. Please ensure the admin account is seeded."));
			return UserDetailsImpl.build(admin);
		}

		User user = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
				.orElseThrow(() -> new UsernameNotFoundException(
						"User Not Found with username or email: " + usernameOrEmail));

		return UserDetailsImpl.build(user);
	}
}
