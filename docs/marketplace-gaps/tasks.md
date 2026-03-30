# Marketplace/Gear Module Gaps — Task List

## Pre-requisites
Before starting, read these files in order:
1. `CONSTITUTION.md` — rules and constraints
2. `PATTERNS.md` — code patterns to follow exactly
3. `docs/marketplace-gaps/plan.md` — full implementation plan
4. `docs/marketplace-gaps/api-contract.md` — new endpoint specs

---

## Task 1 — Backend: Analytics and Stats DTOs
**Dependencies**: None
**Files to create**:
- `backend/src/main/java/com/campconnect/gear/dto/GearAnalyticsResponse.java`
- `backend/src/main/java/com/campconnect/gear/dto/ProviderStatsResponse.java`

**Pattern**: Follow "Backend DTO Class Pattern" from PATTERNS.md.

**GearAnalyticsResponse.java**:
```java
package com.campconnect.gear.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Schema(description = "Analytics data for a gear item")
public class GearAnalyticsResponse {
    private String gearId;
    private String gearName;
    private long totalRentals;
    private long totalPurchases;
    private BigDecimal totalRevenue;
    private double averageRating;
    private int activeRentals;
    private int availableStock;
}
```

**ProviderStatsResponse.java**:
```java
package com.campconnect.gear.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Schema(description = "Aggregated dashboard stats for equipment provider")
public class ProviderStatsResponse {
    private BigDecimal totalRevenue;
    private long activeRentals;
    private long pendingRequests;
    private long totalProducts;
    private double averageRating;
}
```

**Expected outcome**: `mvn compile` succeeds.

---

## Task 2 — Backend: Add Repository Query Methods
**Dependencies**: None
**Files to modify**:
- `backend/src/main/java/com/campconnect/gear/repository/RentalRepository.java`
- `backend/src/main/java/com/campconnect/gear/repository/PurchaseRepository.java`

**What to ADD (do not remove existing methods)**:

In `RentalRepository.java`:
```java
long countByGearId(String gearId);
long countByGearIdAndStatusIn(String gearId, java.util.List<RentalStatus> statuses);
long countByGearIdInAndStatus(java.util.List<String> gearIds, RentalStatus status);
```

In `PurchaseRepository.java`:
```java
long countByGearId(String gearId);
java.util.List<Purchase> findByGearIdIn(java.util.List<String> gearIds);
```

These are Spring Data MongoDB derived query methods — no implementation needed, Spring auto-generates them from the method signature.

**Expected outcome**: `mvn compile` succeeds.

---

## Task 3 — Backend: GearService Analytics Methods
**Dependencies**: Task 1 (DTOs), Task 2 (repository methods)
**Files to modify**:
- `backend/src/main/java/com/campconnect/gear/service/GearService.java`

**What to ADD** (append these methods — do NOT modify existing methods):

```java
public GearAnalyticsResponse getGearAnalytics(String gearId) {
    Gear gear = gearRepository.findById(gearId)
            .filter(g -> !g.isDeleted())
            .orElseThrow(() -> new ResourceNotFoundException("Gear", "id", gearId));

    GearAnalyticsResponse resp = new GearAnalyticsResponse();
    resp.setGearId(gear.getId());
    resp.setGearName(gear.getName());
    resp.setTotalRentals(rentalRepository.countByGearId(gearId));
    resp.setTotalPurchases(purchaseRepository.countByGearId(gearId));

    // Revenue from purchases only (rentals don't store total price)
    List<Purchase> purchases = purchaseRepository.findByGearIdIn(List.of(gearId));
    BigDecimal revenue = purchases.stream()
            .map(Purchase::getTotalPrice)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    resp.setTotalRevenue(revenue);

    resp.setAverageRating(0.0); // No review system yet
    resp.setActiveRentals((int) rentalRepository.countByGearIdAndStatusIn(
            gearId, List.of(RentalStatus.ACTIVE, RentalStatus.APPROVED)));
    resp.setAvailableStock(gear.getQuantity());

    return resp;
}

public ProviderStatsResponse getProviderStats(String ownerId) {
    List<Gear> gearItems = gearRepository.findByOwnerIdAndDeletedFalse(ownerId);
    List<String> gearIds = gearItems.stream().map(Gear::getId).collect(Collectors.toList());

    ProviderStatsResponse resp = new ProviderStatsResponse();
    resp.setTotalProducts(gearItems.size());

    if (gearIds.isEmpty()) {
        resp.setTotalRevenue(BigDecimal.ZERO);
        resp.setActiveRentals(0);
        resp.setPendingRequests(0);
        resp.setAverageRating(0.0);
        return resp;
    }

    resp.setActiveRentals(rentalRepository.countByGearIdInAndStatus(gearIds, RentalStatus.ACTIVE));
    resp.setPendingRequests(rentalRepository.countByGearIdInAndStatus(gearIds, RentalStatus.PENDING));

    List<Purchase> allPurchases = purchaseRepository.findByGearIdIn(gearIds);
    BigDecimal revenue = allPurchases.stream()
            .map(Purchase::getTotalPrice)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    resp.setTotalRevenue(revenue);
    resp.setAverageRating(0.0);

    return resp;
}
```

