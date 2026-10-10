package com.VoleyPlay.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import com.VoleyPlay.backend.repository.UsuarioRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.util.Locale;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    @Bean
    UserDetailsService usuarios(@Value("${app.admin.username:admin}") String username,
                               @Value("${app.admin.password}") String password, UsuarioRepository repository) {
        if (password == null || password.length() < 12) {
            throw new IllegalStateException("ADMIN_PASSWORD debe tener al menos 12 caracteres.");
        }
        String adminName=username.trim().toLowerCase(Locale.ROOT);
        String adminHash="{bcrypt}" + new BCryptPasswordEncoder().encode(password);
        return name -> {
            String normalized=name.trim().toLowerCase(Locale.ROOT);
            if (normalized.equals(adminName)) return User.withUsername(adminName).password(adminHash).roles("ADMIN").build();
            var user=repository.findByUsername(normalized).orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado."));
            return User.withUsername(user.getUsername()).password(user.getPasswordHash()).roles("USER").build();
        };
    }

    @Bean
    SecurityFilterChain seguridad(HttpSecurity http) throws Exception {
        return http.cors(cors -> {})
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/csrf", "/api/auth/login", "/api/auth/register", "/api/auth/registration", "/error").permitAll()
                        .anyRequest().authenticated())
                .formLogin(login -> login.loginProcessingUrl("/api/auth/login")
                        .successHandler((req, res, auth) -> res.setStatus(204))
                        .failureHandler((req, res, ex) -> {
                            res.setStatus(401); res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"message\":\"Usuario o contraseña incorrectos.\"}");
                        }))
                .logout(logout -> logout.logoutUrl("/api/auth/logout")
                        .invalidateHttpSession(true).deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((req, res, auth) -> res.setStatus(204)))
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((req, res, ex) -> {
                            res.setStatus(401); res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"message\":\"Inicia sesión para continuar.\"}");
                        })
                        .accessDeniedHandler((req, res, ex) -> {
                            res.setStatus(403); res.setContentType("application/json;charset=UTF-8");
                            res.getWriter().write("{\"message\":\"La sesión o el token de seguridad expiraron. Vuelve a iniciar sesión.\"}");
                        }))
                .build();
    }
}
