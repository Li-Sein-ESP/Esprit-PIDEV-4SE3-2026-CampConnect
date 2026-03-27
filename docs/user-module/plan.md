# User/Profile Module — Implementation Plan

## Goal
Build backend profile management endpoints and rewrite the frontend
profile components to use real API data instead of hardcoded mock objects.

## Context Files to Read First
Before implementing anything, the implementing model MUST read:
- `CONSTITUTION.md` — project rules and constraints
- `PATTERNS.md` — exact code patterns to follow
- `docs/user-module/api-contract.md` — exact endpoint specifications
- `docs/user-module/tasks.md` — ordered task list

## Constraints (from CONSTITUTION.md)
- Do NOT modify: `AuthController.java`, `User.java` model, `UserRepository.java`, `app.routes.ts`
- Do NOT add dependencies
- Follow the gear module package structure exactly
- Use Lombok, ModelMapper, Swagger annotations, Jakarta validation
- Angular components must be standalone with OnPush change detection
- Use RxJS `takeUntil` pattern for subscriptions

---

## Proposed Changes

### Backend — New Files

---

#### [NEW] UserProfileResponse.java
- **Path**: `backend/src/main/java/com/campconnect/dto/UserProfileResponse.java`
- **Package**: `com.campconnect.dto`
- **Pattern**: Follow `GearResponse.java` from PATTERNS.md (Backend DTO Class Pattern)
- **Fields**:
  - `String id`
  - `String username`
  - `String email`
  - `String name`
  - `List<String> roles` — extracted from `Set<Role>` by mapping `role.getName().name()`
  - `Map<String, Object> profileDetails`
  - `LocalDateTime createdAt`
- **Annotations**: `@Data`, `@Schema(description = "User profile response")`
- **Note**: Do NOT include `password`. Roles must be mapped from the `Set<Role>` on the User entity to a `List<String>` of role name strings.

---

#### [NEW] UpdateProfileRequest.java
- **Path**: `backend/src/main/java/com/campconnect/dto/UpdateProfileRequest.java`
- **Package**: `com.campconnect.dto`
- **Pattern**: Follow `GearRequest.java` from PATTERNS.md (Backend Request DTO Pattern)
- **Fields**:
  - `@Size(min = 2, max = 50) String name`
  - `@Email String email`
  - `Map<String, Object> profileDetails` — stores bio, location, profileImage, etc.
- **Annotations**: `@Data`, `@Schema(description = "Request body to update user profile")`
- **Validation**: Use Jakarta `@Size`, `@Email`. All fields are optional (nullable) — only non-null fields get updated (partial update).

---

#### [NEW] ChangePasswordRequest.java
- **Path**: `backend/src/main/java/com/campconnect/dto/ChangePasswordRequest.java`
- **Package**: `com.campconnect.dto`
- **Fields**:
  - `@NotBlank String currentPassword`
  - `@NotBlank @Size(min = 6, max = 40) String newPassword`
- **Annotations**: `@Data`, `@Schema(description = "Request body to change password")`

---

#### [NEW] UserService.java
- **Path**: `backend/src/main/java/com/campconnect/service/UserService.java`
- **Package**: `com.campconnect.service`
- **Pattern**: Follow `GearService.java` from PATTERNS.md (Backend Service Pattern)
- **Annotations**: `@Service`, `@RequiredArgsConstructor`
- **Dependencies (injected via constructor)**:
  - `UserRepository userRepository`
  - `PasswordEncoder passwordEncoder`
  - `ModelMapper modelMapper`
- **Methods**:

  1. `UserProfileResponse getProfile(String userId)`
     - Call `userRepository.findById(userId)`
     - Throw `ResourceNotFoundException("User", "id", userId)` if not found
     - Map to `UserProfileResponse` manually (because roles need `Set<Role>` → `List<String>` conversion)
     - Role mapping: `user.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList())`

  2. `UserProfileResponse updateProfile(String userId, UpdateProfileRequest request)`
     - Find user by id, throw `ResourceNotFoundException` if not found
     - If `request.getName()` is not null → `user.setName(request.getName())`
     - If `request.getEmail()` is not null and different from current:
       - Check `userRepository.existsByEmail(request.getEmail())` → throw `BadRequestException("Email already in use")` if true
       - `user.setEmail(request.getEmail())`
     - If `request.getProfileDetails()` is not null → merge into existing profileDetails (do not replace entirely; use `putAll`)
     - Save and return mapped `UserProfileResponse`

  3. `void changePassword(String userId, ChangePasswordRequest request)`
     - Find user by id
     - Verify `passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())` → throw `BadRequestException("Current password is incorrect")` if false
     - `user.setPassword(passwordEncoder.encode(request.getNewPassword()))`
     - Save

---

#### [NEW] UserController.java
- **Path**: `backend/src/main/java/com/campconnect/controller/UserController.java`
- **Package**: `com.campconnect.controller`
- **Pattern**: Follow `GearController.java` from PATTERNS.md (Backend Controller Pattern)
- **Annotations**:
  - `@RestController`
  - `@RequestMapping("/api/users")`
  - `@RequiredArgsConstructor`
  - `@Tag(name = "Users", description = "User profile management")`
  - `@PreAuthorize("isAuthenticated()")` — class-level, all endpoints require login
