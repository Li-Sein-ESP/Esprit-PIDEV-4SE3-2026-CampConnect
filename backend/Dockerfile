FROM maven:3.9.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

COPY pom.xml ./
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create uploads directory BEFORE switching to non-root user
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Create non-root user for security
RUN addgroup -S app && adduser -S app -G app

# Copy jar and set ownership
COPY --from=build /app/target/*.jar /app/app.jar
RUN chown -R app:app /app

# Switch to non-root user
USER app

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
