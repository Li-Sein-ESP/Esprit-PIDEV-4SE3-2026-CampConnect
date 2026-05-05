# CampConnect — Complete Project Audit
**Date:** March 29, 2026  
**Audited by:** Automated code audit  
**Scope:** Full-stack analysis of `angular-campconnect` (frontend) and `backend` (Spring Boot)

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Overview](#3-architecture-overview)
4. [Module-by-Module Status](#4-module-by-module-status)
5. [Integration State: Frontend ↔ Backend](#5-integration-state-frontend--backend)
6. [Build State](#6-build-state)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Code Quality Issues & Mistakes](#8-code-quality-issues--mistakes)
9. [What Was Achieved](#9-what-was-achieved)
10. [What Is Lacking / Missing](#10-what-is-lacking--missing)
11. [Database & Data Model](#11-database--data-model)
12. [Testing State](#12-testing-state)
13. [File Structure Issues](#13-file-structure-issues)
14. [Security Concerns](#14-security-concerns)
15. [Recommendations & Priority Actions](#15-recommendations--priority-actions)

---

## 1. PROJECT OVERVIEW

**CampConnect** is a full-stack outdoor adventure platform connecting campers, site owners, equipment providers, delivery providers, event organizers, and administrators. It is a collaborative PI (Projet Intégrateur) built by multiple team members, each responsible for different modules, then merged into a single monorepo.

The project consists of:
- **Frontend:** Angular 17+ standalone component architecture (SPA)
- **Backend:** Spring Boot 3.2 REST API with MongoDB
- **Database:** MongoDB (local instance at `localhost:27017`, database: `campconnectdb`)

**Frontend URL:** `http://localhost:4200`  
**Backend URL:** `http://localhost:8081`  
**Swagger UI:** `http://localhost:8081/swagger-ui.html`

---

## 2. TECHNOLOGY STACK

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Angular | 17+ | SPA framework |
| TypeScript | 5.x | Language |
| Standalone Components | — | No NgModules; all components are standalone |
| Lucide Angular | — | Icon library |
| RxJS | 7.x | Reactive programming |
| Zone.js | — | Change detection |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Spring Boot | 3.2.3 | REST API framework |
| Java | 17 | Language |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data MongoDB | — | Database access |
| JWT (jjwt) | 0.11.5 | JSON Web Token auth |
| Lombok | — | Boilerplate reduction |
| ModelMapper | 3.2.0 | DTO ↔ Entity mapping |
| SpringDoc OpenAPI | 2.3.0 | Swagger / API docs |

### Infrastructure
| Component | Details |
|---|---|
| Database | MongoDB 6.x+ (local) |
| Build (FE) | Angular CLI / esbuild |
| Build (BE) | Maven (mvnw wrapper) |
| Auth | JWT Bearer tokens (24h expiry) |

---

## 3. ARCHITECTURE OVERVIEW

### Backend Architecture (HYBRID)

The backend uses a **hybrid architecture** — some modules follow **domain-driven vertical slicing** (self-contained packages) while older/core modules use **traditional horizontal layering** (controller/service/model/repository at root level).

**Domain-driven modules** (each has their own controller/service/model/dto/repository subdirectories):
- `com.campconnect.academy` — Courses, badges, certifications, videos
- `com.campconnect.delivery` — Delivery lifecycle, vehicles
- `com.campconnect.gear` — Gear marketplace, purchases, rentals, cart, maintenance
- `com.campconnect.events` — Event management, registrations
- `com.campconnect.trip` — Trip planning, itineraries, routes, activities, POIs
- `com.campconnect.transport` — Transportation options, safety alerts

**Horizontally-layered modules** (split across root-level packages):
- `controller/` — Auth, Posts, Comments, Groups, Campsites, Reservations, Safety, TripIntents, Seasons, Users
- `service/` — AuthService, PostService, GroupService, ReservationService, TripService, etc.
- `model/` — User, Role, Post, Comment, Campsite, Reservation, Trip, Group, etc.
- `dto/` — All DTOs for the horizontally-layered controllers
- `repository/` — All MongoDB repositories for the horizontally-layered models

**Config layer:**
- `SecurityConfig.java` — Spring Security filter chain, CORS, JWT filter
- `AuthTokenFilter.java` — JWT token extraction from requests
- `JwtUtils.java` — Token generation/validation
- `DataInitializer.java` — Seeds roles and default users on startup
- `WebConfig.java` — CORS mappings, static resource handlers
- `SwaggerConfig.java` — OpenAPI/Swagger setup

### Frontend Architecture

- **Standalone components** — No NgModules; every component declares its own `imports`.
- **Lazy-loaded routes** — All feature components are lazy-loaded via `loadComponent()` in `app.routes.ts`.
- **Feature folders** — 19 feature directories under `src/app/features/`.
- **Core services** — Shared services in `src/app/core/services/`.
- **Shared components** — Reusable UI in `src/app/shared/components/`.
- **Role-based layouts** — Different portals for Camper, Admin, Provider, Delivery Provider.

### Roles in the System (7 roles defined)
1. `ROLE_USER` — Base role
2. `ROLE_ADMIN` — Full admin access
3. `ROLE_CAMPER` — Standard camper
4. `ROLE_SITE_OWNER` — Campsite owner/manager
5. `ROLE_EQUIPMENT_PROVIDER` — Gear marketplace provider
6. `ROLE_ORGANIZER` — Event organizer
7. `ROLE_DELIVERY_PROVIDER` — Delivery/logistics provider

---

## 4. MODULE-BY-MODULE STATUS

### BACKEND MODULES

| Module | Controllers | Models/Entities | Services | Repositories | Status |
|---|---|---|---|---|---|
| **Auth** | AuthController | User, Role, ERole | AuthService, CustomUserDetailsService | UserRepository, RoleRepository | ✅ Functional |
| **Campsites** | CampsiteController | Campsite, Category, Location, Season | — (direct repo) | CampsiteRepository, CategoryRepository, SeasonRepository | ✅ Functional |
| **Posts (Community)** | PostController, CommentController | Post, Comment, ForumThread | PostService, CommentService, ForumThreadService | PostRepository, CommentRepository, ForumThreadRepository | ✅ Functional |
| **Groups** | GroupController, GroupChatController, GroupDecisionController, GroupInviteController, GroupTaskController | Group, GroupMessage, GroupDecision, GroupInvite, GroupTask | IGroupService, GroupDecisionService, GroupInviteService, GroupTaskService | GroupRepository + 4 more | ✅ Functional |
| **Reservations** | ReservationController, SeasonController | Reservation | ReservationService | ReservationRepository | ✅ Functional |
| **Trips** | TripController | Trip | TripService | TripRepository | ✅ Functional |
| **Trip Intents** | TripIntentController | TripIntent | TripIntentService | TripIntentRepository | ✅ Functional |
| **Safety** | SafetyAlertController (×2) | SafetyAlert, Incident | SafetyAlertService, IncidentService | SafetyAlertRepository, IncidentRepository | ⚠️ Duplicate controller names |
| **Expenses** | ExpenseController | Expense | ExpenseService | ExpenseRepository | ✅ Functional |
| **Academy** | AcademyController | Course, Badge, Certification, UserCertification, Video | AcademyService | AcademyRepository | ✅ Functional |
| **Gear** | GearController, PurchaseController, RentalController, CartController, MaintenanceController | Gear, Purchase, Rental, Cart, CartItem, MaintenanceRecord +more | GearService, PurchaseService, RentalService, CartService | GearRepository + 4 more | ✅ Functional |
| **Delivery** | DeliveryController, VehicleController | Delivery, Vehicle, Route | DeliveryService, VehicleService | DeliveryRepository, VehicleRepository | ✅ Functional |
| **Events** | EventsController | Event, EventRegistration | EventService | EventRepository, EventRegistrationRepository | ✅ Functional |
| **Transport** | TransportController, SafetyAlertController | Transport, SafetyAlert | TransportService, SafetyAlertService | TransportRepository, SafetyAlertRepository | ⚠️ See duplicate issue |
| **Users** | UserController | User | UserService | UserRepository | ✅ Functional |
| **File Upload** | FileUploadController | — | FileStorageService | — | ✅ Functional |

### FRONTEND MODULES

| Module | Components | Service | API Integration | Status |
|---|---|---|---|---|
| **Landing** | LandingComponent | — | None (static) | ✅ Complete |
| **Auth (Login/Signup)** | LoginComponent, CamperProfileComponent, CamperEditProfileComponent | AuthService | ✅ Real API | ✅ Complete |
| **Campsites** | CampsitesComponent, CampsiteDetailComponent | CampsiteService | ✅ Real API (`/api/campsites`) | ✅ Integrated |
| **Bookings** | 9 components (AvailabilitySearch through BookingCancel) | BookingService | ❌ MOCK DATA | ⚠️ UI only |
| **Trips (core)** | MyTripsComponent, PlanTripComponent | TripService (core) | ❌ MOCK DATA | ⚠️ UI only |
| **Trips (feature)** | 9 components (TripCreate through RecommendedPlaces) | TripService (feature) | ❌ MOCK DATA | ⚠️ UI only |
| **Community Hub** | CommunityComponent | — | ❌ MOCK DATA (hardcoded in component) | ⚠️ UI only |
| **Community Feed** | CommunityFeedComponent | CommunityService | ❌ MOCK DATA | ⚠️ UI only |
| **Forums** | ForumHome, ForumCategory, ForumTopicDetails, CreateForumTopic | CommunityService | ❌ MOCK DATA | ⚠️ UI only |
| **Community Other** | 8 components (Stories, Leaderboard, Events, Messaging, etc.) | CommunityService | ❌ MOCK DATA | ⚠️ UI only |
| **Gear** | GearComponent + 7 sub-components | GearApiService | ✅ Real API (`/api/gear`) | ✅ Integrated |
| **Marketplace** | 6 components (Landing, Category, Details, Cart, Orders) | GearApiService | ✅ Real API | ✅ Integrated |
| **Provider Portal** | 7 components (Dashboard through Profile) | GearApiService | ✅ Real API | ✅ Integrated |
| **Delivery Provider Portal** | 8 components (Dashboard through Layout) | DeliveryApiService, VehicleApiService | ✅ Real API | ✅ Integrated |
| **Academy** | AcademyComponent + 6 sub-components | AcademyService | ✅ Real API (`/api/academy/*`) | ✅ Integrated |
| **Safety** | SafetyComponent + 17 sub-components | SafetyService, MapService | ✅ Real API | ✅ Integrated |
| **Events** | EventsHome, EventDetails | EventService | ✅ Real API (with mock fallback) | ⚠️ Hybrid |
| **Companions** | 10 components (Discovery through MyGroups) | ConnectionRequestService | ❌ MOCK DATA (localStorage only) | ⚠️ UI only |
| **Transportation** | 4 components (Overview through Confirmation) | TransportationService | ❌ MOCK DATA | ⚠️ UI only |
| **Admin Portal** | AdminLayout + 12 sub-pages | Various | ⚠️ Partially integrated | ⚠️ Partial |

---

## 5. INTEGRATION STATE: FRONTEND ↔ BACKEND

### ✅ FULLY INTEGRATED (Frontend calls real backend API)
1. **Authentication** — Login, signup, token management, role-based routing
2. **Campsites** — CRUD operations via `/api/campsites`
3. **Reservations** — CRUD via `/api/reservations`
4. **Gear / Marketplace** — Full CRUD, purchases, rentals, cart, provider stats via `/api/gear`, `/api/purchases`
5. **Delivery Provider Portal** — Delivery lifecycle, vehicles via `/api/deliveries`, `/api/vehicles`
6. **Academy** — Courses, badges, certifications, videos via `/api/academy/*`
7. **Safety & Incidents** — Alerts, incidents via `/api/incidents`, `/api/alerts`
8. **Events** — Events with mock fallback via `/api/events`

### ❌ NOT INTEGRATED (Frontend uses mock/hardcoded data despite backend APIs existing)
1. **Community Feed / Forums / Posts** — `CommunityService` returns `of(mockPosts)` with a fake 300ms delay. Backend has `PostController` at `/api/posts` and `ForumThreadService` that are completely unused by the frontend.
2. **Trips (core + feature)** — Both `TripService` instances use `BehaviorSubject`/`signal` with hardcoded mock data. Backend has `TripController` at `/api/trips` and the entire `trip` module (itineraries, activities, routes, POIs) with full CRUD.
3. **Transportation** — `TransportationService` returns hardcoded mock routes. Backend has `TransportController` at `/api/transports`.
4. **Companions / Matching** — `ConnectionRequestService` uses `localStorage` only. **No backend API exists** for companion matching.
5. **Bookings** — `BookingService` is entirely mock-based using Angular `signal()`. The backend `ReservationService` is integrated via a separate `ReservationService` in core, but the booking wizard components don't use it.
6. **Groups** — Frontend pages exist but integration state is unclear; the backend has extensive group APIs.

### ⚠️ PARTIALLY INTEGRATED
1. **Events** — `EventService.getEvents()` calls the API but falls back to `this.mockEvents` if the response is empty or errors.

---

## 6. BUILD STATE

### Frontend (Angular CLI)
- **Status:** ✅ **BUILDS SUCCESSFULLY** (`ng build` exits with code 0)
- **Errors:** 0
- **Warnings:** Multiple non-blocking warnings:
  - `NG8107` — Unnecessary optional chaining (`?.`) on non-nullable types (~20+ instances)
  - `NG8113` — Unused component imports
  - These are safe to ignore but indicate sloppy coding practices.

### Backend (Maven)
- **Status:** ✅ **COMPILES SUCCESSFULLY** (`mvnw clean compile` exits with code 0)
- **294 source files** compiled
- **Lombok config** added (`lombok.config`) to silence IDE false positives for generated methods

---

## 7. AUTHENTICATION & AUTHORIZATION

### Authentication Flow
1. User submits credentials to `POST /api/auth/signin`
2. Backend validates via `DaoAuthenticationProvider` + `CustomUserDetailsService`
3. On success, returns JWT token + user info (`AuthResponse`)
4. Frontend stores token in `localStorage` (key: `cc_token`)
5. `AuthInterceptor` attaches `Authorization: Bearer <token>` to every outgoing request
6. Token expiry: 24 hours (`86400000ms`)

### Authorization
- Route guards: Functional `authGuard` checks `isLoggedIn()` and optional role-based `data.roles`
- Backend: `@PreAuthorize` annotations on controllers enforce role-based access
- Security filter chain defines public and protected endpoint patterns

### Known Auth Issues
1. **Token stored in localStorage** — vulnerable to XSS attacks (should use httpOnly cookies)
2. **No refresh token mechanism** — user is logged out after 24h with no seamless renewal
3. **Interceptor aggressively clears session on ANY 401** — a single failed API call (e.g., from a CORS preflight failure) used to log out the user. This was partially fixed by adding a global `CorsConfigurationSource` bean, but the aggressive behavior remains a design risk.
4. **`ROLE_USER` vs `ROLE_CAMPER` confusion** — `DataInitializer` creates a "camper" user with `ROLE_USER`, but the frontend navbar checks for `ROLE_CAMPER`. These are different roles, so a user created with the seed data cannot access camper-specific routes and will see an empty navigation bar.

---

## 8. CODE QUALITY ISSUES & MISTAKES

### CRITICAL MISTAKES

1. **Duplicate service names across different directories:**
   - `TripService` exists in BOTH `core/services/trip.service.ts` AND `features/trips/services/trip.service.ts`. Both are mock-based but have different interfaces. Components import one or the other inconsistently.
   - `SafetyAlertController` exists in BOTH `controller/SafetyAlertController.java` AND `transport/controller/SafetyAlertController.java`. This creates ambiguity.

2. **Community module completely disconnected from backend:**
   - The backend has `PostController` (`/api/posts`), `CommentController`, and `ForumThreadService` with full CRUD.
   - The frontend `CommunityService` returns hardcoded mock data via `of(mockPosts)` — it doesn't even import `HttpClient`.
   - This is the single biggest integration gap in the project.

3. **Hardcoded API URLs in some services:**
   - `AcademyService` hardcodes `http://localhost:8081/api/academy` instead of using `environment.apiUrl`.
   - `SafetyService` hardcodes `http://localhost:8081/api/incidents`.
   - `EventService` hardcodes `http://localhost:8081/api/events`.
   - This breaks if the backend port changes and is inconsistent with other services that properly use `environment.apiUrl`.

4. **`as any` casts throughout the codebase:**
   - `this.posts = posts as any` in `CommunityFeedComponent`
   - `this.allTopics = posts.map(p => this.mapToRecentTopic(p as any))` in `ForumHomeComponent`
   - These mask type mismatches between backend DTOs and frontend models.

5. **No error boundaries or global error handling on the frontend:**
   - API errors typically just `console.error()` and set `this.loading = false`
   - No toast/snackbar notifications for user-facing errors
   - No Angular error handler or HTTP error interceptor for generic error feedback

### MODERATE ISSUES

6. **Multiple `Post` interfaces defined in different files:**
   - `community.service.ts` defines its own `Post` and `Reply` interfaces
   - `community.model.ts` defines a different `Post` model
   - `community.component.ts` defines yet another inline `Post` interface
   - These all have different shapes, causing `as any` casts everywhere

7. **Unused `connectcamp/backend/` directory** at the project root — appears to be a leftover from a different merge or an old project structure. Should be cleaned up.

8. **Temp files in project root:**
   - `temp_ours_auth.txt`, `temp_theirs_auth.txt` — leftover merge conflict artifacts
   - `nul` — empty file, likely accidental
   - `stat.txt` — old project state file
   - These should be gitignored or deleted.

9. **`styleUrl` vs `styleUrls` inconsistency:**
   - Some components use `styleUrl: './x.component.scss'` (Angular 17+ syntax)
   - Others use `styleUrls: ['./x.component.scss']` (legacy syntax)
   - Both work but the inconsistency indicates poor merge coordination.

10. **DataInitializer resets admin password on every startup:**
    - The `else` branch in `DataInitializer.run()` explicitly re-encodes and saves the password every time. This means any password change made via the app is overwritten on restart.

### MINOR ISSUES

11. **Optional chaining on non-nullable types** (NG8107 warnings) — `post?.author?.name` where `post.author.name` would suffice. ~20+ instances across templates.

12. **Unused imports in components** (NG8113 warnings) — e.g., `ButtonComponent` imported but not used in `AcademyComponent`.

13. **No loading states / skeleton screens** for most data-heavy pages — just a "loading" boolean that shows/hides content with no visual fidelity.

---

## 9. WHAT WAS ACHIEVED

### ✅ Successfully Completed

1. **Full authentication system** — JWT-based login/signup with role-based access control, working across 7 different user roles.

2. **Gear Marketplace (end-to-end):**
   - Browse gear catalog with category filtering and pagination
   - Individual product detail pages
   - Shopping cart functionality
   - Purchase flow
   - Provider portal: add/edit/delete products, view analytics, manage rentals
   - Provider stats dashboard

3. **Delivery Provider Portal (end-to-end):**
   - Delivery dashboard with status filtering
   - Vehicle management (CRUD)
   - Delivery lifecycle management (CREATED → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED)
   - Delivery history and earnings pages

4. **Academy Module (end-to-end):**
   - Course listing and details
   - Video player with upload support
   - Badge system
   - Certification programs and progress tracking
   - Expert profiles

5. **Campsite Management:**
   - Campsite listing, detail, search
   - Season management
   - Reservation CRUD

6. **Safety Module:**
   - Incident reporting with real API integration
   - Safety alerts with CRUD
   - Map service
   - Environmental compliance pages

7. **Events Module:**
   - Event listing with mock fallback
   - Event details with registration
   - Participant management

8. **Admin Portal:**
   - Admin layout with sidebar navigation
   - User management dashboard
   - Multiple admin sub-pages (analytics, bookings, incidents, marketplace, moderation, etc.)

9. **Multi-role navigation system:**
   - Role-aware navbar that shows different menus for different roles
   - Role-based route protection with `authGuard`
   - Separate portal layouts for Admin, Provider, Delivery Provider

10. **Responsive UI** with modern design:
    - Transparent-to-solid navbar on scroll
    - Dark mode support (theme toggle)
    - Mobile menu with hamburger toggle
    - Lucide icons throughout

11. **Full route structure** — 596 lines of routes in `app.routes.ts` covering all features with lazy loading.

12. **Swagger/OpenAPI documentation** on the backend (`/swagger-ui.html`).

---

## 10. WHAT IS LACKING / MISSING

### 🔴 CRITICAL GAPS

1. **Community module has NO backend integration:**
   - Backend APIs exist (`/api/posts`, `/api/posts/{id}`, `/api/posts/thread/{threadId}`, comments)
   - Frontend ignores them entirely and returns mock data
   - This is the most socially important feature and it's purely decorative

2. **Trip planning has NO backend integration:**
   - Backend has full Trip CRUD, itineraries, activities, POIs, route optimization
   - Frontend TripService(s) both return hardcoded mock data
   - Trip budgets, packing lists, nearby places — all mock

3. **Booking flow is disconnected:**
   - The feature-level BookingService is 100% mock
   - ReservationService (core) calls real APIs, but the booking wizard components don't use it
   - Payment flow is simulated with no real payment gateway

4. **No companion matching backend exists:**
   - Frontend has a complete UI for matching, discovery, connections
   - Backend has zero endpoints for this feature
   - Entire feature relies on localStorage

5. **Transportation module is mock-only:**
   - Backend TransportController exists but frontend doesn't call it

### 🟡 MODERATE GAPS

6. **No real-time features:**
   - No WebSocket/SSE for messaging, notifications, or delivery tracking
   - Messaging component exists but is static
   - Group chat UI exists but has no real-time backend

7. **No payment integration:**
   - Payment flow UI exists but processes nothing
   - No Stripe, PayPal, or any payment gateway

8. **No file upload for community posts:**
   - FileUploadController exists on backend
   - Academy video upload works
   - But community posts can't attach images

9. **No notifications system:**
   - No push, email, or in-app notification mechanism
   - Group invites have no notification path

10. **No search backend:**
    - Frontend does client-side filtering for campsites and community
    - No server-side full-text search (MongoDB text indexes unused)

11. **No user profile pictures:**
    - Profile uses placeholder initials or hardcoded Unsplash URLs
    - No avatar upload flow

12. **Admin panel routes exist but many are likely shells:**
    - 11+ admin sub-pages defined but several may only have skeleton UIs

### 🟢 NICE-TO-HAVES

13. No email verification on signup
14. No password reset flow
15. No rate limiting on APIs
16. No pagination on many list endpoints (frontend sends `page=0&size=20`)
17. No data export/import features
18. No accessibility (WCAG) compliance verified
19. No i18n/l10n support (app is English-only)
20. No CI/CD pipeline

---

## 11. DATABASE & DATA MODEL

**Database:** MongoDB at `mongodb://localhost:27017/campconnectdb`

### Collection Summary (inferred from models & entities)

| Collection | Source Package | Key Fields |
|---|---|---|
| `users` | model/User | username, email, password, fullName, roles |
| `roles` | model/Role | name (ERole enum) |
| `campsites` | model/Campsite | name, location, description, price, rating, amenities |
| `categories` | model/Category | name, description |
| `reservations` | model/Reservation | userId, campsiteId, startDate, endDate, status, totalPrice |
| `seasons` | model/Season | campsiteId, name, startDate, endDate, priceMultiplier |
| `posts` | model/Post | title, content, authorId, forumThreadId, tags, likes, createdAt |
| `comments` | model/Comment | postId, authorId, content, createdAt |
| `forum_threads` | model/ForumThread | title, category, authorId, createdAt |
| `groups` | model/Group | name, members, tripId, status |
| `group_messages` | model/GroupMessage | groupId, senderId, content, timestamp |
| `group_decisions` | model/GroupDecision | groupId, title, type, votes, status |
| `group_invites` | model/GroupInvite | groupId, inviterId, inviteeId, status |
| `group_tasks` | model/GroupTask | groupId, title, assigneeId, status |
| `trips` | model/Trip | name, destination, startDate, endDate, userId, status |
| `trip_intents` | model/TripIntent | title, description, userId, status |
| `incidents` | model/Incident | title, description, level, location, reporterId, tripId |
| `safety_alerts` | model/SafetyAlert (×2) | title, description, type, severity, locationName |
| `expenses` | model/Expense | groupId, description, amount, paidBy, splitType |
| `gear` | gear/model/Gear | name, description, price, category, ownerId, status, images |
| `purchases` | gear/model/Purchase | gearId, buyerId, totalPrice, status |
| `rentals` | gear/model/Rental | gearId, renterId, startDate, endDate, status |
| `carts` | gear/model/Cart | userId, items[] |
| `maintenance_records` | gear/model/MaintenanceRecord | gearId, description, date, status |
| `deliveries` | delivery/model/Delivery | rentalId, driverId, status, route, timestamps |
| `vehicles` | delivery/model/Vehicle | driverId, make, model, plateNumber, status |
| `courses` | academy/entity/Course | title, description, instructor, modules, level, duration |
| `badges` | academy/entity/Badge | name, description, iconUrl, criteria |
| `certifications` | academy/entity/Certification | name, description, requirements |
| `user_certifications` | academy/entity/UserCertification | userId, certificationId, earnedDate |
| `videos` | academy/entity/Video | title, description, videoUrl, category, duration |
| `events` | events/entity/Event | title, description, type, location, organizer, capacity, status |
| `event_registrations` | events/entity/EventRegistration | eventId, userId, participants, status |
| `transports` | transport/entity/Transport | type, origin, destination, departureTime, price |

**NOTE:** MongoDB has no enforced schema, so field names here are based on the Java `@Document` classes. There is no migration system — the schema evolves implicitly through code changes.

---

## 12. TESTING STATE

### Backend
- **Test directory exists** (`src/test/java/`) but appears minimal
- No evidence of comprehensive unit or integration tests
- `spring-boot-starter-test` and `spring-security-test` are included as dependencies but unused

### Frontend
- `auth.service.spec.ts` and `trip.service.spec.ts` exist (2 spec files found)
- No component tests observed
- No e2e test framework configured (no Cypress, Playwright, or Protractor setup)

**Testing verdict:** ❌ Effectively untested. The project has almost no automated tests.

---

## 13. FILE STRUCTURE ISSUES

1. **Duplicate `connectcamp/backend/` directory** at project root alongside the actual `backend/` — confusing and should be removed.

2. **Merge conflict artifacts in root:**
   - `temp_ours_auth.txt` (5.9 KB)
   - `temp_theirs_auth.txt` (4.1 KB)
   - `nul` (empty file)

3. **Stale documentation files:**
   - `INTEGRATION_STATUS.md` (10 KB) — likely outdated
   - `PROJECT_STATE.md` (6.3 KB) — likely outdated
   - `PROJECT_OVERVIEW.txt` (17.6 KB) — likely outdated
   - `PATTERNS.md` (13 KB) — likely outdated
   - `stat.txt` (13.8 KB) — old audit file

4. **Inconsistent naming conventions:**
   - Backend entity packages: some use `entity/` (academy, events, trip, transport), others use `model/` (gear, delivery, root)
   - Frontend service placement: some in `features/*/services/`, some in `core/services/`

5. **Two `Post` models in the backend:**
   - `com.campconnect.model.Post` — in the root model package
   - `ForumThread` is a separate model that semantically overlaps with `Post`

---

## 14. SECURITY CONCERNS

| Issue | Severity | Details |
|---|---|---|
| JWT in localStorage | Medium | Vulnerable to XSS; should use httpOnly cookies |
| Hardcoded JWT secret | High | `app.jwtSecret` is a long but static string in `application.properties`. Must use env variables in production. |
| Admin password reset on startup | Medium | `DataInitializer` re-encodes `admin123` on every boot, overwriting any runtime changes |
| No rate limiting | Medium | No throttling on auth endpoints; vulnerable to brute-force |
| No CSRF protection | Low | Disabled (`csrf.disable()`) — acceptable for stateless JWT APIs but noted |
| No input sanitization (XSS) | Medium | User-generated content (posts, comments) is not sanitized before storage or rendering |
| File upload without validation | Medium | `FileUploadController` accepts uploads up to 50MB with no file type validation |
| CORS allows credentials | Low | `allowCredentials(true)` with specific origin — acceptable for dev |
| No HTTPS enforcement | Low | Development only; must be enforced in production |

---

## 15. RECOMMENDATIONS & PRIORITY ACTIONS

### P0 — Must Fix Before Demonstration

1. **Integrate Community module with backend** — Connect `CommunityService` to `POST /api/posts` and `GET /api/posts` instead of returning mock data. This is the most visible broken feature.

2. **Integrate Trip module with backend** — Connect the frontend `TripService` to `GET/POST /api/trips` and the itinerary/activity endpoints.

3. **Fix ROLE_USER vs ROLE_CAMPER inconsistency** — Either update `DataInitializer` to assign `ROLE_CAMPER` to the seeded camper user, or update the frontend to recognize `ROLE_USER` as equivalent to `ROLE_CAMPER`.

4. **Fix hardcoded API URLs** — Replace all `http://localhost:8081/api/...` strings in `AcademyService`, `SafetyService`, and `EventService` with `environment.apiUrl`.

### P1 — Should Fix for Completeness

5. Integrate `BookingService` (feature) with `ReservationService` backend endpoints
6. Create backend endpoints for Companion Matching or explicitly mark it as "future feature"
7. Connect Transportation frontend to backend TransportController
8. Clean up duplicate `SafetyAlertController` (pick one location)
9. Clean up root directory (delete `temp_*` files, `nul`, `connectcamp/` folder)
10. Unify `Post` model definitions across the frontend

### P2 — Code Quality

11. Remove all `as any` casts and properly type API responses
12. Fix NG8107 optional-chaining warnings
13. Remove unused component imports (NG8113)
14. Use `environment.apiUrl` consistently everywhere
15. Add global error handling (HTTP interceptor for error toasts)
16. Add skeleton loading states for better UX
17. Write at least basic unit tests for services

### P3 — Nice to Have

18. Add refresh token mechanism
19. Implement WebSocket for messaging and real-time delivery tracking
20. Add email verification and password reset
21. Set up CI/CD pipeline
22. Add comprehensive e2e tests

---

## APPENDIX: DEFAULT CREDENTIALS (from DataInitializer)

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | ROLE_ADMIN |
| `camper` | `camper123` | ROLE_USER (⚠️ not ROLE_CAMPER) |

---

## APPENDIX: ROUTE MAP

The application has 90+ routes across all features. Key route groups:

| Path Prefix | Feature | Auth Required |
|---|---|---|
| `/` | Landing page | No |
| `/login`, `/signup` | Authentication | No |
| `/admin/*` | Admin portal | Yes (ROLE_ADMIN) |
| `/provider/*` | Equipment provider portal | Yes (ROLE_EQUIPMENT_PROVIDER) |
| `/delivery/*` | Delivery provider portal | Yes (ROLE_DELIVERY_PROVIDER) |
| `/marketplace/*` | Gear marketplace | No (browsing), Yes (cart) |
| `/community/*` | Community hub, feed, forums | No (read), Yes (write) |
| `/academy/*` | Learning platform | No |
| `/campsites/*` | Campsite browsing | No |
| `/gear/*` | Gear catalog | No (browse), Yes (manage) |
| `/plan-trip/*` | Trip planning | Yes |
| `/trips/*` | My trips | Yes |
| `/safety/*` | Safety & incidents | No |
| `/events/*` | Events listing | No |
| `/companions/*` | Companion matching | No |
| `/transportation/*` | Transportation options | No |
| `/profile/*` | User profile & orders | Yes |
| `/dashboard/*` | Role dashboards | Yes |

---

*End of audit.*
