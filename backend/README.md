# Backend e interfaz Java

Spring Boot + Thymeleaf + PostgreSQL. Las plantillas y CSS están en `../frontend` y Maven los incluye en el JAR. Ver [instrucciones de ejecución y Railway](../frontend/README.md).

Pruebas aisladas: `./mvnw test`. Nunca usan Neon de producción. La migración SQL de registro existente está en `db/003_registro_usuarios.sql`; no se ejecuta automáticamente.
