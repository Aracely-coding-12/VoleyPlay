FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY backend/pom.xml backend/mvnw backend/
COPY backend/.mvn/ backend/.mvn/
COPY backend/src/ backend/src/
COPY frontend/templates/ frontend/templates/
COPY frontend/static/ frontend/static/
RUN chmod +x backend/mvnw && ./backend/mvnw -f backend/pom.xml -B -ntp clean package -DskipTests
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/backend/target/backend-0.0.1-SNAPSHOT.jar app.jar
CMD ["java", "-jar", "app.jar"]