**Important**: You may need to add the following imports and injections:
- Inject `RentalRepository rentalRepository` and `PurchaseRepository purchaseRepository` via the constructor (add to the existing `@RequiredArgsConstructor` fields)
- Import `java.util.Objects`, `java.util.List`, `java.util.stream.Collectors`
- Check if `gearRepository.findByOwnerIdAndDeletedFalse(ownerId)` exists. If not, add it to `GearRepository`:
  ```java
  List<Gear> findByOwnerIdAndDeletedFalse(String ownerId);
  ```

**Expected outcome**: `mvn compile` succeeds.

---

## Task 4 — Backend: GearController New Endpoints
**Dependencies**: Task 3
**Files to modify**:
- `backend/src/main/java/com/campconnect/gear/controller/GearController.java`

**What to ADD** (append these endpoints — do NOT modify existing ones):

```java
@GetMapping("/{gearId}/analytics")
@PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
@Operation(summary = "Get analytics for a gear item")
public ResponseEntity<GearAnalyticsResponse> getGearAnalytics(
        @PathVariable String gearId) {
    return ResponseEntity.ok(gearService.getGearAnalytics(gearId));
}

@GetMapping("/provider/stats")
@PreAuthorize("hasRole('EQUIPMENT_PROVIDER') or hasRole('ADMIN')")
@Operation(summary = "Get aggregated stats for provider dashboard")
public ResponseEntity<ProviderStatsResponse> getProviderStats(
        @AuthenticationPrincipal UserDetailsImpl userDetails) {
    return ResponseEntity.ok(gearService.getProviderStats(userDetails.getId()));
}
```

**Imports to add**: `GearAnalyticsResponse`, `ProviderStatsResponse`, `UserDetailsImpl`, `AuthenticationPrincipal`.

**Expected outcome**: Backend compiles. Test with curl:
```bash
# Login as equipment provider, then:
curl -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/gear/<gearId>/analytics
curl -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/gear/provider/stats
```

---

## Task 5 — Backend: Purchase-to-Delivery Integration
**Dependencies**: None (DeliveryService already supports purchaseId)
**Files to modify**:
- `backend/src/main/java/com/campconnect/gear/service/PurchaseService.java`

**What to change**:
1. Add `DeliveryService` to the constructor injection:
   ```java
   private final com.campconnect.delivery.service.DeliveryService deliveryService;
   ```
2. In the `create()` method, AFTER `purchaseRepository.save(purchase)` and BEFORE `return toResponse(...)`, add:
   ```java
   // Auto-create delivery for this purchase
   try {
       DeliveryRequest deliveryReq = new DeliveryRequest();
       deliveryReq.setPurchaseId(purchase.getId());
       deliveryReq.setDriverId("mock-driver-purchase");
       deliveryReq.setPickupAddress("ConnectCamp Warehouse");

       // Try to get buyer's location from profile
       String buyerAddress = "TBD - Please update delivery address";
       if (buyer.getProfileDetails() != null && buyer.getProfileDetails().containsKey("location")) {
           buyerAddress = buyer.getProfileDetails().get("location").toString();
       }
       deliveryReq.setDeliveryAddress(buyerAddress);
       deliveryReq.setScheduledDate(LocalDate.now().plusDays(3));
       deliveryReq.setPriority(com.campconnect.delivery.model.DeliveryPriority.NORMAL);

       deliveryService.create(deliveryReq);
   } catch (Exception e) {
       // Log but don't fail the purchase
       System.err.println("Auto-delivery creation failed for purchase " + purchase.getId() + ": " + e.getMessage());
   }
   ```

**Expected outcome**: When a purchase is made, a delivery record is also created. Check by making a purchase then calling `GET /api/deliveries`.

---

## Task 6 — Frontend: Provider Stats Model
**Dependencies**: None (can be done in parallel with backend tasks)
**Files to create**:
- `angular-campconnect/src/app/features/marketplace/models/provider-stats.model.ts`

