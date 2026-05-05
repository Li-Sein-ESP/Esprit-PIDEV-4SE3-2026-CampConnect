# Delivery Module Gaps — Implementation Plan

## Goal
Close the remaining gaps in the delivery module:
1. Wire delivery-history to real API data (currently 100% mock)
2. Improve delivery-earnings to use a dedicated backend endpoint instead of pseudo-calculating from delivery IDs
3. Add polling to delivery-tracking for near-real-time updates
4. Create backend earnings endpoint (no endpoint currently exists)
5. Note: purchase-to-delivery integration is handled by the marketplace-gaps plan (PurchaseService creates the delivery)

## Context Files to Read First
- `CONSTITUTION.md` — project rules and constraints
- `PATTERNS.md` — exact code patterns to follow
- `docs/delivery-gaps/api-contract.md` — new endpoint specs
- `docs/delivery-gaps/tasks.md` — ordered task list
- `docs/marketplace-gaps/plan.md` — purchase-to-delivery handled there

---

## Audit Results — Component Status

| Component | File | Uses Real API? | Gap |
|-----------|------|---------------|-----|
| delivery-dashboard | `delivery-dashboard.component.ts` | ✅ REAL | None — fully wired via `DeliveryApiService` |
| delivery-vehicles | `delivery-vehicles.component.ts` | ✅ REAL | None — uses `VehicleApiService` for full CRUD |
| delivery-details | `delivery-details.component.ts` | ✅ REAL | None — calls `DeliveryApiService.getById()`, maps to UI, updates status via API |
| delivery-tracking | `delivery-tracking.component.ts` | ⚠️ PARTIAL | Calls `DeliveryApiService.getById()` once, but does NOT poll. Also skips API call for default mock ID "CC-48291" |
| delivery-earnings | `delivery-earnings.component.ts` | ⚠️ HYBRID | Calls `DeliveryApiService.getMyDeliveries()` but calculates fake earnings using `id.length * 3.4` formula. Falls back to full mock data on error or no deliveries |
| delivery-history | `delivery-history.component.ts` | ❌ MOCK | 100% hardcoded array of 8 mock deliveries. No API calls at all |

---

## What ALREADY EXISTS and MUST NOT be modified

### Backend (DO NOT MODIFY these files)
- `delivery/controller/DeliveryController.java` — all CRUD endpoints
- `delivery/controller/VehicleController.java` — vehicle management
- `delivery/service/DeliveryService.java` — delivery business logic
- `delivery/service/VehicleService.java` — vehicle business logic
- All models, DTOs, repositories

### Frontend files already fully wired (DO NOT MODIFY)
- `delivery-dashboard.component.ts` — fully wired
- `delivery-vehicles.component.ts` — fully wired
- `delivery-details.component.ts` — fully wired
- `services/delivery-api.service.ts` — complete service (may need 1 new method)
- `services/vehicle-api.service.ts` — complete service

---

## Proposed Changes

### Backend — New Files

---

#### [NEW] EarningsResponse.java
- **Path**: `backend/src/main/java/com/campconnect/delivery/dto/EarningsResponse.java`
- **Package**: `com.campconnect.delivery.dto`
- **Pattern**: Follow "Backend DTO Class Pattern" from PATTERNS.md
- **Purpose**: Response for delivery earnings calculation
- **Fields**: `BigDecimal totalEarnings`, `BigDecimal weeklyEarnings`, `BigDecimal monthlyEarnings`, `long deliveriesCompleted`, `BigDecimal averagePerDelivery`, `List<DailyEarning> dailyBreakdown`
- **Inner class** `DailyEarning`: `String date`, `BigDecimal amount`, `int count`

---

### Backend — Modified Files

---

#### [MODIFY] DeliveryService.java
- **Path**: `backend/src/main/java/com/campconnect/delivery/service/DeliveryService.java`
- **What to ADD (do NOT modify existing methods)**:
  - `EarningsResponse calculateEarnings(String driverId)` method
  - Queries `deliveryRepository.findByDriverIdAndStatusAndDeletedFalse(driverId, DELIVERED, pageable)` to get all completed deliveries for this driver
  - Since deliveries don't currently store monetary amounts, use a flat-rate calculation:
    - Base fee per delivery: $15.00
    - No per-km rate (no distance data in Delivery model)
    - Total = count × $15.00
  - Group by date to build `dailyBreakdown`
  - Calculate weekly (last 7 days) and monthly (last 30 days) subtotals

