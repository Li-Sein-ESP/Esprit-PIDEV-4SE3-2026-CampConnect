# Delivery Module Gaps — Task List

## Pre-requisites
Before starting, read these files in order:
1. `CONSTITUTION.md` — rules and constraints
2. `PATTERNS.md` — code patterns to follow exactly
3. `docs/delivery-gaps/plan.md` — full implementation plan with audit results
4. `docs/delivery-gaps/api-contract.md` — new endpoint specs

---

## Task 1 — Verify Audit Results
**Dependencies**: None
**Purpose**: Confirm the audit results from `plan.md` are still accurate.

Open each file listed below and verify the status documented in the plan:

| Component | File | Expected Status |
|-----------|------|-----------------|
| delivery-dashboard | `angular-campconnect/src/app/features/delivery/delivery-dashboard/delivery-dashboard.component.ts` | ✅ REAL — uses `DeliveryApiService` |
| delivery-vehicles | `angular-campconnect/src/app/features/delivery/delivery-vehicles/delivery-vehicles.component.ts` | ✅ REAL — uses `VehicleApiService` |
| delivery-details | `angular-campconnect/src/app/features/delivery/delivery-details/delivery-details.component.ts` | ✅ REAL — uses `DeliveryApiService.getById()` |
| delivery-tracking | `angular-campconnect/src/app/features/delivery/delivery-tracking/delivery-tracking.component.ts` | ⚠️ PARTIAL — calls API once, no polling |
| delivery-earnings | `angular-campconnect/src/app/features/delivery/delivery-earnings/delivery-earnings.component.ts` | ⚠️ HYBRID — calls API but calculates fake earnings |
| delivery-history | `angular-campconnect/src/app/features/delivery/delivery-history/delivery-history.component.ts` | ❌ MOCK — 100% hardcoded, no API calls |

If any status has changed (e.g., someone already wired a component), skip the corresponding wiring task.

**Expected outcome**: Documented understanding of current state matches or doesn't. Adjust remaining tasks accordingly.

---

## Task 2 — Backend: Earnings DTO
**Dependencies**: None
**Files to create**:
- `backend/src/main/java/com/campconnect/delivery/dto/EarningsResponse.java`

**Pattern**: Follow "Backend DTO Class Pattern" from PATTERNS.md.

```java
package com.campconnect.delivery.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Schema(description = "Delivery earnings summary for a driver")
public class EarningsResponse {
    private BigDecimal totalEarnings;
    private BigDecimal weeklyEarnings;
    private BigDecimal monthlyEarnings;
    private long deliveriesCompleted;
    private BigDecimal averagePerDelivery;
    private List<DailyEarning> dailyBreakdown;

    @Data
    public static class DailyEarning {
        private String date;
        private BigDecimal amount;
        private int count;

        public DailyEarning(String date, BigDecimal amount, int count) {
            this.date = date;
            this.amount = amount;
            this.count = count;
        }
    }
}
```

**Expected outcome**: `mvn compile` succeeds.

---

## Task 3 — Backend: Add Repository Method
**Dependencies**: None
**Files to modify**:
- `backend/src/main/java/com/campconnect/delivery/repository/DeliveryRepository.java`

**What to ADD** (do not remove existing methods):
```java
java.util.List<Delivery> findByDriverIdAndStatusAndDeletedFalse(String driverId, DeliveryStatus status);
```

This is a Spring Data derived query — no implementation needed.

**Expected outcome**: `mvn compile` succeeds.

---

## Task 4 — Backend: Earnings Calculation in DeliveryService
**Dependencies**: Task 2 (DTO), Task 3 (repository method)
**Files to modify**:
- `backend/src/main/java/com/campconnect/delivery/service/DeliveryService.java`

**What to ADD** (append — do NOT modify existing methods):

```java
private static final BigDecimal FLAT_RATE = new BigDecimal("15.00");

public EarningsResponse calculateEarnings(String driverId) {
    List<Delivery> completed = deliveryRepository
            .findByDriverIdAndStatusAndDeletedFalse(driverId, DeliveryStatus.DELIVERED);

    EarningsResponse resp = new EarningsResponse();
    long count = completed.size();
    resp.setDeliveriesCompleted(count);

    BigDecimal total = FLAT_RATE.multiply(BigDecimal.valueOf(count));
    resp.setTotalEarnings(total);
    resp.setAveragePerDelivery(count > 0 ? FLAT_RATE : BigDecimal.ZERO);

    LocalDateTime now = LocalDateTime.now();
    LocalDateTime oneWeekAgo = now.minusDays(7);
    LocalDateTime oneMonthAgo = now.minusDays(30);

    long weeklyCount = completed.stream()
            .filter(d -> d.getDeliveredDate() != null && d.getDeliveredDate().isAfter(oneWeekAgo))
            .count();
    long monthlyCount = completed.stream()
            .filter(d -> d.getDeliveredDate() != null && d.getDeliveredDate().isAfter(oneMonthAgo))
            .count();

    resp.setWeeklyEarnings(FLAT_RATE.multiply(BigDecimal.valueOf(weeklyCount)));
    resp.setMonthlyEarnings(FLAT_RATE.multiply(BigDecimal.valueOf(monthlyCount)));

    // Build daily breakdown
    Map<String, Long> dailyCounts = completed.stream()
            .filter(d -> d.getDeliveredDate() != null)
            .collect(Collectors.groupingBy(
                    d -> d.getDeliveredDate().toLocalDate().toString(),
                    Collectors.counting()
            ));

    List<EarningsResponse.DailyEarning> breakdown = dailyCounts.entrySet().stream()
            .map(e -> new EarningsResponse.DailyEarning(
                    e.getKey(),
                    FLAT_RATE.multiply(BigDecimal.valueOf(e.getValue())),
                    e.getValue().intValue()
            ))
            .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
            .collect(Collectors.toList());

    resp.setDailyBreakdown(breakdown);
    return resp;
}
```

