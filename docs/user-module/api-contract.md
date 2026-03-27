# User/Profile Module — API Contract

All endpoints require authentication via JWT Bearer token in the
`Authorization` header. The token is obtained from `POST /api/auth/signin`.

Base URL: `http://localhost:8081/api`

---

## GET /api/users/me

**Description**: Get the authenticated user's profile.

**Authentication**: Required (any authenticated user)
**Roles**: Any — no specific role restriction

**Request**: No body. Token in header.

```
GET /api/users/me
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK)**:
```json
{
  "id": "6601a1b2c3d4e5f6a7b8c9d0",
  "username": "johndoe",
  "email": "john@example.com",
  "name": "John Doe",
  "roles": ["ROLE_CAMPER"],
  "profileDetails": {
    "bio": "Nature lover and weekend camper",
    "location": "Portland, Oregon",
    "profileImage": "https://example.com/photo.jpg"
  },
  "createdAt": "2024-01-15T10:30:00"
}
```

**Field types** (Java → JSON):
| Field | Java Type | JSON Type | Nullable |
|-------|-----------|-----------|----------|
| id | String | string | no |
| username | String | string | no |
| email | String | string | no |
| name | String | string | yes |
| roles | List\<String\> | string[] | no |
| profileDetails | Map\<String, Object\> | object | yes |
| createdAt | LocalDateTime | string (ISO) | yes |

**Error Responses**:
- `401 Unauthorized` — missing or invalid JWT token
- `404 Not Found` — user ID from token doesn't match any user

---

## PUT /api/users/me

**Description**: Update the authenticated user's profile information.
This is a partial update — only non-null fields are applied.

**Authentication**: Required (any authenticated user)
**Roles**: Any

**Request**:
```
PUT /api/users/me
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "John Updated Doe",
  "email": "newemail@example.com",
  "profileDetails": {
    "bio": "Updated bio text",
    "location": "Seattle, Washington",
    "profileImage": "https://example.com/new-photo.jpg"
  }
}
```

**Request field constraints**:
| Field | Java Type | Validation | Required |
|-------|-----------|------------|----------|
| name | String | @Size(min=2, max=50) | no |
| email | String | @Email | no |
| profileDetails | Map\<String, Object\> | none | no |

**Partial update behavior**:
- If `name` is `null` or absent → name is NOT changed
- If `email` is `null` or absent → email is NOT changed
- If `email` is provided and already used by another user → 400 error
- If `profileDetails` is provided → its keys are MERGED into existing
  profileDetails via `putAll()` (existing keys not in request are kept)

**Success Response (200 OK)**:
Same shape as `GET /api/users/me` response with updated values.

**Error Responses**:
- `400 Bad Request` — validation errors or duplicate email
  ```json
  { "message": "Email already in use" }
  ```
- `401 Unauthorized` — missing or invalid JWT
- `404 Not Found` — user not found

---

## PUT /api/users/me/password

**Description**: Change the authenticated user's password.

**Authentication**: Required (any authenticated user)
**Roles**: Any

**Request**:
```
PUT /api/users/me/password
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Request field constraints**:
| Field | Java Type | Validation | Required |
|-------|-----------|------------|----------|
| currentPassword | String | @NotBlank | yes |
| newPassword | String | @NotBlank, @Size(min=6, max=40) | yes |

**Success Response (200 OK)**:
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses**:
- `400 Bad Request` — current password incorrect
  ```json
  { "message": "Current password is incorrect" }
  ```
- `400 Bad Request` — validation error (newPassword too short)
  ```json
  { "message": "New password must be between 6 and 40 characters" }
  ```
- `401 Unauthorized` — missing or invalid JWT
- `404 Not Found` — user not found

---

## Notes for Frontend Integration

1. **JWT token injection**: The existing `AuthInterceptor` at
   `core/interceptors/auth.interceptor.ts` automatically attaches the
   Bearer token. No manual header setup needed in the Angular service.

2. **Error handling**: Use the same pattern as `GearListComponent` — check
   `err.status` for 401/403/404 and display appropriate messages.

3. **profileDetails mapping**: The `profileDetails` field is a flexible
   `Map<String, Object>`. The frontend stores `bio`, `location`, and
   `profileImage` as keys in this map. The edit form must:
   - READ: extract `profile.profileDetails?.['bio']` etc.
   - WRITE: pack form fields into a `profileDetails` object in the request

4. **Name splitting**: The backend stores a single `name` field. The
   frontend edit form has `firstName` and `lastName`. The component must:
   - READ: split `profile.name` by space → first = parts[0], last = parts.slice(1).join(' ')
   - WRITE: combine `firstName + ' ' + lastName` → `name` field in request
