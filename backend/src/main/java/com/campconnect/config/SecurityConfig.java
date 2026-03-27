package com.campconnect.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.Customizer;

import com.campconnect.service.CustomUserDetailsService;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {
  @Autowired
  CustomUserDetailsService userDetailsService;

  @Autowired
  private com.campconnect.config.AuthEntryPointJwt unauthorizedHandler;

  @Bean
  public AuthTokenFilter authenticationJwtTokenFilter() {
    return new AuthTokenFilter();
  }

  @Bean
  public DaoAuthenticationProvider authenticationProvider() {
    DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();

    authProvider.setUserDetailsService(userDetailsService);
    authProvider.setPasswordEncoder(passwordEncoder());

    return authProvider;
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
    return authConfig.getAuthenticationManager();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // Public
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/test/**").permitAll()
            // Swagger UI
            .requestMatchers("/swagger-ui/**", "/swagger-ui.html",
                "/v3/api-docs/**", "/v3/api-docs")
            .permitAll()
            // Public marketplace browsing
            .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/gear/**").permitAll()
            .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/categories/**").permitAll()
            .requestMatchers(org.springframework.http.HttpMethod.GET, "/uploads/**").permitAll()
            // Admin
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            // Gear management — provider or admin (method security via @PreAuthorize)
            .requestMatchers("/api/marketplace/manage/**").hasRole("EQUIPMENT_PROVIDER")
            // Site owner
            .requestMatchers("/api/sites/manage/**").hasRole("SITE_OWNER")
            // Events
            .requestMatchers("/api/events/manage/**").hasRole("ORGANIZER")
            // Delivery — DELIVERY_PROVIDER or ADMIN (fine-grained via @PreAuthorize on each
            // method)
            .requestMatchers("/api/deliveries/**").hasAnyRole("DELIVERY_PROVIDER", "ADMIN")
            .requestMatchers("/api/vehicles/**").hasAnyRole("DELIVERY_PROVIDER", "ADMIN")
            // All other requests need authentication
            .anyRequest().authenticated());

    http.authenticationProvider(authenticationProvider());

    http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
