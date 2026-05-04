<<<<<<< HEAD
FROM maven:3.9.9-eclipse-temurin-17-alpine AS build
=======
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
WORKDIR /app

COPY pom.xml ./
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

<<<<<<< HEAD
FROM eclipse-temurin:17-jre-alpine
=======
FROM eclipse-temurin:21-jre-alpine
>>>>>>> 5560bca (feat: implement academic requirements (Scheduler, JPQL, Keywords) and fix spatial map glitches)
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
