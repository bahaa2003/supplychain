# Supply Chain API Documentation

Comprehensive documentation for all routes in the system, including request/response examples, the importance of each route, and a general architecture diagram.

---

## 🗺️ Architecture Overview

```mermaid
graph TD
  A[Client] -->|HTTP| B[Express API]
  B --> C[Auth Controllers]
  B --> D[Admin Controllers]
  B --> E[Product Controllers]
  B --> F[Order Controllers]
  B --> G[Inventory Controllers]
  B --> H[Location Controllers]
  B --> I[Notification Controllers]
  B --> J[Team Controllers]
  B --> K[User Controllers]
  B --> L[Partner Connection Controllers]
  B --> M[Setup Controllers]
  B --> N[MongoDB]
```

---

## Table of Contents

| Domain                                    | Description                                |
| ----------------------------------------- | ------------------------------------------ |
| [Admin](#admin)                           | Manage companies and approvals             |
| [Auth](#auth)                             | Authentication, registration, verification |
| [Inventory](#inventory)                   | Inventory management                       |
| [Location](#location)                     | Manage locations (warehouses, stores)      |
| [Notification](#notification)             | Notifications                              |
| [Order](#order)                           | Order management                           |
| [Partner Connection](#partner-connection) | Business relationships                     |
| [Product](#product)                       | Product management                         |
| [Setup](#setup)                           | System setup                               |
| [Team](#team)                             | Team management and invitations            |
| [User](#user)                             | User management                            |

---

## <a name="admin"></a>🛡️ Admin Controllers

### approveCompany.controller.js

| Method | Endpoint                     | Auth  | Description                        |
| ------ | ---------------------------- | ----- | ---------------------------------- |
| POST   | /api/admin/companies/approve | Admin | Approve a new company registration |

**Request Example:**

```json
{
  "companyId": "64f1a2b3c4d5e6f7a8b9c0d1"
}
```

**Response Example:**

```json
{
  "success": true,
  "message": "Company approved successfully"
}
```

**Importance:** Only admins can approve new companies, ensuring control over system access.

---

### getPendingCompanies.controller.js

| Method | Endpoint                     | Auth  | Description                        |
| ------ | ---------------------------- | ----- | ---------------------------------- |
| GET    | /api/admin/companies/pending | Admin | Get all companies pending approval |

**Response Example:**

```json
[
  {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "name": "Company A",
    "status": "pending"
  }
]
```

**Importance:** Allows admins to review companies before approval.

---

## <a name="auth"></a>🔐 Auth Controllers

| Endpoint                        | Method | Auth   | Purpose                                |
| ------------------------------- | ------ | ------ | -------------------------------------- |
| /api/auth/register              | POST   | Public | Register a new user                    |
| /api/auth/login                 | POST   | Public | User login                             |
| /api/auth/logout                | POST   | User   | User logout                            |
| /api/auth/forgot-password       | POST   | Public | Request password reset                 |
| /api/auth/reset-password        | POST   | Public | Reset password                         |
| /api/auth/verify-email/:token   | GET    | Public | Email verification                     |
| /api/auth/resend-verification   | POST   | Public | Resend verification email              |
| /api/auth/enable-2fa            | POST   | User   | Enable two-factor authentication       |
| /api/auth/verify-2fa            | POST   | User   | Verify 2FA setup                       |
| /api/auth/confirm-2fa           | POST   | Public | Confirm 2FA login                      |
| /api/auth/complete-registration | POST   | Public | Complete registration after invitation |

### Register Example

**Request:**

```json
{
  "name": "Ali",
  "email": "ali@example.com",
  "password": "StrongPassword123"
}
```

**Response:**

```json
{
  "success": true,
  "user": {
    "id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "ali@example.com"
  }
}
```

**Importance:** All authentication and account security operations.

---

## <a name="inventory"></a>📦 Inventory Controllers

| Endpoint           | Method | Auth | Purpose                     |
| ------------------ | ------ | ---- | --------------------------- |
| /api/inventory     | POST   | User | Add new inventory item      |
| /api/inventory     | GET    | User | Get all inventory items     |
| /api/inventory/:id | GET    | User | Get specific inventory item |
| /api/inventory/:id | PATCH  | User | Update inventory item       |
| /api/inventory/:id | DELETE | User | Delete inventory item       |

**Request Example (Create):**

```json
{
  "product": "64f1a2b3c4d5e6f7a8b9c0d1",
  "quantity": 100,
  "location": "Warehouse 1"
}
```

**Response Example:**

```json
{
  "success": true,
  "inventory": {
    "id": "inv123",
    "product": "64f1a2b3c4d5e6f7a8b9c0d1",
    "quantity": 100
  }
}
```

**Importance:** Accurate inventory management for each company.

---

## <a name="location"></a>📍 Location Controllers

| Endpoint           | Method | Auth | Purpose               |
| ------------------ | ------ | ---- | --------------------- |
| /api/locations     | POST   | User | Add new location      |
| /api/locations     | GET    | User | Get all locations     |
| /api/locations/:id | GET    | User | Get specific location |
| /api/locations/:id | PATCH  | User | Update location       |
| /api/locations/:id | DELETE | User | Delete location       |

**Request Example (Create):**

```json
{
  "name": "Warehouse 1",
  "address": "123 Main St"
}
```

**Response Example:**

```json
{
  "success": true,
  "location": {
    "id": "loc123",
    "name": "Warehouse 1"
  }
}
```

**Importance:** Organize storage and distribution points.

---

## <a name="notification"></a>🔔 Notification Controllers

| Endpoint                    | Method | Auth | Purpose                        |
| --------------------------- | ------ | ---- | ------------------------------ |
| /api/notifications          | POST   | User | Create new notification        |
| /api/notifications          | GET    | User | Get all notifications          |
| /api/notifications/:id      | GET    | User | Get specific notification      |
| /api/notifications/:id      | DELETE | User | Delete notification            |
| /api/notifications/all      | DELETE | User | Delete all notifications       |
| /api/notifications/:id/read | PATCH  | User | Mark notification as read      |
| /api/notifications/read-all | PATCH  | User | Mark all notifications as read |
| /api/notifications/send     | POST   | User | Send notification to users     |

**Request Example (Create):**

```json
{
  "title": "New Order",
  "message": "You have a new order."
}
```

**Response Example:**

```json
{
  "success": true,
  "notification": {
    "id": "notif123",
    "title": "New Order"
  }
}
```

**Importance:** Keep users up to date.

---

## <a name="order"></a>📑 Order Controllers

| Endpoint               | Method | Auth | Purpose             |
| ---------------------- | ------ | ---- | ------------------- |
| /api/orders            | POST   | User | Create new order    |
| /api/orders            | GET    | User | Get all orders      |
| /api/orders/:id        | GET    | User | Get specific order  |
| /api/orders/:id        | DELETE | User | Delete order        |
| /api/orders/received   | GET    | User | Get received orders |
| /api/orders/sent       | GET    | User | Get sent orders     |
| /api/orders/:id/status | PATCH  | User | Update order status |

**Request Example (Create):**

```json
{
  "receiverCompany": "64f1a2b3c4d5e6f7a8b9c0d1",
  "products": [{ "product": "prod123", "quantity": 10 }]
}
```

**Response Example:**

```json
{
  "success": true,
  "order": {
    "id": "order123",
    "status": "pending"
  }
}
```

**Importance:** Manage sales and purchases between companies.

---

## <a name="partner-connection"></a>🤝 Partner Connection Controllers

| Endpoint                                | Method | Auth | Purpose                       |
| --------------------------------------- | ------ | ---- | ----------------------------- |
| /api/partner-connections                | POST   | User | Create new partner connection |
| /api/partner-connections                | GET    | User | Get all partner connections   |
| /api/partner-connections/:id            | GET    | User | Get specific connection       |
| /api/partner-connections/:id            | DELETE | User | Delete connection             |
| /api/partner-connections/:id/terminate  | PATCH  | User | Terminate connection          |
| /api/partner-connections/:id/status     | PATCH  | User | Update connection status      |
| /api/partner-connections/:id/visibility | PATCH  | User | Update connection visibility  |

**Request Example (Create):**

```json
{
  "partnerCompanyId": "64f1a2b3c4d5e6f7a8b9c0d1"
}
```

**Response Example:**

```json
{
  "success": true,
  "connection": {
    "id": "conn123",
    "status": "active"
  }
}
```

**Importance:** Build a business network between companies.

---

## <a name="product"></a>🛒 Product Controllers

| Endpoint          | Method | Auth | Purpose              |
| ----------------- | ------ | ---- | -------------------- |
| /api/products     | POST   | User | Add new product      |
| /api/products     | GET    | User | Get all products     |
| /api/products/:id | GET    | User | Get specific product |
| /api/products/:id | PATCH  | User | Update product       |
| /api/products/:id | DELETE | User | Delete product       |

**Request Example (Create):**

```json
{
  "name": "Product X",
  "sku": "SKU123",
  "unitPrice": 100,
  "currency": "USD"
}
```

**Response Example:**

```json
{
  "success": true,
  "product": {
    "id": "prod123",
    "name": "Product X"
  }
}
```

**Importance:** Manage each company's product catalog.

---

## <a name="setup"></a>⚙️ Setup Controllers

| Endpoint         | Method | Auth    | Purpose                    |
| ---------------- | ------ | ------- | -------------------------- |
| /api/setup/admin | POST   | Special | Create main platform admin |

**Request Example:**

```json
{
  "name": "Super Admin",
  "email": "admin@example.com",
  "password": "StrongPassword123"
}
```

**Response Example:**

```json
{
  "success": true,
  "admin": {
    "id": "admin123",
    "email": "admin@example.com"
  }
}
```

**Importance:** Initial system setup.

---

## <a name="team"></a>👥 Team Controllers

| Endpoint                       | Method | Auth   | Purpose                |
| ------------------------------ | ------ | ------ | ---------------------- |
| /api/team/invite               | POST   | User   | Invite new team member |
| /api/team/verify-invite/:token | GET    | Public | Verify team invitation |

**Request Example (Invite):**

```json
{
  "email": "newuser@example.com",
  "role": "staff"
}
```

**Response Example:**

```json
{
  "success": true,
  "message": "Invitation sent"
}
```

**Importance:** Expand the company team.

---

## <a name="user"></a>👤 User Controllers

| Endpoint   | Method | Auth | Purpose       |
| ---------- | ------ | ---- | ------------- |
| /api/users | GET    | User | Get all users |

**Response Example:**

```json
[
  {
    "id": "user123",
    "name": "Ali",
    "email": "ali@example.com"
  }
]
```

**Importance:** Manage users within the company.

---

> **Note:** All routes requiring authentication expect the token in the header:  
> `Authorization: Bearer <token>`

---