```typescript
export interface GearAnalyticsResponse {
    gearId: string;
    gearName: string;
    totalRentals: number;
    totalPurchases: number;
    totalRevenue: number;
    averageRating: number;
    activeRentals: number;
    availableStock: number;
}

export interface ProviderStatsResponse {
    totalRevenue: number;
    activeRentals: number;
    pendingRequests: number;
    totalProducts: number;
    averageRating: number;
}
```

**Expected outcome**: `ng build` succeeds.

---

## Task 7 — Frontend: Add Methods to gear-api.service.ts
**Dependencies**: Task 6
**Files to modify**:
- `angular-campconnect/src/app/features/gear/services/gear-api.service.ts`

**What to ADD** (append — do NOT modify existing methods):
```typescript
import { GearAnalyticsResponse, ProviderStatsResponse } from '../../marketplace/models/provider-stats.model';

// ... inside the class, add:

getGearAnalytics(gearId: string): Observable<GearAnalyticsResponse> {
    return this.http.get<GearAnalyticsResponse>(`${this.base}/${gearId}/analytics`);
}

getProviderStats(): Observable<ProviderStatsResponse> {
    return this.http.get<ProviderStatsResponse>(`${this.base}/provider/stats`);
}
```

**Expected outcome**: `ng build` succeeds.

---

## Task 8 — Frontend: Wire provider-dashboard.component.ts
**Dependencies**: Task 7
**Files to modify**:
- `angular-campconnect/src/app/features/marketplace/provider-dashboard/provider-dashboard.component.ts`

**What to change**:
1. Add imports: `GearApiService`, `ProviderStatsResponse`, `GearResponse`, `OnInit`
2. Inject `GearApiService` in constructor
3. Replace mock `stats` object with:
   ```typescript
   stats: ProviderStatsResponse = { totalRevenue: 0, activeRentals: 0, pendingRequests: 0, totalProducts: 0, averageRating: 0 };
   loading = true;
   ```
4. Replace mock `topProducts` array with:
   ```typescript
   topProducts: any[] = [];
   ```
5. In `ngOnInit()`:
   ```typescript
   this.gearApi.getProviderStats().subscribe({
       next: (data) => { this.stats = data; this.loading = false; },
       error: () => { this.loading = false; }
   });
   this.gearApi.getMyGear({ size: 5, sort: 'createdAt,desc' }).subscribe({
       next: (page) => {
           this.topProducts = page.content.map(g => ({
               id: g.id,
               name: g.name,
               category: g.category,
               rentals: 0,
               revenue: 0,
               rating: 0,
               icon: this.icons.Tent
           }));
       }
   });
   ```
6. Keep `alerts` array as static (no backend for alerts)

**Do NOT modify**: HTML template or SCSS — only the `.ts` file

**Expected outcome**: Dashboard displays real product count, real revenue (may be 0 if no purchases exist). `ng build` succeeds.

---

## Task 9 — Frontend: Wire provider-product-analytics.component.ts
**Dependencies**: Task 7
**Files to modify**:
- `angular-campconnect/src/app/features/marketplace/provider-product-analytics/provider-product-analytics.component.ts`

**What to change**:
1. Add imports: `GearApiService`, `GearAnalyticsResponse`
2. Inject `GearApiService` in constructor
3. Replace the mock `analytics` object with:
   ```typescript
   analytics: GearAnalyticsResponse | null = null;
   loading = true;
   error: string | null = null;
   ```
4. Rewrite `ngOnInit()`:
   ```typescript
   this.route.paramMap.subscribe(params => {
       this.productId = params.get('id') || '';
       if (this.productId) {
           this.gearApi.getGearAnalytics(this.productId).subscribe({
               next: (data) => { this.analytics = data; this.loading = false; },
               error: (err) => {
                   this.error = 'Failed to load analytics.';
                   this.loading = false;
               }
           });
       }
   });
   ```
5. Keep separate static arrays for `rentalsTrend`, `ratingBreakdown`, `insights` — these can remain hardcoded since the backend does not provide time-series or AI-generated insight data
6. Update the template bindings: `analytics.totalRentals`, `analytics.totalRevenue`, etc. → `analytics?.totalRentals`, `analytics?.totalRevenue` (add null safety)

**Note**: The HTML template WILL need minor updates to handle the new nullable `analytics` property (add `*ngIf="analytics"` around the stats section and an `*ngIf="loading"` spinner). This is acceptable because it's just adding null guards, not changing the layout.

**Expected outcome**: Analytics page shows real rental/purchase counts for the selected gear item.

---

