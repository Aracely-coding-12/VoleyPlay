package com.VoleyPlay.backend.services;

import com.VoleyPlay.backend.model.Usuario;
import com.VoleyPlay.backend.repository.UsuarioRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Locale;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RegistroService {
    public record Registro(String username, String password, String invitationCode) {}
    private final UsuarioRepository usuarios;
    private final String admin, mode, invitation;
    public RegistroService(UsuarioRepository usuarios, @Value("${app.admin.username:admin}") String admin,
        @Value("${app.registration.mode:disabled}") String mode, @Value("${app.registration.code:}") String invitation) {
        if (!java.util.Set.of("disabled","invite","open").contains(mode)) throw new IllegalStateException("REGISTRATION_MODE inválido.");
        this.usuarios=usuarios; this.admin=admin.trim().toLowerCase(Locale.ROOT); this.mode=mode; this.invitation=invitation;
    }
    public Map<String,Object> configuration() {
        return Map.of("enabled", !mode.equals("disabled") && (!mode.equals("invite") || invitation.length()>=12),
            "invitationRequired", mode.equals("invite"));
    }
    @Transactional
    public String register(Registro data) {
        if (!Boolean.TRUE.equals(configuration().get("enabled"))) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,"El registro aún no está habilitado. Contacta al administrador.");
        if (mode.equals("invite") && !MessageDigest.isEqual(invitation.getBytes(StandardCharsets.UTF_8),
                (data.invitationCode()==null ? "" : data.invitationCode()).getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"El código de invitación no es válido.");
        }
        String username=Reglas.texto(data.username(),"Usuario",40).toLowerCase(Locale.ROOT);
        Reglas.exigir(username.matches("[a-z0-9][a-z0-9._-]{2,39}"), "Usa de 3 a 40 caracteres: letras, números, puntos, guiones o guion bajo.");
        String password=data.password();
        Reglas.exigir(password!=null && password.length()>=12 && password.getBytes(StandardCharsets.UTF_8).length<=72,
            "La contraseña debe tener al menos 12 caracteres y como máximo 72 bytes.");
        Reglas.conflicto(username.equals(admin) || usuarios.existsByUsername(username),"Ese usuario ya existe.");
        usuarios.saveAndFlush(new Usuario(username,"{bcrypt}"+new BCryptPasswordEncoder().encode(password)));
        return username;
    }
}
