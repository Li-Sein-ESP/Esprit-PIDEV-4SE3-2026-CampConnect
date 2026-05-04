# CampConnect Project Overview

**CampConnect** is a comprehensive full-stack outdoor adventure platform built to connect camping enthusiasts with campsites, gear, educational content, and community. The project is designed with a modern frontend/backend architecture tailored to delivering seamless experiences for campers, organizers, and campsite providers.

## Technology Stack

- **Frontend:** Angular 17+ (Standalone Components), Tailwind CSS, RxJS
- **Backend:** Spring Boot 3.2, Java 17, Spring Security with JWT
- **Database:** MongoDB
- **Architecture:** Hybrid backend architecture (Domain-driven vertical slicing combined with traditional horizontal layers)

While the platform encompasses numerous modules like Gear Marketplace, Academy, Delivery, and Community Hub, this document focuses specifically on the two core domains: **Campsites** and **Environmental Rules**.

---

## 🏕️ Campsites Module

The Campsites module acts as the core transactional element of the CampConnect domain, providing a marketplace-like experience for booking natural spaces.

### Overview
This module enables regular users to discover, filter, and book camping locations. Site owners (Providers) are empowered to define and publish their spots, declare amenities, update pricing structures, and manage their availability status in real-time.

### Key Features & Capabilities

- **Discoverability:** Dynamic filtering by location string, minimum price, maximum price, and general keyword searches.
- **Extensive Profiling:** Each Campsite model is represented robustly with fields including:
  - Base properties (Name, Description, Location text, Coordinates `latitude/longitude`)
  - Metrics (Price, Capacity, Rating, Review Count)
  - Features (Arrays of Images and Amenities)
  - Operational Flags (Available boolean, Status string)
- **Lifecycle Management:** A complete set of CRUD (Create, Read, Update, Delete) tasks allowing providers securely permissioned management.

### Technical Implementation

- **Frontend (`CampsiteService`):**
  - Consumes `/api/campsites` providing standard `GET`, `POST`, `PUT`, `DELETE` asynchronous endpoints via RxJS HTTP maps.
  - Implements client-side reactive filtering pipelines over arrays retrieved from the API.
  - Directly interfaces with `CampsitesComponent` and `CampsiteDetailComponent` to render UI views.
- **Backend:**
  - Supported by `CampsiteController` and integrated directly into MongoDB via `CampsiteRepository`.
  - Operates dynamically alongside connected models like `Category`, `Location`, and `Season` for granular reservation logic.

---

## 🍃 Environmental Rules Module

Operating as a specialized subset of the larger **Safety & Compliance** domain, the Environmental Rules module ensures that users adhere to strict ecological principles during their trips.

### Overview
As outdoor impact is a crucial aspect of camping, this module enforces conservation boundaries. Administrators generate ecological rules that define how campers are expected to act regarding local wildlife and protected zones.

### Key Features & Capabilities

- **Rules Configuration:** Environmental guidelines are classified via the following attributes:
  - `Title` and `Description`: Clear guidelines for campers.
  - `Category`: Groups rules under banners like "Wildlife Safety", "Fire Bans", "Waste Management".
  - `Severity`: Determines the criticality of an infringement.
  - `Icon` & `Active` flags: For UI/UX rendering and toggling operational boundaries instantly.
- **Administrative Control Panel:** Administrators have complete oversight to create, toggle, and delete rules based on changing regional constraints.
- **Compliance Reporting:** Contains logical hooks that integrate with Trip details, allowing users to verify their trip compliance proactively.

### Technical Implementation

- **Frontend (`EnvironmentalRuleService`):**
  - Exposes standard observable flows linking to the backend API (`/api/environmental-rules`).
  - Utilized actively inside administrative dashboards (`AdminEnvironmentalRulesComponent`) to generate global constraints.
  - Displays to end-users via dedicated views like `EnvironmentalZonesComponent`, `WildlifeRegulationsComponent`, and `TripComplianceDetailComponent`.
- **Integration Context:**
  - Bridges the gap between administration and user safety. The service works alongside safety mapping services and incident reporting frameworks to create a safe holistic environment.

---

## Conclusion

The intersection of the **Campsites** and **Environmental Rules** modules ensures that CampConnect offers more than just utility; it actively merges transactional ease with ecological responsibility. Users locate highly-rated campsite destinations while seamlessly receiving localized environmental compliance data, prioritizing the protection of our natural surroundings.
