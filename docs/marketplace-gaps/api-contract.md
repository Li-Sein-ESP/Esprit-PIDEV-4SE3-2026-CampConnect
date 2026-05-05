# Marketplace/Gear Module — New API Endpoints

These are ONLY the NEW endpoints. Existing gear/rental/purchase/cart
endpoints are already documented in Swagger at http://localhost:8081/swagger-ui.html.

Base URL: `http://localhost:8081/api`

---

## GET /api/gear/{gearId}/analytics

**Description**: Get analytics data for a specific gear item owned by the provider.

**Authentication**: Required
**Roles**: `ROLE_EQUIPMENT_PROVIDER` or `ROLE_ADMIN`

**Request**:
```
GET /api/gear/64abc12345def67890/analytics
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| gearId | String | MongoDB ID of the gear item |

**Success Response (200 OK)**:
```json
{
  "gearId": "64abc12345def67890",
  "gearName": "4-Person Camping Tent",
  "totalRentals": 48,
  "totalPurchases": 12,
  "totalRevenue": 4320.00,
  "averageRating": 0.0,
  "activeRentals": 3,
  "availableStock": 8
}
```

**Field types**:
| Field | Java Type | JSON Type | Notes |
|-------|-----------|-----------|-------|
| gearId | String | string | |
| gearName | String | string | |
| totalRentals | long | number | Count from RentalRepository |
| totalPurchases | long | number | Count from PurchaseRepository |
| totalRevenue | BigDecimal | number | Sum of rental + purchase amounts |
| averageRating | double | number | 0.0 if no reviews exist (reviews not implemented yet) |
| activeRentals | int | number | Rentals with status ACTIVE or APPROVED |
| availableStock | int | number | Current gear.quantity |

**How to compute each field**:
- `totalRentals`: `rentalRepository.countByGearId(gearId)`
- `totalPurchases`: `purchaseRepository.countByGearId(gearId)`
- `totalRevenue`: Sum of all purchase `totalPrice` for this gear + approximate rental revenue (rental count × gear.pricePerDay × average duration, or just 0 if rental pricing is complex)
  - **Simpler approach**: Just use `purchaseRepository` to sum `totalPrice` where `gearId` matches. Set rental revenue to 0 initially (rentals don't store total price in the current model).
- `averageRating`: Hardcode to 0.0 — there is no review/rating model yet
- `activeRentals`: `rentalRepository.countByGearIdAndStatusIn(gearId, List.of(ACTIVE, APPROVED))`
- `availableStock`: `gear.getQuantity()`

**Error Responses**:
- `401 Unauthorized` — missing or invalid JWT
- `403 Forbidden` — user does not have EQUIPMENT_PROVIDER role
- `404 Not Found` — gear item not found
  ```json
  { "message": "Gear not found with id: 64abc12345def67890" }
  ```

---

## GET /api/gear/provider/stats

**Description**: Get aggregated stats for the current provider's dashboard.

**Authentication**: Required
**Roles**: `ROLE_EQUIPMENT_PROVIDER` or `ROLE_ADMIN`

**Request**:
```
GET /api/gear/provider/stats
Authorization: Bearer <jwt_token>
```

**Success Response (200 OK)**:
```json
{
  "totalRevenue": 48250.00,
  "activeRentals": 127,
  "pendingRequests": 23,
  "totalProducts": 56,
  "averageRating": 0.0
}
```

**Field types**:
| Field | Java Type | JSON Type | Notes |
|-------|-----------|-----------|-------|
| totalRevenue | BigDecimal | number | Sum of all purchase totalPrice for provider's gear |
| activeRentals | long | number | Rentals with status ACTIVE for provider's gear |
| pendingRequests | long | number | Rentals with status PENDING for provider's gear |
| totalProducts | long | number | Count of non-deleted gear owned by this provider |
| averageRating | double | number | 0.0 (no review system yet) |

**How to compute each field**:
1. Get all gear IDs for this owner: `gearRepository.findByOwnerIdAndDeletedFalse(ownerId)`
2. `totalProducts`: count of the above list
3. `activeRentals`: `rentalRepository.countByGearIdInAndStatus(gearIds, ACTIVE)`
4. `pendingRequests`: `rentalRepository.countByGearIdInAndStatus(gearIds, PENDING)`
5. `totalRevenue`: `purchaseRepository.findByGearIdIn(gearIds)` → sum of `totalPrice`
6. `averageRating`: hardcode 0.0

**Note**: The repository methods `countByGearIdInAndStatus()` and `findByGearIdIn()` may need to be **added** to `RentalRepository` and `PurchaseRepository`. They don't exist yet.

**New repository methods needed**:
```java
// In RentalRepository:
long countByGearId(String gearId);
long countByGearIdAndStatusIn(String gearId, List<RentalStatus> statuses);
long countByGearIdInAndStatus(List<String> gearIds, RentalStatus status);

// In PurchaseRepository:
long countByGearId(String gearId);
List<Purchase> findByGearIdIn(List<String> gearIds);
```

**Error Responses**:
- `401 Unauthorized`
- `403 Forbidden`

---

## Purchase-to-Delivery Integration (NOT a new endpoint)

This is an internal modification to `PurchaseService.create()`.

**Current behavior**: When `PurchaseService.create()` is called, it:
1. Validates the gear, decrements stock, creates `Purchase` with status `CONFIRMED`
2. Returns `PurchaseResponse`
3. No delivery is created

**New behavior**: After step 2, the service also:
4. Builds a `DeliveryRequest` automatically:
   ```json
   {
     "purchaseId": "<new purchase ID>",
     "driverId": "mock-driver-purchase",
     "pickupAddress": "ConnectCamp Warehouse",
     "deliveryAddress": "Buyer address (from profileDetails or 'TBD')",
     "scheduledDate": "<today + 3 days>",
     "priority": "NORMAL"
   }
   ```
5. Calls `deliveryService.create(deliveryRequest)` in a try-catch
6. If delivery creation fails → log the error, DO NOT fail the purchase
7. Return the same `PurchaseResponse` as before (delivery creation is a side effect)

The `DeliveryService.create()` already supports `purchaseId`-based deliveries (verified in audit) and allows `mock-driver-*` IDs to bypass role validation.

**Buyer address**: Look up the buyer via `userRepository.findById(buyerId)`, then check `user.getProfileDetails().get("location")`. If null, use `"TBD - Please update delivery address"`.
