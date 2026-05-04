package com.campconnect.dto;

import java.util.List;
import lombok.Data;

@Data
public class AuthResponse {
	private String token;
	private String type = "Bearer";
	private String id;
	private String username;
	private String email;
	private List<String> roles;
	private java.util.Map<String, Object> profileDetails;

<<<<<<< HEAD
	public AuthResponse(String accessToken, String id, String username, String email, List<String> roles,
			java.util.Map<String, Object> profileDetails) {
=======
	public AuthResponse(String accessToken, String id, String username, String email, List<String> roles, java.util.Map<String, Object> profileDetails) {
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
		this.token = accessToken;
		this.id = id;
		this.username = username;
		this.email = email;
		this.roles = roles;
		this.profileDetails = profileDetails;
	}
}
