package com.campconnect.config;

import java.util.Arrays;
import java.util.List;
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

  /**
   * Reads the ALLOWED_ORIGINS variable from your Azure Environment Variables.
   * Defaults to localhost if the variable isn't found.
   */
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

  /**
   * Configures CORS to trust your Azure Frontend URL and allows credentials for logins.
   */
  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
      CorsConfiguration configuration = new CorsConfiguration();
      
      // Convert the comma-separated string from Azure into a list of origins
      List<String> origins = Arrays.stream(allowedOrigins.split(","))
                                   .map(String::trim)
                                   .collect(Collectors.toList());
      
      configuration.setAllowedOrigins(origins); 
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
            // 1. Handshake: Always permit OPTIONS requests to pass CORS preflight checks
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            
            // 2. Public Endpoints: No login required
            .requestMatchers("/error").permitAll() // FIX: Allows viewing of 500 error details
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/test/**").permitAll()
            .requestMatchers("/ws/**").permitAll()
            .requestMatchers("/api/payments/**").permitAll()
            .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**", "/v3/api-docs").permitAll()
            .requestMatchers("/api/ml/**").permitAll()
            .requestMatchers("/api/recommendations/health").permitAll()
            .requestMatchers("/api/recommendations/gear/categories").permitAll()
            
            // 3. Public GET Browsing
            .requestMatchers(HttpMethod.GET, "/api/gear/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
            .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
            
            // 4. Role-Protected Endpoints
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
