# User/Profile Module — Task List

## Pre-requisites
Before starting, read these files in order:
1. `CONSTITUTION.md` — rules and constraints
2. `PATTERNS.md` — code patterns to follow exactly
3. `docs/user-module/plan.md` — full implementation plan
4. `docs/user-module/api-contract.md` — exact API specifications

---

## Task 1 — Backend DTOs
**Dependencies**: None
**Files to create**:
- `backend/src/main/java/com/campconnect/dto/UserProfileResponse.java`
- `backend/src/main/java/com/campconnect/dto/UpdateProfileRequest.java`
- `backend/src/main/java/com/campconnect/dto/ChangePasswordRequest.java`

**Pattern**: Follow the "Backend DTO Class Pattern" and "Backend Request DTO Pattern" in PATTERNS.md.

**Implementation details**:

### UserProfileResponse.java
```java
package com.campconnect.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Schema(description = "User profile response")
public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private String name;
    private List<String> roles;
    private Map<String, Object> profileDetails;
    private LocalDateTime createdAt;
}
```

### UpdateProfileRequest.java
```java
package com.campconnect.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.Map;

@Data
@Schema(description = "Request body to update user profile")
public class UpdateProfileRequest {
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @Email(message = "Email must be valid")
    private String email;

    private Map<String, Object> profileDetails;
}
```

### ChangePasswordRequest.java
```java
package com.campconnect.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request body to change password")
public class ChangePasswordRequest {
    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @NotBlank(message = "New password is required")
    @Size(min = 6, max = 40, message = "New password must be between 6 and 40 characters")
    private String newPassword;
}
```

**Expected outcome**: Three DTO files compile without errors. Run `mvn compile` to verify.

---

## Task 2 — Backend UserService
**Dependencies**: Task 1 (DTOs must exist)
**Files to create**:
- `backend/src/main/java/com/campconnect/service/UserService.java`

**Pattern**: Follow the "Backend Service Pattern" in PATTERNS.md.

**Implementation details**:
```java
package com.campconnect.service;

import com.campconnect.dto.ChangePasswordRequest;
import com.campconnect.dto.UpdateProfileRequest;
import com.campconnect.dto.UserProfileResponse;
import com.campconnect.exception.BadRequestException;
import com.campconnect.exception.ResourceNotFoundException;
import com.campconnect.model.User;
import com.campconnect.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserProfileResponse getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(String userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        if (request.getProfileDetails() != null) {
            if (user.getProfileDetails() == null) {
                user.setProfileDetails(new HashMap<>());
            }
            user.getProfileDetails().putAll(request.getProfileDetails());
        }

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(String userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserProfileResponse toResponse(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRoles(user.getRoles().stream()
                .map(r -> r.getName().name())
                .collect(Collectors.toList()));
        response.setProfileDetails(user.getProfileDetails());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
```

**Important notes**:
- Do NOT use ModelMapper for User → UserProfileResponse because the `roles` field needs custom mapping (`Set<Role>` → `List<String>` via `role.getName().name()`). Use manual mapping as shown above.
- The `PasswordEncoder` bean already exists in `SecurityConfig.java`.
- `ResourceNotFoundException` and `BadRequestException` already exist in `com.campconnect.exception`.

**Expected outcome**: `UserService.java` compiles. Run `mvn compile`.

---

## Task 3 — Backend UserController
**Dependencies**: Task 2 (UserService must exist)
**Files to create**:
- `backend/src/main/java/com/campconnect/controller/UserController.java`

**Pattern**: Follow the "Backend Controller Pattern" in PATTERNS.md.

**Implementation details**:
```java
package com.campconnect.controller;

import com.campconnect.dto.ChangePasswordRequest;
import com.campconnect.dto.MessageResponse;
import com.campconnect.dto.UpdateProfileRequest;
import com.campconnect.dto.UserProfileResponse;
import com.campconnect.service.UserService;
import com.campconnect.service.UserDetailsImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
@PreAuthorize("isAuthenticated()")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    public ResponseEntity<UserProfileResponse> getMe(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getId()));
    }

    @PutMapping("/me")
    @Operation(summary = "Update current user profile")
    public ResponseEntity<UserProfileResponse> updateMe(
            @Valid @RequestBody UpdateProfileRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(userService.updateProfile(userDetails.getId(), request));
    }

    @PutMapping("/me/password")
    @Operation(summary = "Change current user password")
    public ResponseEntity<MessageResponse> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        userService.changePassword(userDetails.getId(), request);
        return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
    }
}
```

