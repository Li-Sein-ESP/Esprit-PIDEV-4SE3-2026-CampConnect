package com.campconnect.config;

import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.campconnect.service.CustomUserDetailsService;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  @Autowired
  CustomUserDetailsService userDetailsService;

  @Autowired
  private com.campconnect.config.AuthEntryPointJwt unauthorizedHandler;

  // 1. Injects the variable you set in the Azure Portal
  @Value("${ALLOWED_ORIGINS:http://localhost:4200}") 
  private String allowedOrigins;

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

  // 2. Updated CORS logic to handle Azure and Localhost dynamically
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
      CorsConfiguration configuration = new CorsConfiguration();
      
      // Splits the Azure string by commas to allow multiple URLs
      configuration.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
                                            .map(String::trim)
                                            .collect(Collectors.toList()));
      
      configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
      configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "x-auth-token", "Accept", "X-Requested-With"));
      configuration.setExposedHeaders(Arrays.asList("x-auth-token"));
      configuration.setAllowCredentials(true);
      
      UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
      source.registerCorsConfiguration("/**", configuration);
      return source;
  }

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            // 3. IMPORTANT: Explicitly allow the browser's preflight security checks
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            
            // Public Endpoints
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/test/**").permitAll()
            .requestMatchers("/ws/**").permitAll()
            .requestMatchers("/api/payments/**").permitAll()
            .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/v3/api-docs").permitAll()
            
            // ML and Recommendations
            .requestMatchers("/api/ml/**").permitAll()
            .requestMatchers("/api/recommendations/health").permitAll()
            .requestMatchers("/api/recommendations/gear/categories").permitAll()
            
            // Public marketplace browsing
            .requestMatchers(HttpMethod.GET, "/api/gear/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
            
            // Role-Based Access
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers("/api/marketplace/manage/**").hasRole("EQUIPMENT_PROVIDER")
            .requestMatchers("/api/sites/manage/**").hasRole("SITE_OWNER")
            .requestMatchers("/api/events/manage/**").hasRole("ORGANIZER")
            .requestMatchers("/api/deliveries/**").hasAnyRole("DELIVERY_PROVIDER", "ADMIN")
            .requestMatchers("/api/vehicles/**").hasAnyRole("DELIVERY_PROVIDER", "ADMIN")
            
            .anyRequest().authenticated());

    http.authenticationProvider(authenticationProvider());
    http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