**Imports to add**: `java.util.Map`, `java.util.stream.Collectors`, `java.math.BigDecimal`, `java.time.LocalDateTime`, `java.util.List`, `EarningsResponse`

**Expected outcome**: `mvn compile` succeeds.

---

## Task 5 — Backend: Earnings Endpoint in DeliveryController
**Dependencies**: Task 4
**Files to modify**:
- `backend/src/main/java/com/campconnect/delivery/controller/DeliveryController.java`

**What to ADD** (append — do NOT modify existing endpoints):

```java
@GetMapping("/earnings")
@PreAuthorize("hasRole('DELIVERY_PROVIDER') or hasRole('ADMIN')")
@Operation(summary = "Get earnings summary for current driver")
public ResponseEntity<EarningsResponse> getEarnings(
        @AuthenticationPrincipal UserDetailsImpl userDetails) {
    return ResponseEntity.ok(deliveryService.calculateEarnings(userDetails.getId()));
}
```

**Imports to add**: `EarningsResponse`, `UserDetailsImpl`, `AuthenticationPrincipal`

**Important**: Make sure this endpoint is placed BEFORE any `@GetMapping("/{id}")` methods in the controller, since Spring would otherwise match `/earnings` as `/{id}`. If the controller already has proper ordering or uses specific path patterns, this may not be an issue — verify by testing.

**Verification**:
```bash
curl -H "Authorization: Bearer $TOKEN" http://localhost:8081/api/deliveries/earnings
```

**Expected outcome**: Returns `200 OK` with earnings JSON. If no deliveries exist, returns zero values.

---

## Task 6 — Frontend: Add Earnings Method to delivery-api.service.ts
**Dependencies**: Task 5 (backend endpoint must exist)
**Files to modify**:
- `angular-campconnect/src/app/features/delivery/services/delivery-api.service.ts`

**What to ADD**:

After the existing interfaces, add:
```typescript
export interface DailyEarning {
    date: string;
    amount: number;
    count: number;
}

export interface EarningsResponse {
    totalEarnings: number;
    weeklyEarnings: number;
    monthlyEarnings: number;
    deliveriesCompleted: number;
    averagePerDelivery: number;
    dailyBreakdown: DailyEarning[];
}
```

Inside the `DeliveryApiService` class, add:
```typescript
/**
 * GET /api/deliveries/earnings  (DELIVERY_PROVIDER)
 */
getEarnings(): Observable<EarningsResponse> {
    return this.http.get<EarningsResponse>(`${this.base}/earnings`);
}
```

**Expected outcome**: `ng build` succeeds.

---

## Task 7 — Frontend: Wire delivery-history.component.ts
**Dependencies**: None (uses existing `getMyDeliveries()` from delivery-api.service.ts)
**Files to modify**:
- `angular-campconnect/src/app/features/delivery/delivery-history/delivery-history.component.ts`

**What to change**:
1. Add import: `DeliveryApiService, DeliveryResponse` from `../services/delivery-api.service`
2. Inject `private deliveryApi: DeliveryApiService` in constructor
3. Add `loading = true; error: string | null = null;`
4. Replace hardcoded `history` array:
   ```typescript
   history: DeliveryHistory[] = [];
   ```
5. Rewrite `ngOnInit()`:
   ```typescript
   ngOnInit(): void {
       this.loading = true;
       this.deliveryApi.getMyDeliveries(0, 50).subscribe({
           next: (page) => {
               this.history = page.content
                   .filter(d => d.status === 'DELIVERED' || d.status === 'CANCELLED' || d.status === 'FAILED')
                   .map((d, i) => this.mapToHistory(d));
               this.loading = false;
               this.applyFilters();
           },
           error: () => {
               this.error = 'Failed to load delivery history.';
               this.loading = false;
           }
       });
   }
   ```
