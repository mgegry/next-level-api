# Unified ERP Platform API

A multi-tenant SaaS platform that provides **one unified interface** for working with **multiple ERP systems**, such as **Softone**, **WinMentor Enterprise** (Romania), and other ERP providers — all integrated into a single application.

The goal of this project is to remove the need for businesses to juggle multiple ERP interfaces by offering a **centralized, consistent, and extensible layer** on top of existing ERP systems.

---

## 🚀 Vision

Businesses often rely on different ERP systems depending on region, industry, or legacy constraints. Each ERP comes with:
- its own UI
- its own workflows
- its own API conventions

This project solves that by:
- normalizing ERP integrations behind a single backend
- exposing one consistent UI and API
- allowing businesses to manage operations across ERP systems from **one app**

---

## 🧠 Core Concepts

### 1. Multi-Tenant Architecture
- Each **tenant** represents a business.
- A tenant is linked to **one ERP system** (Softone, WinMentor, etc.).
- Users can belong to **multiple tenants**.
- Access is controlled via **memberships** and **roles per tenant**.

### 2. Unified ERP Interface
All ERP providers are accessed through a **common abstraction layer**, allowing:
- shared workflows
- consistent data models
- ERP-specific logic isolated behind adapters

This makes adding new ERP integrations straightforward and safe.

---

## 🔐 Authentication & Authorization Model

### Session-Based Access (Seat Limiting)
- Unlimited users can exist per tenant.
- Each tenant has a configurable **maximum number of concurrent sessions**.
- A session represents an active login (device/browser).
- This aligns pricing with **actual usage**, not user count.

### Login Flow (High-Level)
1. User logs in → session is created.
2. User receives a **bootstrap access token** (no tenant selected).
3. User selects a tenant.
4. System enforces tenant session limits.
5. A **tenant-scoped access token** is issued.

### Token Strategy
- **Access Token**
  - Short-lived
  - Stored in httpOnly cookies
  - Either:
    - bootstrap (no tenant)
    - tenant-scoped (includes role & tenant context)
- **Refresh Token**
  - Long-lived
  - Rotated on every refresh
  - Bound to a single session

### Security Guarantees
- One active session per user
- Immediate revocation on logout or re-login
- Membership and session validated on every request

---

## 🏢 ERP Integrations

The platform is designed to support multiple ERP systems, including but not limited to:
- **Softone**
- **WinMentor Enterprise** (Romania)
- Other regional or enterprise ERPs

Each ERP integration:
- lives behind a dedicated adapter/service
- conforms to a shared internal contract
- can be enabled per tenant

This ensures that adding a new ERP does **not** impact existing tenants.

---

## 🧱 Tech Stack

### Backend
- **NestJS**
- **TypeORM**
- **PostgreSQL**
- **JWT (access + refresh tokens)**
- **Passport.js**

### Frontend
- **Angular**
- Cookie-based authentication (`httpOnly`)
- Tenant-aware UI

---

## 🧩 Key Modules

- **Auth** – authentication, sessions, token lifecycle
- **User** – users, profiles
- **Tenant** – businesses and ERP configuration
- **Membership** – user ↔ tenant relationships
- **Session** – concurrent access & seat enforcement
- **ERP Adapters** – ERP-specific logic behind a unified interface

---

## 🎯 Why This Project Exists

This platform exists to:
- simplify ERP usage for businesses
- reduce ERP lock-in
- enable multi-ERP operations in one system
- provide a scalable foundation for ERP-driven SaaS products

---

## 🛠️ Status

This project is under active development.  
The architecture is designed to scale as new ERP systems, features, and tenants are added.

---

## 📄 License

TBD