## Task 10 — Frontend: Wire provider-profile.component.ts
**Dependencies**: Task 7
**Files to modify**:
- `angular-campconnect/src/app/features/marketplace/provider-profile/provider-profile.component.ts`

**What to change**:
1. Add imports: `GearApiService`, `RentalApiService`, `GearResponse`
2. Inject `GearApiService` and `RentalApiService` in constructor
3. Add `loading = true;`
4. Replace mock `products` array with real data:
   ```typescript
   products: any[] = [];
   // In ngOnInit():
   this.gearApi.getMyGear({ size: 50 }).subscribe({
       next: (page) => {
           this.products = page.content.map(g => ({
               id: g.id,
               name: g.name,
               category: g.category,
               pricePerDay: g.price,
               available: g.quantity,
               icon: '📦',
               rentals: 0
           }));
           this.loading = false;
       }
   });
   ```
5. Keep mock `reviews`, `ratingBreakdown` as static (no review backend)
6. Replace mock `rentals` with a real call to `RentalApiService.getAll()`:
   ```typescript
   this.rentalApi.getAll(0, 10).subscribe({
       next: (page) => {
           this.rentals = page.content.map(r => ({
               id: r.id,
               customer: r.renterName,
               customerInitials: r.renterName.split(' ').map((n: string) => n[0]).join(''),
               customerEmail: '',
               product: r.gearName,
               dates: `${r.startDate} – ${r.endDate}`,
               total: 0,
               status: r.status === 'ACTIVE' ? 'Active' : r.status === 'PENDING' ? 'Pending' : 'Completed',
               avatarColor: '#8B7355'
           }));
       }
   });
   ```
7. Keep `providerName` loading from `AuthService` (current behavior is fine)
8. Update mock `stats` with real computation from loaded data

**Expected outcome**: Provider profile shows real products and real rentals. Reviews remain static.

---

## Task 11 — Frontend: Wire camper-orders.component.ts
**Dependencies**: None (uses existing `getMyPurchases()` from gear-api.service.ts)
**Files to modify**:
- `angular-campconnect/src/app/features/marketplace/camper-orders/camper-orders.component.ts`

**What to change**:
1. Add imports: `GearApiService`, `PurchaseResponse`, `PagedResponse` from gear models
2. Inject `GearApiService` in constructor
3. Add `loading = true; error: string | null = null;`
4. Replace the hardcoded `orders` array with dynamic data:
   ```typescript
   orders: any[] = [];

   ngOnInit(): void {
       this.gearApi.getMyPurchases(0, 20).subscribe({
           next: (page) => {
               this.orders = page.content.map(p => ({
                   id: p.id,
                   date: new Date(p.purchaseDate || p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                   status: p.status === 'CONFIRMED' ? 'delivered' : p.status === 'PENDING' ? 'preparing' : 'cancelled',
                   statusLabel: p.status === 'CONFIRMED' ? 'Delivered' : p.status === 'PENDING' ? 'Preparing' : 'Cancelled',
                   totalAmount: p.totalPrice,
                   rentalDuration: '',
                   eta: '',
                   progress: p.status === 'CONFIRMED' ? 100 : p.status === 'PENDING' ? 25 : 0,
                   items: [{ name: p.gearName, icon: 'gear' }]
               }));
               this.filteredOrders = this.orders;
               this.loading = false;
               this.applyFilter(this.currentFilter);
           },
           error: () => {
               this.error = 'Failed to load orders.';
               this.loading = false;
           }
       });
   }
   ```

**Expected outcome**: Orders page shows real purchase history. `ng build` succeeds.

---

## Task 12 — Delete Mock gear.service.ts
**Dependencies**: ALL above tasks complete
**Files to delete**:
- `angular-campconnect/src/app/core/services/gear.service.ts`

**Pre-check**: Run this grep to confirm no imports exist:
```bash
grep -r "core/services/gear.service" angular-campconnect/src/app/ --include="*.ts"
grep -r "GearService" angular-campconnect/src/app/ --include="*.ts"
```

The first grep should return NO results.
The second grep should ONLY return `gear.service.ts` itself and `gear-api.service.ts`.

**Action**: Delete the file.

**Post-check**: `ng build` must succeed with zero errors.

---

## Final Verification

After all 12 tasks are complete:

1. `cd backend && mvn clean compile` — zero errors
2. `cd angular-campconnect && ng build` — zero errors
3. Test: Login as provider → `/provider/dashboard` → real product count
4. Test: Navigate to product analytics → real rental/purchase counts
5. Test: Make a purchase as camper → delivery auto-created
6. Test: `/orders` page shows real purchase history
7. Confirm `core/services/gear.service.ts` no longer exists