6. Add mapping method:
   ```typescript
   private mapToHistory(d: DeliveryResponse): DeliveryHistory {
       const name = d.driverName || 'Unknown';
       const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
       const date = d.deliveredDate
           ? new Date(d.deliveredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
           : d.scheduledDate;

       return {
           id: '#' + d.id.substring(0, 12),
           orderId: d.rentalId || d.purchaseId || '—',
           customerName: d.deliveryAddress.substring(0, 20),
           customerInitials: d.deliveryAddress.substring(0, 2).toUpperCase(),
           date,
           distanceKm: 0, // No distance data in Delivery model
           vehicleType: 'Van', // No vehicle type in Delivery model
           earnings: 15.00, // Flat rate
           rating: null, // No rating system yet
           status: d.status as 'COMPLETED' | 'CANCELLED' | 'FAILED'
       };
   }
   ```
   **Note**: Map `DELIVERED` status to `COMPLETED` in the mapping since the UI interface uses `COMPLETED`:
   ```typescript
   status: d.status === 'DELIVERED' ? 'COMPLETED' : d.status as 'CANCELLED' | 'FAILED'
   ```

**Do NOT modify**: `delivery-history.component.html` or `.scss`

**Expected outcome**: History page shows real delivery records. `ng build` succeeds.

---

## Task 8 — Frontend: Wire delivery-earnings.component.ts
**Dependencies**: Task 6 (Earnings API method must exist)
**Files to modify**:
- `angular-campconnect/src/app/features/delivery/delivery-earnings/delivery-earnings.component.ts`

**What to change**:
1. Import `EarningsResponse` from the service
2. Replace `loadRealData()` method:
   ```typescript
   loadRealData(): void {
       this.deliveryApi.getEarnings().subscribe({
           next: (data: EarningsResponse) => {
               this.earnings.total = data.totalEarnings;
               this.earnings.weekly = data.weeklyEarnings;
               this.earnings.monthly = data.monthlyEarnings;
               this.earnings.deliveriesCompleted = data.deliveriesCompleted;

               // Build recent payments from daily breakdown
               if (data.dailyBreakdown && data.dailyBreakdown.length > 0) {
                   this.earnings.recentPayments = data.dailyBreakdown.map((day, i) => ({
                       id: `DL-${i + 1}`,
                       date: day.date,
                       zone: 'Zone',
                       vehicle: i % 2 === 0 ? 'van' : '4x4' as any,
                       distance: 0,
                       duration: '—',
                       amount: day.amount,
                       status: 'completed' as any,
                       rating: null,
                       customer: `${day.count} deliveries`
                   }));
               }

               this.generateMockChartData();
               this.filteredPayments = [...this.earnings.recentPayments];
               this.loading = false;
               setTimeout(() => this.drawCharts(), 100);
           },
           error: () => {
               this.loadMockData(); // fallback
           }
       });
   }
   ```
3. Remove `processRealEarnings()` method (replaced by the above)
4. Keep `loadMockData()` as fallback
5. Keep all chart drawing methods unchanged

**Do NOT modify**: HTML template or SCSS

**Expected outcome**: Earnings page shows real earnings from the backend endpoint. `ng build` succeeds.

---

## Task 9 — Frontend: Add Polling to delivery-tracking.component.ts
**Dependencies**: None (uses existing `DeliveryApiService.getById()`)
**Files to modify**:
- `angular-campconnect/src/app/features/delivery/delivery-tracking/delivery-tracking.component.ts`

**What to change**:
1. Add a `pollInterval: any;` property
2. Remove the mock bypass on line 69:
   ```typescript
   // REMOVE this line:
   if (id === 'CC-48291') return; // default mock bypass
   ```
3. After the initial `loadDeliveryStatus()` call in `ngOnInit()`, add polling:
   ```typescript
   // Poll every 15 seconds for live updates
   if (isPlatformBrowser(this.platformId)) {
       this.pollInterval = setInterval(() => {
           if (this.orderId && this.delivery.status !== 'DELIVERED') {
               this.loadDeliveryStatus(this.orderId);
           }
       }, 15000);
   }
   ```
4. In `ngOnDestroy()`, clear the poll interval:
   ```typescript
   ngOnDestroy() {
       if (this.etaInterval) clearInterval(this.etaInterval);
       if (this.pollInterval) clearInterval(this.pollInterval);
   }
   ```
5. In `loadDeliveryStatus()`, when status is DELIVERED, stop polling:
   ```typescript
   if (data.status === 'DELIVERED') {
       // ... existing ETA reset code ...
       if (this.pollInterval) clearInterval(this.pollInterval);
   }
   ```

**Do NOT modify**: HTML template or SCSS

**Expected outcome**: Tracking page refreshes delivery status every 15 seconds. Polling stops when delivered.

---

## Cross-Module Note: Purchase-to-Delivery

The purchase-to-delivery integration is handled entirely in `docs/marketplace-gaps/tasks.md` (Task 5). It modifies `PurchaseService.create()` to call `DeliveryService.create()`. **No changes to the delivery module are needed for this integration.**

---

## Final Verification

After all 9 tasks are complete:

1. `cd backend && mvn clean compile` — zero errors
2. `cd angular-campconnect && ng build` — zero errors
3. Test: Login as delivery provider → `/delivery/earnings` shows calculated earnings
4. Test: `/delivery/history` shows real completed deliveries
5. Test: `/delivery/tracking/{id}` auto-refreshes every 15 seconds
6. Test: `/delivery/dashboard` still works (no regressions)
7. Test: `/delivery/vehicles` still works (no regressions)
