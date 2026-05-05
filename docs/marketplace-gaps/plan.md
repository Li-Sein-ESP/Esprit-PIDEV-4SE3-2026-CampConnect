# Marketplace/Gear Module Gaps — Implementation Plan

## Goal
Close the remaining gaps in the marketplace/gear module:
1. Build new backend analytics endpoint for provider product stats
2. Wire provider-dashboard to real API data (currently 100% mock)
3. Wire provider-profile to real API data (currently 100% mock)
4. Wire provider-product-analytics to new backend endpoint (currently 100% mock)
5. Wire camper-orders to real purchase API data (currently 100% mock)
6. Delete orphaned mock service file
7. Add purchase-to-delivery integration in the backend

## Context Files to Read First
- `CONSTITUTION.md` — project rules and constraints
- `PATTERNS.md` — exact code patterns to follow
- `docs/marketplace-gaps/api-contract.md` — new endpoint specs
- `docs/marketplace-gaps/tasks.md` — ordered task list

## Key Finding from Audit
**The mock `core/services/gear.service.ts` is an ORPHAN — no component imports it.**
All marketplace/gear components already import `features/gear/services/gear-api.service.ts`.
The mock file can be deleted immediately with zero import changes needed.

---

## What ALREADY EXISTS and MUST NOT be modified

### Backend (DO NOT MODIFY these files)
- `gear/controller/GearController.java` — full CRUD, pagination, filtering
- `gear/controller/RentalController.java` — create, approve, return rental
- `gear/controller/PurchaseController.java` — purchase gear, track purchases
- `gear/controller/CartController.java` — add, remove, view cart
- `gear/controller/MaintenanceController.java` — maintenance tracking
- `gear/service/GearService.java` — gear business logic
- `gear/service/RentalService.java` — rental business logic
- `gear/service/PurchaseService.java` — purchase business logic (**will be MODIFIED to add delivery creation hook — see below**)
- `delivery/service/DeliveryService.java` — delivery management (already supports `purchaseId` in `create()`)
- All models, DTOs, repositories in the gear and delivery packages

### Frontend components already using REAL API
- `gear/gear-list/gear-list.component.ts` → uses `GearApiService`
- `gear/gear-detail/gear-detail.component.ts` → uses `GearApiService`
- `gear/gear-create/gear-create.component.ts` → uses `GearApiService`
- `gear/my-gear/my-gear.component.ts` → uses `GearApiService`
- `gear/gear.component.ts` → uses `GearApiService`
- `marketplace/marketplace-landing/marketplace-landing.component.ts` → uses `GearApiService`
- `marketplace/marketplace-category/marketplace-category.component.ts` → uses `GearApiService`
- `marketplace/marketplace-product-details/marketplace-product-details.component.ts` → uses `GearApiService`
- `marketplace/provider-manage-products/provider-manage-products.component.ts` → uses `GearApiService`
- `marketplace/provider-add-product/provider-add-product.component.ts` → uses `GearApiService`
- `marketplace/provider-edit-product/provider-edit-product.component.ts` → uses `GearApiService`
- `marketplace/provider-rentals/provider-rentals.component.ts` → uses `RentalApiService`

---

## Proposed Changes

### Backend — New Files

---

#### [NEW] GearAnalyticsResponse.java
- **Path**: `backend/src/main/java/com/campconnect/gear/dto/GearAnalyticsResponse.java`
- **Package**: `com.campconnect.gear.dto`
- **Pattern**: Follow "Backend DTO Class Pattern" from PATTERNS.md
- **Purpose**: Response for provider product analytics
- **Fields**: `String gearId`, `String gearName`, `long totalRentals`, `long totalPurchases`, `BigDecimal totalRevenue`, `double averageRating`, `int activeRentals`, `int availableStock`

---

#### [NEW] ProviderStatsResponse.java
- **Path**: `backend/src/main/java/com/campconnect/gear/dto/ProviderStatsResponse.java`
- **Package**: `com.campconnect.gear.dto`
- **Purpose**: Aggregated stats for the provider dashboard
- **Fields**: `BigDecimal totalRevenue`, `long activeRentals`, `long pendingRequests`, `long totalProducts`, `double averageRating`

---

### Backend — Modified Files

---

#### [MODIFY] GearService.java
- **Path**: `backend/src/main/java/com/campconnect/gear/service/GearService.java`
- **What to ADD (do not modify existing methods)**:
  - `GearAnalyticsResponse getGearAnalytics(String gearId)` — queries RentalRepository and PurchaseRepository to count rentals/purchases for a specific gear item and compute revenue
  - `ProviderStatsResponse getProviderStats(String ownerId)` — queries across GearRepository, RentalRepository, PurchaseRepository to produce aggregated dashboard stats for the logged-in provider

---

#### [MODIFY] GearController.java
- **Path**: `backend/src/main/java/com/campconnect/gear/controller/GearController.java`
- **What to ADD (do not modify existing endpoints)**:
  - `GET /api/gear/{gearId}/analytics` → calls `gearService.getGearAnalytics(gearId)`, requires `EQUIPMENT_PROVIDER` or `ADMIN` role
  - `GET /api/gear/provider/stats` → calls `gearService.getProviderStats(userDetails.getId())`, requires `EQUIPMENT_PROVIDER` or `ADMIN` role

