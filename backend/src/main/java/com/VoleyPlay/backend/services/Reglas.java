package com.VoleyPlay.backend.services;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

final class Reglas {
    static void exigir(boolean condition, String message) {
        if (!condition) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
    static void conflicto(boolean condition, String message) {
        if (condition) throw new ResponseStatusException(HttpStatus.CONFLICT, message);
    }
    static <T> T existe(T value, String name) {
        if (value == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, name + " no encontrado.");
        return value;
    }
    static String texto(String value, String field, int max) {
        exigir(value != null && !value.isBlank(), field + " es obligatorio.");
        String result = value.trim();
        exigir(result.length() <= max, field + " es demasiado largo.");
        return result;
    }
    static String opcional(String value, int max) {
        String result = value == null ? "" : value.trim();
        exigir(result.length() <= max, "El campo es demasiado largo.");
        return result;
    }
    static String estado(String value, String... allowed) {
        String normalized = normalizar(value);
        return Arrays.stream(allowed).filter(s -> normalizar(s).equals(normalized)).findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado o método inválido."));
    }
    private static String normalizar(String value) {
        return Normalizer.normalize(value == null ? "" : value.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "").toLowerCase(java.util.Locale.ROOT);
    }
    static BigDecimal dinero(Double value, String field) {
        exigir(value != null && Double.isFinite(value) && value > 0, field + " debe ser mayor que cero.");
        BigDecimal amount = BigDecimal.valueOf(value);
        exigir(amount.stripTrailingZeros().scale() <= 2, field + " admite hasta dos decimales.");
        exigir(amount.compareTo(new BigDecimal("9999999.99")) <= 0, field + " supera el máximo permitido.");
        return amount;
    }
    static LocalDate hoy() { return LocalDate.now(ZoneId.of("America/Lima")); }
}