**Important notes**:
- `MessageResponse` already exists in `com.campconnect.dto.MessageResponse`.
- `UserDetailsImpl` already exists in `com.campconnect.service.UserDetailsImpl`.
- Spring Security is already configured and the `/api/users/**` path will be accessible to authenticated users. Verify that `SecurityConfig.java` does not block `/api/users/**`. If it only allows specific paths, you may need to add `.requestMatchers("/api/users/**").authenticated()` to the filter chain. Check `SecurityConfig.java` before testing.

**Expected outcome**: Backend compiles and all 3 endpoints respond. Run `mvn compile`, then `mvn spring-boot:run` and test with curl.

### Verification commands:
```bash
# Register + Login to get token
curl -X POST http://localhost:8081/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"test123","name":"Test User","role":["camper"]}'

TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}' | jq -r '.token')

# Test GET /api/users/me
curl -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/users/me

# Test PUT /api/users/me
curl -X PUT http://localhost:8081/api/users/me \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated Name","profileDetails":{"bio":"My new bio","location":"Seattle"}}'

# Test PUT /api/users/me/password
curl -X PUT http://localhost:8081/api/users/me/password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"test123","newPassword":"newpass123"}'
```

---

## Task 4 — Frontend User Model
**Dependencies**: None (can be done in parallel with Tasks 1-3)
**Files to create**:
- `angular-campconnect/src/app/features/auth/models/user.model.ts`

**Implementation details**:
```typescript
export interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    name: string;
    roles: string[];
    profileDetails: Record<string, any> | null;
    createdAt: string;
}

export interface UpdateProfileRequest {
    name?: string;
    email?: string;
    profileDetails?: Record<string, any>;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}
```

**Expected outcome**: File created. `ng build` still succeeds (no imports yet).

---

## Task 5 — Frontend UserApiService
**Dependencies**: Task 4 (model must exist)
**Files to create**:
- `angular-campconnect/src/app/features/auth/services/user-api.service.ts`

**Pattern**: Follow the `gear-api.service.ts` pattern from PATTERNS.md exactly.