---

#### [MODIFY] PurchaseService.java
- **Path**: `backend/src/main/java/com/campconnect/gear/service/PurchaseService.java`
- **What to ADD**: After purchase is created in `create()` method, call `DeliveryService.create()` to auto-generate a delivery record:
  - Inject `DeliveryService` 
  - After `purchaseRepository.save(purchase)`, build a `DeliveryRequest` with `purchaseId = purchase.getId()`, a `mock-driver-purchase` driverId, the buyer's address (if available from profileDetails, else a placeholder), `scheduledDate = LocalDate.now().plusDays(3)`, `priority = NORMAL`
  - Call `deliveryService.create(deliveryRequest)` inside a try-catch (delivery creation failure should NOT fail the purchase — log the error and continue)

---

### Frontend — New Files

---

#### [NEW] provider-stats.model.ts
- **Path**: `angular-campconnect/src/app/features/marketplace/models/provider-stats.model.ts`
- **Contents**: TypeScript interfaces matching `GearAnalyticsResponse` and `ProviderStatsResponse`

---

### Frontend — Modified Files

---

#### [MODIFY] gear-api.service.ts
- **Path**: `angular-campconnect/src/app/features/gear/services/gear-api.service.ts`
- **What to ADD (do not modify existing methods)**:
  - `getGearAnalytics(gearId: string): Observable<GearAnalyticsResponse>` → `GET /api/gear/{gearId}/analytics`
  - `getProviderStats(): Observable<ProviderStatsResponse>` → `GET /api/gear/provider/stats`

---

#### [MODIFY] provider-dashboard.component.ts
- **Path**: `angular-campconnect/src/app/features/marketplace/provider-dashboard/provider-dashboard.component.ts`
- **What changes**: Remove ALL mock data arrays (`stats`, `topProducts`, `alerts`). Inject `GearApiService`. Call `getProviderStats()` and `getMyGear()` in `ngOnInit()` to populate the dashboard with real data. Keep alerts as static for now (no backend for alerts).

---

#### [MODIFY] provider-profile.component.ts
- **Path**: `angular-campconnect/src/app/features/marketplace/provider-profile/provider-profile.component.ts`
- **What changes**: Remove mock `products`, `rentals`, `reviews` arrays. Inject `GearApiService` and `RentalApiService`. Call `getMyGear()` to populate products list, `getAll()` to populate rentals. Keep reviews as static (no reviews backend). Load provider name from `UserApiService.getProfile()` (created in user-module tasks) or keep using `AuthService.getCurrentUser()`.

---

#### [MODIFY] provider-product-analytics.component.ts
- **Path**: `angular-campconnect/src/app/features/marketplace/provider-product-analytics/provider-product-analytics.component.ts`
- **What changes**: Remove ALL mock `analytics` data. Inject `GearApiService`. In `ngOnInit()`, after extracting `productId` from route params, call `getGearAnalytics(productId)` to populate real stats. Keep insights array as static (AI-generated insights would need a separate backend).

---

#### [MODIFY] camper-orders.component.ts
- **Path**: `angular-campconnect/src/app/features/marketplace/camper-orders/camper-orders.component.ts`
- **What changes**: Remove mock `orders` array. Inject `GearApiService`. In `ngOnInit()`, call `getMyPurchases()` to fetch real purchase history. Map `PurchaseResponse` items to the order card format used in the template.

---

#### [DELETE] gear.service.ts (mock)
- **Path**: `angular-campconnect/src/app/core/services/gear.service.ts`
- **Action**: Delete this file entirely. No imports reference it.

---

## Implementation Order
1. Backend DTOs (GearAnalyticsResponse, ProviderStatsResponse)
2. Backend GearService additions (analytics + provider stats methods)
3. Backend GearController additions (2 new endpoints)
4. Backend PurchaseService modification (purchase-to-delivery hook)
5. Frontend models (provider-stats.model.ts)
6. Frontend gear-api.service.ts additions (2 new methods)
7. Frontend provider-dashboard wiring
8. Frontend provider-product-analytics wiring
9. Frontend provider-profile wiring
10. Frontend camper-orders wiring
11. Delete mock gear.service.ts

---

## Verification Plan

### Build Verification
1. `cd backend && mvn clean compile` — zero errors
2. `cd angular-campconnect && ng build` — zero errors

### API Testing
1. Login as EQUIPMENT_PROVIDER user
2. Create some gear items, then create some rentals against them
3. Test `GET /api/gear/{gearId}/analytics` → should return real counts
4. Test `GET /api/gear/provider/stats` → should return aggregated data
5. Make a purchase → verify a delivery record is auto-created

### Frontend Testing
1. Login as provider, navigate to `/provider/dashboard` → should show real stats
2. Navigate to `/provider/products/{id}/analytics` → should show real analytics
3. Navigate to `/provider/profile` → should show real products list
4. Login as camper, navigate to `/orders` → should show real purchase history
