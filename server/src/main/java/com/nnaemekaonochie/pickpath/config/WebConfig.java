package com.nnaemekaonochie.pickpath.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;
import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Production domains - update these with your actual domains
        configuration.setAllowedOrigins(List.of(
            "https://www.nnaemekaonochie.com",
            "https://pick-path-optimizer.vercel.app",
            "https://pick-path-optimizer-git-main-nnaemekas-projects.vercel.app",
            "http://localhost:5173",
            "http://localhost:5174", 
            "http://localhost:3000"
        ));
        
        // Allow all HTTP methods needed for REST API
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"
        ));
        
        // Allow all headers (frontend will send Content-Type, Accept, etc.)
        configuration.setAllowedHeaders(List.of("*"));
        
        // Allow credentials for authentication if needed
        configuration.setAllowCredentials(true);
        
        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);

        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
