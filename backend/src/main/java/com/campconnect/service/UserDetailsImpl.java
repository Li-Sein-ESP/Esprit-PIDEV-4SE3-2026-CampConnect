package com.campconnect.service;

<<<<<<< HEAD
=======
import com.campconnect.model.Role;

import com.campconnect.model.User;

>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

<<<<<<< HEAD
import com.campconnect.model.User;
=======
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
import com.fasterxml.jackson.annotation.JsonIgnore;

public class UserDetailsImpl implements UserDetails {
	private static final long serialVersionUID = 1L;

	private String id;

	private String username;

	private String email;

	@JsonIgnore
	private String password;

	private Collection<? extends GrantedAuthority> authorities;
<<<<<<< HEAD

	private boolean verifiedExpert;

	private java.util.Map<String, Object> profileDetails;

	public UserDetailsImpl(String id, String username, String email, String password,
			boolean verifiedExpert, Collection<? extends GrantedAuthority> authorities,
			java.util.Map<String, Object> profileDetails) {
=======
	private java.util.Map<String, Object> profileDetails;

	public UserDetailsImpl(String id, String username, String email, String password,
			Collection<? extends GrantedAuthority> authorities, java.util.Map<String, Object> profileDetails) {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
		this.id = id;
		this.username = username;
		this.email = email;
		this.password = password;
<<<<<<< HEAD
		this.verifiedExpert = verifiedExpert;
=======
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
		this.authorities = authorities;
		this.profileDetails = profileDetails;
	}

<<<<<<< HEAD
	public java.util.Map<String, Object> getProfileDetails() {
		return profileDetails;
	}

	public static UserDetailsImpl build(User user) {
		List<GrantedAuthority> authorities = user.getRoles().stream()
=======
	public static UserDetailsImpl build(User user) {
		List<GrantedAuthority> authorities = user.getRoles().stream()
				.filter(role -> role != null && role.getName() != null)
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
				.map(role -> new SimpleGrantedAuthority(role.getName().name()))
				.collect(Collectors.toList());

		return new UserDetailsImpl(
				user.getId(),
				user.getUsername(),
				user.getEmail(),
				user.getPassword(),
<<<<<<< HEAD
				user.isVerifiedExpert(),
=======
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
				authorities,
				user.getProfileDetails());
	}

<<<<<<< HEAD
	public boolean isVerifiedExpert() {
		return verifiedExpert;
	}

=======
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	public String getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

<<<<<<< HEAD
=======
	public java.util.Map<String, Object> getProfileDetails() {
		return profileDetails;
	}

>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
	@Override
	public String getPassword() {
		return password;
	}

	@Override
	public String getUsername() {
		return username;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}

	@Override
	public boolean equals(Object o) {
		if (this == o)
			return true;
		if (o == null || getClass() != o.getClass())
			return false;
		UserDetailsImpl user = (UserDetailsImpl) o;
		return Objects.equals(id, user.id);
	}
}
