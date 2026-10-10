# Interfaz VóleyPlay sin JavaScript

La interfaz usa HTML y CSS con Thymeleaf. Java genera las páginas y procesa todos los formularios. No usa React, Vite, Node ni JavaScript.

- `templates/`: login, registro, resumen y gestión del panel.
- `static/css/app.css`: interfaz adaptable e iconos SVG integrados en las plantillas.
- `static/images/`: recursos de la interfaz.

Maven incorpora estos archivos al JAR del backend. Ejecutar desde la raíz del repositorio:

```powershell
./backend/mvnw.cmd -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=dev
```

Abrir http://localhost:8080/login. En desarrollo, el usuario es `admin` y la contraseña es `VoleyPlay-local-2026!`. Para activar el registro local, definir `REGISTRATION_MODE=open`.

## Railway

El repositorio debe estar disponible completo durante la compilación: backend y frontend. Usar la raíz del repositorio como Root Directory y compilar con `./backend/mvnw -f backend/pom.xml -B -ntp clean package`. Inicio: `java -jar backend/target/backend-0.0.1-SNAPSHOT.jar`.

Configurar JDK 21 o posterior. Conservar las variables de Neon `DB_URL` (JDBC), `DB_USER`, `DB_PASSWORD` y de acceso `ADMIN_USERNAME`, `ADMIN_PASSWORD` (mínimo 12 caracteres), `REGISTRATION_MODE=open`, `SESSION_COOKIE_SECURE=true`, `SESSION_SAME_SITE=lax`. No usar los perfiles locales dev/neon en Railway: limitan el servidor a loopback.

Railway sirve la interfaz y el backend en el mismo dominio. Vercel y VITE_API_URL no intervienen en esta versión. No configurar el frontend como sitio estático: Thymeleaf requiere el servidor Java. Si se desea mantener el dominio anterior, debe configurarse su redirección a la URL pública de Railway.

Las rutas JSON `/api` siguen disponibles para compatibilidad; las páginas usan `/login`, `/registro`, `/panel` y formularios POST con token CSRF. Las restricciones de reservas/pagos y contraseñas cifradas se mantienen en los servicios Java existentes.