---

#### [MODIFY] DeliveryController.java
- **Path**: `backend/src/main/java/com/campconnect/delivery/controller/DeliveryController.java`
- **What to ADD (do not modify existing endpoints)**:
  - `GET /api/deliveries/earnings` → calls `deliveryService.calculateEarnings(userDetails.getId())`
  - Requires `ROLE_DELIVERY_PROVIDER` or `ROLE_ADMIN`
  - Returns `ResponseEntity<EarningsResponse>`

---

#### [MODIFY] DeliveryRepository.java
- **Path**: `backend/src/main/java/com/campconnect/delivery/repository/DeliveryRepository.java`
- **What to ADD**:
  - `List<Delivery> findByDriverIdAndStatusAndDeletedFalse(String driverId, DeliveryStatus status)` — Spring Data derived query, no implementation needed

---

### Frontend — Modified Files

---

#### [MODIFY] delivery-api.service.ts
- **Path**: `angular-campconnect/src/app/features/delivery/services/delivery-api.service.ts`
- **What to ADD**:
  - New interface `EarningsResponse` matching backend DTO
  - New method: `getEarnings(): Observable<EarningsResponse>` → `GET /api/deliveries/earnings`

---

#### [MODIFY] delivery-history.component.ts
- **Path**: `angular-campconnect/src/app/features/delivery/delivery-history/delivery-history.component.ts`
- **What changes**: Remove 100% mock `history` array. Inject `DeliveryApiService`. In `ngOnInit()`, call `getMyDeliveries(0, 50)` to fetch real delivery history. Map `DeliveryResponse` items to `DeliveryHistory` interface format used in template.

---

#### [MODIFY] delivery-earnings.component.ts
- **Path**: `angular-campconnect/src/app/features/delivery/delivery-earnings/delivery-earnings.component.ts`
- **What changes**: Replace the pseudo-calculation logic (`id.length * 3.4`) with a call to the new `getEarnings()` endpoint. Remove all mock fallback data (the hardcoded `recentPayments` array). Populate `total`, `weekly`, `monthly`, `deliveriesCompleted` from the API response. Keep `vehicleBreakdown` and chart rendering as-is (these are visual elements that don't have backend data yet).

---

#### [MODIFY] delivery-tracking.component.ts
- **Path**: `angular-campconnect/src/app/features/delivery/delivery-tracking/delivery-tracking.component.ts`
- **What changes**:
  1. Remove the `if (id === 'CC-48291') return;` bypass — always try to load from API
  2. Add a polling interval: call `loadDeliveryStatus(id)` every 15 seconds using `setInterval`
  3. Clear the polling interval in `ngOnDestroy()` alongside the existing ETA interval cleanup
  4. When the delivery status reaches `DELIVERED`, stop both the polling and ETA countdown

---

## Cross-Module Dependency: Purchase-to-Delivery Integration

**Handled in**: `docs/marketplace-gaps/tasks.md` (Task 5)

The marketplace-gaps plan modifies `PurchaseService.create()` to automatically call `DeliveryService.create()` when a purchase is made. The delivery module does NOT need any changes to support this — `DeliveryService.create()` already accepts `purchaseId` in the `DeliveryRequest`.

**No duplicate work needed in this plan.**

---

## Future Work (NOT in scope)
- WebSocket-based real-time tracking (needs Spring WebSocket config, message broker)
- Per-delivery pricing/earnings model (deliveries don't store amounts)
- Rating system for delivery drivers
- Route optimization

---

## Verification Plan

### Build Verification
1. `cd backend && mvn clean compile` — zero errors
2. `cd angular-campconnect && ng build` — zero errors

### API Testing
```bash
# Login as delivery provider
TOKEN=$(curl -s -X POST http://localhost:8081/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"username":"deliveryuser","password":"test123"}' | jq -r '.token')

# Test earnings endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/deliveries/earnings
```

### Frontend Testing
1. Login as delivery provider
2. Navigate to `/delivery/history` → should show real deliveries from API (may be empty if none exist)
3. Navigate to `/delivery/earnings` → should show calculated earnings from API
4. Navigate to `/delivery/tracking/{id}` → should auto-refresh every 15s
