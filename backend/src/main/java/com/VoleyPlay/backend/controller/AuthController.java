package com.VoleyPlay.backend.controller;

import java.security.Principal;
import java.util.Map;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import com.VoleyPlay.backend.services.RegistroService;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final RegistroService registros;
    public AuthController(RegistroService registros) { this.registros=registros; }
    @GetMapping("/registration")
    public Map<String,Object> registration() { return registros.configuration(); }
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String,String> register(@RequestBody RegistroService.Registro data) {
        return Map.of("username",registros.register(data),"message","Cuenta creada. Ya puedes iniciar sesión.");
    }
    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("headerName", token.getHeaderName(), "token", token.getToken());
    }
    @GetMapping("/me")
    public Map<String, String> me(Principal principal) {
        return Map.of("username", principal.getName());
    }
}
