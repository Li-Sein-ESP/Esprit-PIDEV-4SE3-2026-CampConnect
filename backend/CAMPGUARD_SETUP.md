# CampGuard Setup and Test Guide

This guide explains how to run and validate the CampGuard backend endpoints and admin dashboard integration.

## 1) Required CSV files

Place these files in `backend/` by default (or set paths via env vars):

- `campguard_predictions.csv`
- `campaign_queue_antispam.csv`
- `campaign_history.csv`

Default keys are configured in `backend/src/main/resources/application.properties`.

## 2) Optional environment variables

You can override file locations and CampGuard behavior:

```properties
CAMPGUARD_PREDICTIONS_PATH=campguard_predictions.csv
CAMPGUARD_QUEUE_PATH=campaign_queue_antispam.csv
CAMPGUARD_HISTORY_PATH=campaign_history.csv
CAMPGUARD_ANTISPAM_DAYS=7
CAMPGUARD_SCHEDULER_ENABLED=false
CAMPGUARD_SCHEDULER_CRON=0 0 2 * * ?
```

## 3) Run backend

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend base URL: `http://localhost:8090`

## 4) Authenticate as admin

```http
POST /api/auth/signin
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

Copy the `token` from response and use it in `Authorization: Bearer <token>`.

## 5) CampGuard endpoints

- `GET /api/churn/at-risk-users?level=High|Medium|Low&search=...`
- `POST /api/churn/trigger-actions`
- `GET /api/churn/kpis`

All require `ROLE_ADMIN`.

## 6) Postman

Import these files:

- `backend/postman/CampGuard.postman_collection.json`
- `backend/postman/CampGuard.Local.postman_environment.json`

Set `jwtToken` in environment and call endpoints in order:

1. `CampGuard - Get KPIs`
2. `CampGuard - Get At Risk Users`
3. `CampGuard - Trigger Actions`

## 7) Anti-spam validation (recommended)

Run `POST /api/churn/trigger-actions` twice on the same day:

- First run should queue users.
- Second run should return `skippedAntiSpam > 0`.

## 8) Scheduler

Scheduler class: `backend/src/main/java/com/campconnect/scheduler/CampGuardScheduler.java`

To enable daily trigger:

```properties
CAMPGUARD_SCHEDULER_ENABLED=true
```

## 9) Frontend integration

Admin analytics page consumes CampGuard APIs:

- `angular-campconnect/src/app/features/admin/admin-analytics/admin-analytics.component.ts`
- `angular-campconnect/src/app/features/admin/admin-analytics/admin-analytics.component.html`
- `angular-campconnect/src/app/features/admin/services/campguard.service.ts`
