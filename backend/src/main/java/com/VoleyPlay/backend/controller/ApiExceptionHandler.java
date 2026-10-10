package com.VoleyPlay.backend.controller;

import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> dominio(ResponseStatusException error) {
        return ResponseEntity.status(error.getStatusCode()).body(Map.of("message", error.getReason()));
    }
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<?> datosInvalidos() {
        return ResponseEntity.badRequest().body(Map.of("message", "Revisa los datos: hay campos o fechas inválidos."));
    }
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> integridad() {
        return ResponseEntity.status(409).body(Map.of("message", "El registro está duplicado o vinculado a otros datos."));
    }
}
