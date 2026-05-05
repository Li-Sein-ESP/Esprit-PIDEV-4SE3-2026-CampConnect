package com.campconnect.model;

import java.util.Map;
import java.util.HashSet;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "users")
@Data
@NoArgsConstructor
public class User {
	@Id
	private String id;

	private String username;

	private String email;

	private String password;

	private String name;

	@DBRef
	private Set<Role> roles = new HashSet<>();

	private boolean verifiedExpert = false;
	private int banCount = 0;
	private Map<String, Object> profileDetails;

	private java.time.LocalDateTime createdAt;

	public User(String username, String email, String password, String name) {
		this.username = username;
		this.email = email;
		this.password = password;
		this.name = name;
		this.createdAt = java.time.LocalDateTime.now();
	}

	public void addRole(Role role) {
		this.roles.add(role);
	}

	public void removeRole(Role role) {
		this.roles.remove(role);
	}
}