- **Dependency**: `private final UserService userService;`
- **Endpoints**:

  1. `GET /api/users/me`
     - Method signature: `getMe(@AuthenticationPrincipal UserDetailsImpl userDetails)`
     - Returns: `ResponseEntity<UserProfileResponse>`
     - Calls: `userService.getProfile(userDetails.getId())`

  2. `PUT /api/users/me`
     - Method signature: `updateMe(@Valid @RequestBody UpdateProfileRequest request, @AuthenticationPrincipal UserDetailsImpl userDetails)`
     - Returns: `ResponseEntity<UserProfileResponse>`
     - Calls: `userService.updateProfile(userDetails.getId(), request)`

  3. `PUT /api/users/me/password`
     - Method signature: `changePassword(@Valid @RequestBody ChangePasswordRequest request, @AuthenticationPrincipal UserDetailsImpl userDetails)`
     - Returns: `ResponseEntity<MessageResponse>` with message "Password updated successfully"
     - Calls: `userService.changePassword(userDetails.getId(), request)`

---

### Frontend — New Files

---

#### [NEW] user.model.ts
- **Path**: `angular-campconnect/src/app/features/auth/models/user.model.ts`
- **Contents**: TypeScript interfaces matching the backend DTOs exactly:
  - `UserProfileResponse` — matches `UserProfileResponse.java`
  - `UpdateProfileRequest` — matches `UpdateProfileRequest.java`
  - `ChangePasswordRequest` — matches `ChangePasswordRequest.java`

---

#### [NEW] user-api.service.ts
- **Path**: `angular-campconnect/src/app/features/auth/services/user-api.service.ts`
- **Pattern**: Follow `gear-api.service.ts` from PATTERNS.md (Frontend Angular Service Pattern)
- **Base URL**: `${environment.apiUrl}/users`
- **Methods**:
  - `getProfile(): Observable<UserProfileResponse>` → `GET /api/users/me`
  - `updateProfile(data: UpdateProfileRequest): Observable<UserProfileResponse>` → `PUT /api/users/me`
  - `changePassword(data: ChangePasswordRequest): Observable<any>` → `PUT /api/users/me/password`

---

### Frontend — Modified Files

---

#### [MODIFY] camper-profile.component.ts
- **Path**: `angular-campconnect/src/app/features/auth/profile/camper-profile.component.ts`
- **What changes**:
  - Remove the entire hardcoded `user` mock object (lines 15–57)
  - Add import of `UserApiService` and `UserProfileResponse`
  - Add `private destroy$ = new Subject<void>()`
  - In `ngOnInit()`: call `userApiService.getProfile()` piped with `takeUntil(this.destroy$)`
  - Store result in a `profile: UserProfileResponse | null = null` property
  - Add `loading = true` and `error: string | null = null` state
  - Add `ngOnDestroy()` with `this.destroy$.next(); this.destroy$.complete();`
  - Keep: the animated numbers logic, tab switching, and badge display (just drive them from real data or keep them static for now since the backend doesn't track stats)
  - The `user.stats`, `user.badges`, `user.trips`, `user.rentals`, `user.savedItems`, `user.reviews` arrays can remain as static display data for now — only `user.name`, `user.bio`, `user.role`, and profile image should come from the API
  - Change detection: add `ChangeDetectionStrategy.OnPush` and `ChangeDetectorRef`
- **Do NOT modify**: `camper-profile.component.html` or `camper-profile.component.scss` — only change the `.ts` file to swap mock data source to API data

---

#### [MODIFY] camper-edit-profile.component.ts
- **Path**: `angular-campconnect/src/app/features/auth/profile/camper-edit-profile.component.ts`
- **What changes**:
  - Add import of `UserApiService` and `UpdateProfileRequest`
  - Remove the hardcoded `currentUserMockData` object
  - In `ngOnInit()`: call `userApiService.getProfile()` to populate the form with real data
    - Patch form fields from profile: `name` → split to `firstName`/`lastName`, `profileDetails.bio` → bio, `profileDetails.location` → location, `profileDetails.profileImage` → profileImage
  - In `onSubmit()`: replace the `console.log` simulation with a real call to `userApiService.updateProfile(...)`:
    - Build `UpdateProfileRequest` from form values: combine `firstName` + `lastName` → `name`, and pack `bio`, `location`, `profileImage` into `profileDetails` map
    - On success: navigate to `/profile`
    - On error: show error message
  - Add `saving = false` state to disable button during save
- **Do NOT modify**: `camper-edit-profile.component.html` or `camper-edit-profile.component.scss`

---

## Implementation Order
1. Backend DTOs (no dependencies)
2. Backend UserService (depends on DTOs, UserRepository, PasswordEncoder)
3. Backend UserController (depends on UserService)
4. Frontend user.model.ts (no dependencies)
5. Frontend user-api.service.ts (depends on model)
6. Frontend camper-profile.component.ts rewrite (depends on service)
7. Frontend camper-edit-profile.component.ts rewrite (depends on service)

---

## Verification Plan

### Build Verification
1. Backend: Run `cd backend && mvn clean compile` — must compile with zero errors
2. Frontend: Run `cd angular-campconnect && ng build` — must build with zero errors

### Manual API Testing (using curl or Postman)
1. Start MongoDB, then `cd backend && mvn spring-boot:run`
2. Register a test user: `POST http://localhost:8081/api/auth/signup`
3. Login to get JWT: `POST http://localhost:8081/api/auth/signin`
4. Test `GET /api/users/me` with Bearer token → should return profile
5. Test `PUT /api/users/me` with name change → should update and return updated profile
6. Test `PUT /api/users/me/password` → should succeed with correct current password, fail with wrong one
7. Test `PUT /api/users/me` with duplicate email → should return 400

### Manual Frontend Testing
1. Start both backend and frontend
2. Login as any user
3. Navigate to `/profile` → should show username from API (not "Jordan Mitchell")
4. Click edit → `/profile/edit` should pre-populate form with real data
5. Change name, save → should redirect to `/profile` showing updated name
6. Verify error handling: stop backend, reload profile page → should show error message
