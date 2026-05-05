# Delivery Module — New API Endpoints

Only NEW endpoints are documented here. Existing delivery and vehicle
endpoints are already documented in Swagger at http://localhost:8081/swagger-ui.html.

Base URL: `http://localhost:8081/api`

---

## GET /api/deliveries/earnings

**Description**: Calculate earnings summary for the authenticated delivery provider.

**Authentication**: Required
**Roles**: `ROLE_DELIVERY_PROVIDER` or `ROLE_ADMIN`

**Request**:
```
GET /api/deliveries/earnings
Authorization: Bearer <jwt_token>
```

**No request body or query parameters.**

**Success Response (200 OK)**:
```json
{
  "totalEarnings": 510.00,
  "weeklyEarnings": 120.00,
  "monthlyEarnings": 390.00,
  "deliveriesCompleted": 34,
  "averagePerDelivery": 15.00,
  "dailyBreakdown": [
    { "date": "2026-03-25", "amount": 45.00, "count": 3 },
    { "date": "2026-03-24", "amount": 30.00, "count": 2 },
    { "date": "2026-03-23", "amount": 60.00, "count": 4 }
  ]
}
```

**Field types**:
| Field | Java Type | JSON Type | Notes |
|-------|-----------|-----------|-------|
| totalEarnings | BigDecimal | number | Sum of all completed deliveries × flat rate |
| weeklyEarnings | BigDecimal | number | Last 7 days |
| monthlyEarnings | BigDecimal | number | Last 30 days |
| deliveriesCompleted | long | number | Count of DELIVERED status |
| averagePerDelivery | BigDecimal | number | totalEarnings / deliveriesCompleted |
| dailyBreakdown | List\<DailyEarning\> | array | Grouped by date, most recent first |

**DailyEarning fields**:
| Field | Java Type | JSON Type |
|-------|-----------|-----------|
| date | String | string (YYYY-MM-DD) |
| amount | BigDecimal | number |
| count | int | number |

**Earnings calculation logic**:
Since the `Delivery` model does NOT store monetary amounts, earnings
are calculated using a flat-rate formula:
- **Base rate**: $15.00 per completed delivery
- **Total** = count of DELIVERED deliveries × $15.00
- The rate can be made configurable later

**How to compute**:
1. Query `deliveryRepository.findByDriverIdAndStatusAndDeletedFalse(driverId, DeliveryStatus.DELIVERED)` to get all completed deliveries
2. Count them → `deliveriesCompleted`
3. `totalEarnings = deliveriesCompleted × 15.00`
4. For `weeklyEarnings`: filter deliveries where `deliveredDate >= now - 7 days`
5. For `monthlyEarnings`: filter deliveries where `deliveredDate >= now - 30 days`
6. `averagePerDelivery = totalEarnings / deliveriesCompleted` (or 0 if none)
7. Group ALL deliveries by `deliveredDate` (date part only) → build `dailyBreakdown` sorted descending

**Error Responses**:
- `401 Unauthorized` — missing or invalid JWT
- `403 Forbidden` — user does not have DELIVERY_PROVIDER role

**Note**: This endpoint returns $0 / 0 deliveries if the user has no completed deliveries. It does NOT fail — it returns an empty/zero response.

---

## No Other New Endpoints Needed

The existing endpoints cover all other delivery needs:

| Existing Endpoint | Used By |
|-------------------|---------|
| `GET /api/deliveries` | delivery-dashboard |
| `GET /api/deliveries/my-deliveries` | delivery-earnings, delivery-history (after wiring) |
| `GET /api/deliveries/{id}` | delivery-details, delivery-tracking |
| `GET /api/deliveries/date-range` | Available for date filtering |
| `PATCH /api/deliveries/{id}/status` | delivery-details (advance status) |
| `GET /api/vehicles` | delivery-vehicles |
| All vehicle CRUD | delivery-vehicles |

**delivery-history** will use the existing `GET /api/deliveries/my-deliveries` endpoint with filtering applied client-side — no new backend endpoint needed.
