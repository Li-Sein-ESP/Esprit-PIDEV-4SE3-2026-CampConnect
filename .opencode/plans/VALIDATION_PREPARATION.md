# Validation Preparation - Sprint Status & Planning

**Project:** CampConnect  
**Validation Date:** After vacation (early April 2026)  
**Your Modules:** Delivery, Gear, User  
**Last Updated:** March 30, 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Individual Work Status](#individual-work-status)
3. [Group Work Status](#group-work-status)
4. [What You Can Prepare Alone](#what-you-can-prepare-alone)
5. [What Requires Group Members](#what-requires-group-members)
6. [Recommended Order of Work](#recommended-order-of-work)
7. [Detailed Task Breakdown](#detailed-task-breakdown)

---

## Executive Summary

### Your Individual Requirements - Status Overview

| Requirement | Backend | Frontend | Status |
|-------------|---------|----------|--------|
| CRUD complet et logique | DONE | DONE | Ready to present |
| Utilisation du DTO | DONE | DONE | Ready to present |
| Tests unitaires | WRITTEN (not runnable) | WRITTEN (not runnable) | Needs fix |
| Ergonomie/UX | N/A | PARTIAL | Review needed |
| Code quality | GOOD | GOOD | Ready |

### Group Requirements - Status Overview

| Requirement | Status | Priority |
|-------------|--------|----------|
| Spring Security (complete module) | DONE | - |
| CI/CD Pipeline Backend | NOT STARTED | HIGH |
| CI/CD Pipeline Frontend | NOT STARTED | HIGH |
| Dockerfile Backend | NOT STARTED | HIGH |
| Dockerfile Frontend | NOT STARTED | HIGH |
| Kubernetes (KubeADM) | NOT STARTED | HIGH |
| Monitoring (Prometheus/Grafana) | NOT STARTED | MEDIUM |

---

## Individual Work Status

### 1. CRUD Complet et Logique

#### Backend (Spring Boot)

| Module | Controller | Service | Repository | Model | Status |
|--------|------------|---------|------------|-------|--------|
| **Delivery** | DeliveryController.java | DeliveryService.java | DeliveryRepository.java | Delivery.java, DeliveryStatus.java | COMPLETE |
| **Gear** | GearController.java | GearService.java | GearRepository.java | Gear.java, Rental.java, Purchase.java | COMPLETE |
| **User** | UserController.java | UserService.java | UserRepository.java | User.java | COMPLETE |

**Additional Delivery features:**
- 9-state delivery workflow (CREATED → DELIVERED/FAILED/CANCELLED)
- VehicleController for fleet management
- Driver profile stats & earnings endpoints

**Additional Gear features:**
- Rental & Purchase management (RentalController, PurchaseController)
- Cart system (CartController)
- Maintenance records (MaintenanceController)
- ListingType (FOR_SALE/FOR_RENT/BOTH)

**Additional User features:**
- Password change endpoint
- User stats aggregation (reservations, rentals, purchases)

#### Frontend (Angular)

| Module | Components | Services | Models | Status |
|--------|------------|----------|--------|--------|
| **Delivery** | delivery-profile, delivery-earnings, delivery-layout, driver-registration | delivery-api.service.ts | delivery.model.ts | COMPLETE |
| **Gear** | gear-list, gear-detail, gear-cart, gear-form, gear-dashboard | gear-api.service.ts, cart-api.service.ts | gear.model.ts, cart.model.ts | COMPLETE |
| **User** | camper-profile, profile | user-api.service.ts | user.model.ts | COMPLETE |

---

### 2. Utilisation du DTO

#### Backend DTOs by Module

**Delivery Module:**
- `DeliveryRequest.java` - Input DTO for creating deliveries
- `DeliveryResponse.java` - Output DTO for delivery data
- `DeliveryUpdateRequest.java` - Input DTO for updates
- `DriverProfileStatsResponse.java` - Driver statistics
- `EarningsBreakdownResponse.java` - Earnings breakdown
- `PaymentHistoryResponse.java` - Payment records

**Gear Module:**
- `GearRequest.java` - Input DTO for gear items
- `GearResponse.java` - Output DTO for gear data
- `RentalRequest.java` / `RentalResponse.java`
- `PurchaseRequest.java` / `PurchaseResponse.java`
- `CartItemRequest.java` / `CartResponse.java`
- `ProviderStatsResponse.java` - Provider analytics
- `GearAnalyticsResponse.java` - Marketplace analytics

**User Module:**
- `UpdateProfileRequest.java` - Profile update input
- `ChangePasswordRequest.java` - Password change input
- `UserStatsResponse.java` - Aggregated user statistics

#### Frontend Models (TypeScript interfaces)
- All backend DTOs have corresponding TypeScript interfaces
- Located in `features/<module>/models/` directories

---

### 3. Tests Unitaires

#### Backend Tests (JUnit 5 + Mockito)

| Test File | Test Cases | Status |
|-----------|------------|--------|
| DeliveryServiceTest.java | 13 tests | Written, not runnable |
| DeliveryControllerTest.java | 8 tests | Written, not runnable |
| GearServiceTest.java | 14 tests | Written, not runnable |
| GearControllerTest.java | 8 tests | Written, not runnable |
| UserServiceTest.java | 10 tests | Written, not runnable |
| UserControllerTest.java | 5 tests | Written, not runnable |
| **TOTAL** | **58 tests** | **BLOCKED** |

**Blocker:** 100+ compilation errors in legacy tests (ExpenseServiceImplTest, GroupDecisionServiceImplTest, TripIntentServiceImplTest, etc.) prevent Maven from running any tests.

**Fix Required:** Either:
1. Fix legacy tests (update to use ReflectionTestUtils for Lombok @Data)
2. Exclude legacy tests from Maven Surefire plugin temporarily

#### Frontend Tests (Jasmine + Karma)

| Test File | Test Cases | Status |
|-----------|------------|--------|
| delivery-api.service.spec.ts | 3 tests | Written, not runnable |
| delivery-profile.component.spec.ts | 4 tests | Written, not runnable |
| delivery-earnings.component.spec.ts | 3 tests | Written, not runnable |
| gear-api.service.spec.ts | 3 tests | Written, not runnable |
| cart-api.service.spec.ts | 3 tests | Written, not runnable |
| gear-cart.component.spec.ts | 4 tests | Written, not runnable |
| user-api.service.spec.ts | 3 tests | Written, not runnable |
| camper-profile.component.spec.ts | 4 tests | Written, not runnable |
| **TOTAL** | **27 tests** | **BLOCKED** |

**Blocker:** 7 TypeScript errors in legacy specs (auth.service.spec.ts, create-post.spec.ts, etc.) prevent `ng test` from running.

**Fix Required:** Export `User` type from auth.service.ts and fix import paths.

---

### 4. UX/Ergonomie Checklist

Things to verify before presentation:

- [ ] Forms have proper validation messages
- [ ] Loading states are shown during API calls
- [ ] Error messages are user-friendly
- [ ] Navigation is intuitive
- [ ] Mobile responsive (if applicable)
- [ ] Confirmation dialogs for destructive actions
- [ ] Success notifications after operations

---

## Group Work Status

### 1. Spring Security - DONE

**Current Implementation:**

| Feature | Status | Location |
|---------|--------|----------|
| JWT Authentication | DONE | AuthTokenFilter.java, JwtUtils.java |
| Login/Register | DONE | AuthController.java |
| Password Encryption | DONE | BCryptPasswordEncoder in SecurityConfig |
| Role Management | DONE | ERole enum (7 roles), Role model |
| Endpoint Security | DONE | SecurityConfig.java (URL-based) |
| Method-level Security | DONE | @PreAuthorize annotations (58 usages) |
| CORS Configuration | DONE | SecurityConfig.java |
| Stateless Sessions | DONE | SessionCreationPolicy.STATELESS |

**Roles defined:**
- ROLE_USER, ROLE_CAMPER, ROLE_EQUIPMENT_PROVIDER
- ROLE_SITE_OWNER, ROLE_ORGANIZER, ROLE_DELIVERY_PROVIDER, ROLE_ADMIN

**Security is complete.** Be ready to explain the flow: login → JWT token → AuthTokenFilter → SecurityContext → @PreAuthorize checks.

---

### 2. CI/CD Pipelines - NOT STARTED

**Required:** 2 separate pipelines (GitHub Actions, GitLab CI, or Jenkins)

**Backend Pipeline should include:**
- Trigger on push/PR to main
- Checkout code
- Set up JDK 17+
- Cache Maven dependencies
- Run `mvn clean compile`
- Run `mvn test` (requires fixing legacy tests first!)
- Run `mvn package` to create JAR
- Build Docker image
- Push to container registry (optional)

**Frontend Pipeline should include:**
- Trigger on push/PR to main
- Checkout code
- Set up Node.js
- Cache npm dependencies
- Run `npm ci`
- Run `npm run lint` (if configured)
- Run `npm test` (requires fixing legacy tests first!)
- Run `npm run build --prod`
- Build Docker image
- Push to container registry (optional)

---

### 3. Docker - NOT STARTED

**Backend Dockerfile (to create):**
```dockerfile
# Multi-stage build
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**Frontend Dockerfile (to create):**
```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --prod

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist/angular-campconnect /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

---

### 4. Kubernetes (KubeADM) - NOT STARTED

**Required files to create:**
- `k8s/backend-deployment.yaml`
- `k8s/backend-service.yaml`
- `k8s/frontend-deployment.yaml`
- `k8s/frontend-service.yaml`
- `k8s/mongodb-deployment.yaml` (or use external MongoDB)
- `k8s/configmap.yaml` (for environment variables)
- `k8s/secrets.yaml` (for sensitive data)
- `k8s/ingress.yaml` (optional, for external access)

**Important:** Must use KubeADM, NOT MiniKube!

---

### 5. Monitoring (Prometheus + Grafana) - NOT STARTED

**Backend requirements:**
- Add Spring Boot Actuator dependency
- Add Micrometer Prometheus registry
- Expose `/actuator/prometheus` endpoint

**Kubernetes requirements:**
- Deploy Prometheus (ServiceMonitor or scrape config)
- Deploy Grafana with dashboards
- Create dashboards for:
  - JVM metrics (heap, GC, threads)
  - HTTP request metrics (latency, error rate)
  - Custom business metrics (optional)

---

## What You Can Prepare Alone

These tasks do NOT require other team members:

### Immediate (Before Group Meeting)

1. **Fix your tests so they run**
   - Backend: Add Maven Surefire exclusions for legacy tests
   - Frontend: Fix User export in auth.service.ts (or ask teammate)
   - Run your module tests in isolation
   - Document test results

2. **Prepare your presentation**
   - Practice explaining your CRUD flow (Controller → Service → Repository)
   - Practice explaining DTO usage and why it's important
   - Prepare to walk through 2-3 test cases

3. **Review UX of your modules**
   - Test all user flows manually
   - Note any issues to fix
   - Verify error handling displays correctly

4. **Document your work**
   - List all endpoints you created
   - List all components you created
   - Prepare to answer "what does this do?" for any file

### Can Start Alone (Group Should Review)

5. **Draft Dockerfiles**
   - Create backend/Dockerfile
   - Create frontend/Dockerfile
   - Test locally with `docker build`

6. **Draft CI/CD pipeline files**
   - Create .github/workflows/backend.yml
   - Create .github/workflows/frontend.yml
   - Can't fully test without repo access, but can prepare

7. **Draft Kubernetes manifests**
   - Create deployment & service YAML files
   - Will need group to set up actual KubeADM cluster

---

## What Requires Group Members

These tasks MUST be done together or need coordination:

### Requires Full Group

1. **Set up KubeADM cluster**
   - Need a server/VM (at least 2 nodes recommended)
   - Need someone with infrastructure access
   - All members should understand the setup

2. **Deploy to Kubernetes**
   - Apply all manifests together
   - Debug any issues as a team
   - Each person should understand their module's deployment

3. **Set up Prometheus/Grafana**
   - Deploy monitoring stack
   - Create dashboards
   - Verify metrics from all modules

4. **Integration testing**
   - Test full application flow on deployed environment
   - Verify all modules work together

### Requires Coordination

5. **Fix legacy tests (if doing properly)**
   - Each team member should fix their own module's legacy tests
   - Or agree to exclude them temporarily

6. **CI/CD pipeline finalization**
   - Need repo write access
   - Need container registry access
   - Need deployment credentials

7. **Code review**
   - Each member reviews others' code
   - Ensures consistent quality

---

## Recommended Order of Work

### Week Overview (Assuming 1 week before validation)

```
Day 1-2: Individual Preparation (Can do ALONE)
├── Fix your test blockers
├── Run and verify your tests pass
├── Review your code quality
├── Prepare presentation talking points
└── Draft Docker & CI/CD files

Day 3: Group Sync Meeting (REQUIRES GROUP)
├── Review everyone's individual progress
├── Assign DevOps tasks (Docker, CI/CD, K8s, Monitoring)
├── Set up shared infrastructure (VM, registry, etc.)
└── Agree on deployment strategy

Day 4-5: DevOps Implementation (MIXED)
├── Finalize Dockerfiles (can split)
├── Set up KubeADM cluster (needs infra person)
├── Create CI/CD pipelines (can split)
├── Deploy applications (together)
└── Set up monitoring (can assign to 1-2 people)

Day 6: Integration & Testing (REQUIRES GROUP)
├── Full deployment test
├── Fix any integration issues
├── Verify monitoring works
└── Practice demo together

Day 7: Final Preparation (Can do ALONE)
├── Polish presentations
├── Document any known issues
├── Prepare for Q&A
└── Rest before validation!
```

---

## Detailed Task Breakdown

### YOUR Priority Tasks (In Order)

#### Priority 1: Make Tests Runnable (Do FIRST)

**Task 1.1: Backend - Exclude legacy tests temporarily**
```xml
<!-- Add to pom.xml in maven-surefire-plugin configuration -->
<configuration>
    <excludes>
        <exclude>**/ExpenseServiceImplTest.java</exclude>
        <exclude>**/GroupDecisionServiceImplTest.java</exclude>
        <exclude>**/TripIntentServiceImplTest.java</exclude>
        <exclude>**/GroupInviteServiceImplTest.java</exclude>
        <exclude>**/AuthControllerTest.java</exclude>
        <exclude>**/GroupControllerTest.java</exclude>
        <exclude>**/GroupChatControllerTest.java</exclude>
        <exclude>**/GroupDecisionControllerTest.java</exclude>
        <exclude>**/GroupInviteControllerTest.java</exclude>
        <exclude>**/ExpenseControllerTest.java</exclude>
    </excludes>
</configuration>
```

**Task 1.2: Run your backend tests**
```bash
cd backend
./mvnw test -Dtest=DeliveryServiceTest,DeliveryControllerTest,GearServiceTest,GearControllerTest,UserServiceTest,UserControllerTest
```

**Task 1.3: Frontend - Fix User export (or coordinate with teammate)**
- Export `User` interface from `auth.service.ts`
- Or fix the imports in legacy spec files
- Then run: `npm test`

#### Priority 2: Verify Your CRUD Works

**Task 2.1:** Start backend and frontend locally
```bash
# Terminal 1
cd backend && ./mvnw spring-boot:run

# Terminal 2  
cd angular-campconnect && npm start
```

**Task 2.2:** Test each CRUD operation:
- [ ] Delivery: Create, Read, Update status, Delete
- [ ] Gear: Create, Read, Update, Delete, Rent, Purchase
- [ ] User: View profile, Update profile, Change password, View stats

#### Priority 3: Prepare Presentation Materials

**Task 3.1:** Create a cheat sheet with:
- Your endpoints (e.g., `POST /api/deliveries`, `GET /api/gear/{id}`)
- Your component names and what they do
- Key business logic (e.g., delivery state machine, gear listing types)

**Task 3.2:** Prepare to explain:
- Why DTOs? (separation of concerns, security, API contract)
- Why unit tests? (catch bugs early, documentation, confidence)
- Your module's main use cases

#### Priority 4: DevOps Drafts (Can Start Alone)

**Task 4.1:** Create `backend/Dockerfile`
**Task 4.2:** Create `angular-campconnect/Dockerfile`
**Task 4.3:** Create `angular-campconnect/nginx.conf`
**Task 4.4:** Create `.github/workflows/backend.yml`
**Task 4.5:** Create `.github/workflows/frontend.yml`
**Task 4.6:** Create `k8s/` directory with manifest drafts

---

## Summary Checklist

### Individual (Must be able to demonstrate)

- [ ] CRUD operations work (show live demo)
- [ ] DTOs are used consistently (show code)
- [ ] Unit tests exist and pass (show test run)
- [ ] Code is clean and organized (show structure)
- [ ] Can explain what you built and why

### Group (Must be set up and working)

- [ ] Spring Security is complete (DONE - just explain)
- [ ] Backend CI/CD pipeline runs successfully
- [ ] Frontend CI/CD pipeline runs successfully
- [ ] Backend Docker image builds and runs
- [ ] Frontend Docker image builds and runs
- [ ] KubeADM cluster is set up (NOT MiniKube!)
- [ ] Application deployed to Kubernetes
- [ ] Prometheus collects metrics
- [ ] Grafana shows dashboards

---

## Questions to Clarify with Your Group

1. Who has access to set up the KubeADM cluster? (Need a VM/server)
2. Where will Docker images be stored? (DockerHub, GitLab Registry, etc.)
3. Which CI/CD platform? (GitHub Actions, GitLab CI, Jenkins)
4. Who is responsible for each DevOps task?
5. When is the group meeting to coordinate?

---

**Good luck with your validation!**