**Implementation details**:
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
    UserProfileResponse,
    UpdateProfileRequest,
    ChangePasswordRequest
} from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserApiService {
    private readonly base = `${environment.apiUrl}/users`;

    constructor(private http: HttpClient) { }

    getProfile(): Observable<UserProfileResponse> {
        return this.http.get<UserProfileResponse>(`${this.base}/me`);
    }

    updateProfile(data: UpdateProfileRequest): Observable<UserProfileResponse> {
        return this.http.put<UserProfileResponse>(`${this.base}/me`, data);
    }

    changePassword(data: ChangePasswordRequest): Observable<any> {
        return this.http.put(`${this.base}/me/password`, data);
    }
}
```

**Expected outcome**: Service created. `ng build` still succeeds.

---

## Task 6 — Rewrite camper-profile.component.ts
**Dependencies**: Task 5 (UserApiService must exist)
**Files to modify**:
- `angular-campconnect/src/app/features/auth/profile/camper-profile.component.ts`

**Pattern**: Follow the `GearListComponent` from PATTERNS.md (Angular Component Pattern) for the loading/error/data pattern.

**What to change**:
1. Add imports: `ChangeDetectionStrategy`, `ChangeDetectorRef`, `OnDestroy`, `Subject`, `takeUntil`
2. Add import: `UserApiService` and `UserProfileResponse`
3. Add `changeDetection: ChangeDetectionStrategy.OnPush` to `@Component`
4. Add `implements OnDestroy` to the class
5. Replace the hardcoded `user` object with:
   - `profile: UserProfileResponse | null = null;`
   - `loading = true;`
   - `error: string | null = null;`
   - `private destroy$ = new Subject<void>();`
6. In `constructor`: add `private userApi: UserApiService`, `private cdr: ChangeDetectorRef`
7. Rewrite `ngOnInit()`:
   ```typescript
   this.userApi.getProfile()
       .pipe(takeUntil(this.destroy$))
       .subscribe({
           next: (data) => {
               this.profile = data;
               this.user.name = data.name || data.username;
               this.user.role = data.roles?.[0]?.replace('ROLE_', '') || 'CAMPER';
               if (data.profileDetails) {
                   this.user.bio = (data.profileDetails['bio'] as string) || this.user.bio;
               }
               this.loading = false;
               this.cdr.markForCheck();
           },
           error: () => {
               this.error = 'Failed to load profile.';
               this.loading = false;
               this.cdr.markForCheck();
           }
       });
   ```
8. Add `ngOnDestroy`: `this.destroy$.next(); this.destroy$.complete();`
9. **Keep** the static arrays for `user.stats`, `user.badges`, `user.trips`, `user.rentals`, `user.savedItems`, `user.reviews` — these will be replaced with real data in a future task when the corresponding backend endpoints are built. For now they provide visual content on the profile page.
10. **Remove** the old `authService.getCurrentUser()` subscription in `ngOnInit` — it is replaced by the `userApi.getProfile()` call.

**Do NOT modify**: `camper-profile.component.html`, `camper-profile.component.scss`

**Expected outcome**: Profile page loads username and bio from the backend API. Static stats/badges/trips remain displayed. `ng build` succeeds.

---

## Task 7 — Rewrite camper-edit-profile.component.ts
**Dependencies**: Task 5 (UserApiService must exist), Task 6 ideally done first
**Files to modify**:
- `angular-campconnect/src/app/features/auth/profile/camper-edit-profile.component.ts`

**What to change**:
1. Add import: `UserApiService`, `UpdateProfileRequest`, `UserProfileResponse`
2. Add `private userApi: UserApiService` to constructor
3. Add `saving = false;` property
4. Remove `currentUserMockData` object entirely
5. Rewrite `ngOnInit()` to load real data:
   ```typescript
   this.editForm = this.fb.group({
       firstName: ['', Validators.required],
       lastName: ['', Validators.required],
       bio: [''],
       location: [''],
       profileImage: ['']
   });

   this.userApi.getProfile().subscribe(profile => {
       if (profile) {
           const parts = (profile.name || '').split(' ');
           this.editForm.patchValue({
               firstName: parts[0] || '',
               lastName: parts.slice(1).join(' ') || '',
               bio: profile.profileDetails?.['bio'] || '',
               location: profile.profileDetails?.['location'] || '',
               profileImage: profile.profileDetails?.['profileImage'] || ''
           });
           if (profile.profileDetails?.['profileImage']) {
               this.profileImagePreview = profile.profileDetails['profileImage'] as string;
           }
       }
   });
   ```
6. Rewrite `onSubmit()` to call real API:
   ```typescript
   onSubmit() {
       if (this.editForm.valid && !this.saving) {
           this.saving = true;
           const val = this.editForm.value;
           const request: UpdateProfileRequest = {
               name: `${val.firstName} ${val.lastName}`.trim(),
               profileDetails: {
                   bio: val.bio,
                   location: val.location,
                   profileImage: val.profileImage
               }
           };
           this.userApi.updateProfile(request).subscribe({
               next: () => {
                   this.saving = false;
                   this.router.navigate(['/profile']);
               },
               error: (err) => {
                   this.saving = false;
                   console.error('Profile update failed:', err);
                   // Optionally show error to user
               }
           });
       } else {
           this.editForm.markAllAsTouched();
       }
   }
   ```

**Do NOT modify**: `camper-edit-profile.component.html`, `camper-edit-profile.component.scss`

**Expected outcome**: Edit profile form loads real data from the API, saves changes to the backend, and navigates back to `/profile` on success. `ng build` succeeds.

---

## Final Verification

After all 7 tasks are complete:

1. `cd backend && mvn clean compile` — zero errors
2. `cd angular-campconnect && ng build` — zero errors
3. Manual test: login → `/profile` shows real username → `/profile/edit` shows real data in form → save → `/profile` shows updated data
4. Manual test: password change works with correct current password, fails with wrong one
