package com.VoleyPlay.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name="usuario", schema="voley_playa")
public class Usuario {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
    @Column(nullable=false, unique=true, length=40)
    private String username;
    @Column(name="password_hash", nullable=false, length=255)
    private String passwordHash;
    public Usuario() {}
    public Usuario(String username, String passwordHash) { this.username=username; this.passwordHash=passwordHash; }
    public Long getId() { return id; }
    public String getUsername() { return username; }
    public String getPasswordHash() { return passwordHash; }
}
