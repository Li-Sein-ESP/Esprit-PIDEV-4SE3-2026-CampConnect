# CampConnect

A comprehensive camping and outdoor adventure platform that connects camping enthusiasts with campsites, gear, knowledge, and community.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Configuration](#configuration)
- [Docker Deployment](#docker-deployment)
- [CI/CD](#cicd)
- [API Documentation](#api-documentation)

## Features

### Core Features
- **Campsite Discovery & Booking** - Search, filter, and book campsites with real-time availability
- **Trip Planning** - Create itineraries, manage packing lists, and budget estimation
- **Camping Academy** - Educational content, expert videos, and certification programs
- **Gear Marketplace** - Buy, rent, and review camping equipment with ML-powered demand prediction
- **Community Hub** - Forums, group chats, and social features for campers
- **Safety & Compliance** - Emergency check-ins, safety alerts, incident reporting
- **Transportation** - Route planning with OpenRouteService integration
- **Events** - Discover and join camping events and gatherings
- **ML Gear Recommendation** - Personalized gear suggestions based on trip details

### User Roles
- **Campers** - Regular users booking sites and planning trips
- **Providers** - Campsite owners managing bookings and availability
- **Gear Vendors** - Sellers managing inventory and deliveries
- **Experts** - Content creators sharing knowledge and certifications
- **Admins** - Platform management and moderation

## Tech Stack

### Frontend
- **Framework**: Angular 21
- **Styling**: Tailwind CSS
- **Icons**: Lucide Angular
- **State Management**: RxJS
- **Maps**: Leaflet
- **Calendar**: FullCalendar
- **Payments**: Stripe

### Backend
- **Framework**: Spring Boot 3.2.3
- **Language**: Java 17
- **Database**: MongoDB
- **Security**: Spring Security + JWT
- **Build Tool**: Maven
- **Payments**: Stripe API
- **Mapping**: OpenRouteService

### ML Services
- **Gear Recommendation**: Flask + scikit-learn (port 5001)
- **Marketplace Demand Prediction**: Flask + scikit-learn (port 5000)

## Project Structure

```
CampConnect/
├── .github/workflows/            # CI/CD pipelines (GitHub Actions)
│   ├── ci.yml                    # Combined CI pipeline
│   ├── backend.yml               # Backend build, test & Docker
│   └── frontend.yml              # Frontend build, test & Docker
│
├── angular-campconnect/          # Frontend Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/             # Services, guards, interceptors
│   │   │   ├── features/         # Feature modules (auth, bookings, trips, etc.)
│   │   │   └── shared/           # Shared components & utilities
│   │   ├── environments/         # Environment configs (dev/prod)
│   │   └── styles/               # Global styles
│   ├── Dockerfile                # Multi-stage build (Node + Nginx)
│   ├── nginx.conf                # Nginx config for SPA routing
│   ├── angular.json
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/                      # Spring Boot backend
│   ├── src/main/
│   │   ├── java/com/campconnect/
│   │   │   ├── config/           # Security, WebSocket, Stripe, Swagger
│   │   │   ├── controller/       # REST controllers
│   │   │   ├── model/            # MongoDB document models
│   │   │   ├── dto/              # Data Transfer Objects
│   │   │   ├── repository/       # MongoDB repositories
│   │   │   ├── service/          # Business logic
│   │   │   └── academy/          # Academy module (courses, certs, badges)
│   │   └── resources/
│   │       └── application.properties
│   ├── Dockerfile                # Multi-stage build (Maven + JRE)
│   └── pom.xml
│
├── ML/                           # Gear Recommendation ML service
│   ├── gear_rec_app.py           # Flask API (port 5001)
│   ├── *.pkl                     # Trained model & encoders
│   └── requirements.txt
│
├── Marketplace_ML/               # Demand Prediction ML service
│   ├── app.py                    # Flask API (port 5000)
│   ├── *.pkl                     # Trained model & encoders
│   └── requirements.txt
│
├── docker-compose.yml            # Full-stack local deployment
├── .env.example                  # Environment variable template
├── .gitignore
└── README.md
```

## Prerequisites

- **Node.js** 22.x or higher + npm
- **Java** JDK 17 or higher
- **Maven** 3.8 or higher
- **MongoDB** 6.0 or higher
- **Python** 3.10+ (for ML services)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/CampConnect.git
cd CampConnect
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your actual API keys and secrets
```

### 3. Frontend Setup
```bash
cd angular-campconnect
npm install
```

### 4. Backend Setup
```bash
cd backend
./mvnw clean install -DskipTests
```

### 5. ML Services Setup
```bash
# Gear Recommendation
cd ML
pip install -r requirements.txt

# Marketplace Demand Prediction
cd ../Marketplace_ML
pip install -r requirements.txt
```

## Running the Application

### Start MongoDB
```bash
mongod
```

### Run Backend (port 8090)
```bash
cd backend
./mvnw spring-boot:run
```

### Run Frontend (port 4200)
```bash
cd angular-campconnect
npm start
```

### Run ML Services
```bash
# Terminal 1 - Demand Prediction (port 5000)
cd Marketplace_ML
python app.py

# Terminal 2 - Gear Recommendation (port 5001)
cd ML
python gear_rec_app.py
```

### Access Points
| Service              | URL                        |
|----------------------|----------------------------|
| Frontend             | http://localhost:4200       |
| Backend API          | http://localhost:8090/api   |
| Swagger Docs         | http://localhost:8090/swagger-ui.html |
| ML Demand API        | http://localhost:5000       |
| ML Gear API          | http://localhost:5001       |

## Configuration

All secrets are externalized via environment variables. See `.env.example` for the full list.

### Key Environment Variables
| Variable             | Description                          | Default                              |
|----------------------|--------------------------------------|--------------------------------------|
| `MONGODB_URI`        | MongoDB connection string            | `mongodb://localhost:27017/campconnectdb` |
| `JWT_SECRET`         | JWT signing secret                   | (required)                           |
| `STRIPE_SECRET_KEY`  | Stripe secret API key                | (required for payments)              |
| `ORS_API_KEY`        | OpenRouteService API key             | (required for route planning)        |
| `OPENAI_API_KEY`     | OpenAI API key                       | (optional)                           |
| `SERVER_PORT`        | Backend server port                  | `8090`                               |

## Docker Deployment

### Using Docker Compose
```bash
# Copy and configure environment
cp .env.example .env
# Edit .env with your values

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

This starts MongoDB, the backend, and the frontend. Access the app at `http://localhost`.

### Individual Docker Builds
```bash
# Backend
cd backend
docker build -t campconnect-backend .

# Frontend
cd angular-campconnect
docker build -t campconnect-frontend .
```

## CI/CD

GitHub Actions workflows are configured for:
- **Backend**: Build, test, and Docker image push on changes to `backend/`
- **Frontend**: Build, test, and Docker image push on changes to `angular-campconnect/`
- **Combined**: Full CI pipeline on push to main branches

## API Documentation

Swagger/OpenAPI documentation is available at `http://localhost:8090/swagger-ui.html` when the backend is running.

### Key Endpoints
| Method | Path                        | Description              |
|--------|-----------------------------|--------------------------|
| POST   | `/api/auth/register`        | Register new user        |
| POST   | `/api/auth/login`           | Login user               |
| GET    | `/api/campsites`            | List campsites           |
| POST   | `/api/bookings`             | Create booking           |
| GET    | `/api/academy/courses`      | List courses             |
| GET    | `/api/gear`                 | List gear products       |
| POST   | `/api/marketplace/predict`  | Demand prediction (ML)   |
