# Supply Chain Management API

## Overview

This is a comprehensive Supply Chain Management (SCM) system built with Node.js and Express.js. The system provides a robust backend API for managing B2B supply chain operations, including company management, user authentication, product catalog management, inventory tracking, order processing, partner connections, and real-time notifications.

### Key Features

- **Multi-Company Support**: Each company operates independently with their own data
- **Role-Based Access Control**: Different permission levels (admin, manager, staff, platform_admin)
- **Two-Factor Authentication**: Enhanced security with 2FA support
- **Partner Management**: B2B partner connection system for supplier-buyer relationships
- **Inventory Management**: Real-time inventory tracking with status monitoring
- **Order Processing**: Complete order lifecycle management
- **Document Management**: File upload support for company documents
- **Notification System**: Real-time and historical notifications
- **Analytics**: Company KPIs and business insights
- **Subscription Management**: Billing and subscription handling

### Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **File Upload**: Multer for document handling
- **Email**: Nodemailer for email notifications
- **Validation**: Custom validation middleware
- **Error Handling**: Global error handling with custom AppError class

---

## Table of Contents

| Domain                                                               | Description                                                           |
| -------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [All Endpoints](#all-endpoints)                                      | Summary of all Endpoints                                              |
| [Authentication & User Management](#authentication--user-management) | User registration, login, 2FA, password reset, and profile management |
| [Company Management](#company-management)                            | Company registration, approval, and listing                           |
| [Team Management](#team-management)                                  | Inviting and verifying team members                                   |
| [Partner Connections](#partner-connections)                          | Managing B2B partner relationships                                    |
| [Product & Inventory](#product--inventory)                           | CRUD operations for products and inventory tracking                   |
| [Order Management](#order-management)                                | Creating and managing purchase orders between companies               |
| [Location Management](#location-management)                          | Managing company locations and warehouses                             |
| [Invoice Management](#invoice-management)                            | Generating and downloading invoices                                   |
| [Notifications](#notifications)                                      | Real-time and historical notifications for users                      |
| [Analytics](#analytics)                                              | Company KPIs and business insights                                    |
| [Subscription & Billing](#subscription--billing)                     | Subscription checkout and management                                  |

---

## All Endpoints

### - Authentication & User Management

- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/logout`
- POST `/api/auth/enable-2fa`
- POST `/api/auth/verify-2fa`
- POST `/api/auth/confirm-2fa-login`
- POST `/api/auth/forgot-password`
- POST `/api/auth/reset-password`
- GET `/api/auth/verify/:token`
- GET `/api/auth/resend-verification`
- GET `/api/user/`
- GET `/api/user/avatar/:userId`
- PATCH `/api/user/avatar/:userId`
- DELETE `/api/user/avatar/:userId`

### - Company Management

- GET `/api/company/`
- PATCH `/api/company/approve/:companyId`

### - Team Management

- POST `/api/team/invite`
- POST `/api/team/verify-invite`

### - Partner Connections

- POST `/api/partner-connection/`
- GET `/api/partner-connection/`
- GET `/api/partner-connection/:connectionId`
- PATCH `/api/partner-connection/:connectionId`

### - Product & Inventory

- GET `/api/product/`
- POST `/api/product/`
- GET `/api/product/:productId`
- PATCH `/api/product/:productId`
- DELETE `/api/product/:productId`
- GET `/api/inventory/`
- GET `/api/inventory/:inventoryId`
- PATCH `/api/inventory/:inventoryId`

### - Order Management

- GET `/api/order/`
- POST `/api/order/:supplierId`
- GET `/api/order/:orderId`
- PATCH `/api/order/:orderId`
- PATCH `/api/order/:orderId/edit/:itemId`
- DELETE `/api/order/:orderId/remove/:itemId`
- POST `/api/order/:orderId/add`

### - Location Management

- GET `/api/location/`
- POST `/api/location/`
- GET `/api/location/:locationId`
- PATCH `/api/location/:locationId`
- DELETE `/api/location/:locationId`

### - Invoice Management

- POST `/api/invoice/from-order/:orderId`
- GET `/api/invoice/`
- GET `/api/invoice/:invoiceId`
- GET `/api/invoice/download/:invoiceId`

### - Notifications

- GET `/api/notification/`
- PATCH `/api/notification/`
- DELETE `/api/notification/`
- GET `/api/notification/:notificationId`
- PATCH `/api/notification/:notificationId`
- DELETE `/api/notification/:notificationId`

### - Analytics

- GET `/api/analytics/kpis`

### - Subscription & Billing

- POST `/api/subscription/checkout`

---

## Authentication & User Management

### Enums

**User Roles:**

- `admin` - Full company access
- `manager` - Management level access
- `staff` - Basic user access
- `platform_admin` - Platform-wide access

**User Status:**

- `active` - Active user account
- `invited` - User invited but not yet active

---

### POST `/api/auth/register`

**Purpose:** Register a new user and company with document upload.

**Parameters:**

- `documents` (form-data, array): Company documents
- `email` (string, body): User email
- `password` (string, body): User password
- `name` (string, body): User name
- `companyName` (string, body): Company name
- `companyAddress` (string, body): Company address
- `companyPhone` (string, body): Company phone
- `companyWebsite` (string, body, optional): Company website

**Success Example:**

```json
{
  "status": "success",
  "message": "Registration successful. Please verify your email."
}
```

**Error Example:**

```json
{
  "status": "error",
  "message": "Email already exists."
}
```

---

### POST `/api/auth/login`

**Purpose:** Authenticate user and return JWT token.

**Parameters:**

- `email` (string, body): User email
- `password` (string, body): User password

**Success Example:**

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**2FA Required Example:**

```json
{
  "message": "2FA code required",
  "twoFactor": true,
  "userId": "507f1f77bcf86cd799439011"
}
```

**Error Example:**

```json
{
  "status": "error",
  "message": "Invalid email or password"
}
```

---

### POST `/api/auth/logout`

**Purpose:** Log out the authenticated user.

**Headers:**

- `Authorization: Bearer <token>`

**Success Example:**

```json
{
  "status": "success",
  "message": "Logged out successfully."
}
```

---

### POST `/api/auth/enable-2fa`

**Purpose:** Enable two-factor authentication.

**Headers:**

- `Authorization: Bearer <token>`

**Success Example:**

```json
{
  "status": "success",
  "message": "2FA enabled. Scan the QR code to complete setup."
}
```

---

### POST `/api/auth/verify-2fa`

**Purpose:** Verify 2FA setup code.

**Headers:**

- `Authorization: Bearer <token>`

**Parameters:**

- `code` (string, body): 2FA verification code

**Success Example:**

```json
{
  "status": "success",
  "message": "2FA verified successfully."
}
```

---

### POST `/api/auth/confirm-2fa-login`

**Purpose:** Complete login with 2FA code.

**Parameters:**

- `userId` (string, body): User ID
- `code` (string, body): 2FA code

**Success Example:**

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST `/api/auth/forgot-password`

**Purpose:** Request password reset email.

**Parameters:**

- `email` (string, body): User email

**Success Example:**

```json
{
  "status": "success",
  "message": "Password reset email sent."
}
```

---

### POST `/api/auth/reset-password`

**Purpose:** Reset password using token.

**Parameters:**

- `token` (string, body): Reset token
- `password` (string, body): New password

**Success Example:**

```json
{
  "status": "success",
  "message": "Password reset successful."
}
```

---

### GET `/api/auth/verify/:token`

**Purpose:** Verify email address.

**Parameters:**

- `token` (string, URL): Email verification token

**Success Example:**

```json
{
  "status": "success",
  "message": "Email verified successfully."
}
```

---

### GET `/api/auth/resend-verification`

**Purpose:** Resend email verification.

**Headers:**

- `Authorization: Bearer <token>`

**Success Example:**

```json
{
  "status": "success",
  "message": "Verification email resent."
}
```

---

### GET `/api/user/`

**Purpose:** List all users in the company.

**Headers:**

- `Authorization: Bearer <token>`

**Success Example:**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "admin",
      "status": "active"
    }
  ]
}
```

---

### GET `/api/user/avatar/:userId`

**Purpose:** Get user avatar image.

**Parameters:**

- `userId` (string, URL): User ID

**Success Example:**

Returns image file (binary data)

---

### PATCH `/api/user/avatar/:userId`

**Purpose:** Update user avatar.

**Parameters:**

- `userId` (string, URL): User ID
- `avatar` (file, form-data): New avatar image

**Success Example:**

```json
{
  "status": "success",
  "message": "Avatar updated successfully."
}
```

---

### DELETE `/api/user/avatar/:userId`

**Purpose:** Delete user avatar.

**Parameters:**

- `userId` (string, URL): User ID

**Success Example:**

```json
{
  "status": "success",
  "message": "Avatar deleted successfully."
}
```

---

## Company Management

### Enums

**Company Status:**

- `pending` - Awaiting approval
- `approved` - Approved and active
- `rejected` - Rejected by admin
- `suspended` - Temporarily suspended

---

### GET `/api/company/`

**Purpose:** List all companies (admin only).

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (number, optional): Page number for pagination
- `limit` (number, optional): Items per page
- `status` (string, optional): Filter by company status

**Success Example:**

```json
{
  "status": "success",
  "results": 10,
  "page": 1,
  "limit": 20,
  "total": 45,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "companyName": "ABC Corp",
      "status": "approved",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### PATCH `/api/company/approve/:companyId`

**Purpose:** Approve or reject a company (platform admin only).

**Parameters:**

- `companyId` (string, URL): Company ID
- `status` (string, body): New status (approved/rejected)
- `notes` (string, body, optional): Approval/rejection notes

**Success Example:**

```json
{
  "status": "success",
  "message": "Company approved successfully."
}
```

---

## Team Management

---

### POST `/api/team/invite`

**Purpose:** Invite a new team member.

**Headers:**

- `Authorization: Bearer <token>`

**Parameters:**

- `email` (string, body): Invitee email
- `role` (string, body): User role (admin/manager/staff)
- `message` (string, body, optional): Invitation message

**Success Example:**

```json
{
  "status": "success",
  "message": "Invitation sent successfully."
}
```

---

### POST `/api/team/verify-invite`

**Purpose:** Verify team invitation and complete registration.

**Parameters:**

- `token` (string, body): Invitation token
- `name` (string, body): User name
- `password` (string, body): User password

**Success Example:**

```json
{
  "status": "success",
  "message": "Team member registered successfully."
}
```

---

## Partner Connections

### Enums

**Partner Connection Status:**

- `Pending` - Awaiting response
- `Active` - Active partnership
- `Rejected` - Rejected by recipient
- `Cancelled` - Cancelled by requester
- `Inactive` - Temporarily inactive
- `Completed` - Completed partnership
- `Expired` - Expired invitation
- `Terminated` - Terminated partnership

**Valid Status Transitions:**

- `Pending` → `Active`, `Rejected`, `Cancelled`
- `Active` → `Inactive`, `Completed`, `Terminated`, `Expired`
- `Inactive` → `Active`, `Terminated`

---

### POST `/api/partner-connection/`

**Purpose:** Create a new partner connection request.

**Headers:**

- `Authorization: Bearer <token>`

**Parameters:**

- `recipientEmail` (string, body): Partner company email
- `message` (string, body, optional): Connection request message
- `expiryDate` (string, body, optional): Request expiry date

**Success Example:**

```json
{
  "status": "success",
  "message": "Partner connection request sent.",
  "data": {
    "connectionId": "507f1f77bcf86cd799439011"
  }
}
```

---

### GET `/api/partner-connection/`

**Purpose:** List all partner connections for the company.

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `status` (string, optional): Filter by connection status
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Success Example:**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "requester": "Company A",
      "recipient": "Company B",
      "status": "Active",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/partner-connection/:connectionId`

**Purpose:** Get specific partner connection details.

**Parameters:**

- `connectionId` (string, URL): Connection ID

**Success Example:**

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "requester": "Company A",
    "recipient": "Company B",
    "status": "Active",
    "message": "Partnership request",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH `/api/partner-connection/:connectionId`

**Purpose:** Update partner connection status.

**Parameters:**

- `connectionId` (string, URL): Connection ID
- `status` (string, body): New status
- `notes` (string, body, optional): Status change notes

**Success Example:**

```json
{
  "status": "success",
  "message": "Partner connection updated successfully."
}
```

---

## Product & Inventory

### Enums

**Inventory Status:**

- `In Stock` - Sufficient inventory
- `Low Stock` - Below minimum threshold
- `Out of Stock` - No inventory available
- `Discontinued` - Product discontinued

**Inventory Change Types:**

- `Initial Stock` - Initial inventory setup
- `Incoming` - Inventory received
- `Outgoing` - Inventory sent
- `Reserved` - Inventory reserved
- `Unreserved` - Reservation cancelled
- `Adjustment` - Manual adjustment
- `Damaged` - Damaged inventory
- `Expired` - Expired inventory
- `Returned` - Returned inventory
- `Transfer` - Transfer between locations

**Inventory Reference Types:**

- `Order` - Order reference
- `Shipment` - Shipment reference
- `Transfer` - Transfer reference
- `Adjustment` - Adjustment reference
- `Return` - Return reference
- `Purchase` - Purchase reference
- `Sale` - Sale reference
- `Production` - Production reference
- `Consumption` - Consumption reference
- `Inspection` - Inspection reference
- `System` - System generated
- `Manual` - Manual change

**Units:**

- `piece`, `box`, `kg`, `g`, `lb`, `liter`, `meter`, `cm`, `bottle`, `carton`, `roll`, `sheet`, `pair`, `bag`, `unit`

**Currencies:**

- `USD`, `EUR`, `EGP`, `SAR`, `AED`, `GBP`, `JPY`, `CNY`, `INR`, `TRY`, `CAD`, `AUD`

---

### GET `/api/product/`

**Purpose:** List all products for the company.

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `category` (string, optional): Filter by category
- `isActive` (boolean, optional): Filter by active status

**Success Example:**

```json
{
  "status": "success",
  "results": 5,
  "page": 1,
  "limit": 20,
  "total": 25,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "productName": "Product A",
      "sku": "PROD001",
      "unitPrice": 100.0,
      "unit": "piece",
      "category": "Electronics",
      "isActive": true
    }
  ]
}
```

---

### POST `/api/product/`

**Purpose:** Create a new product with initial inventory.

**Headers:**

- `Authorization: Bearer <token>`

**Parameters:**

- `productName` (string, body): Product name
- `sku` (string, body, optional): SKU (auto-generated if not provided)
- `unitPrice` (number, body): Unit price
- `unit` (string, body): Unit of measurement
- `category` (string, body): Product category
- `isActive` (boolean, body): Product active status
- `location` (string, body): Default location ID
- `quantity` (number, body, optional): Initial inventory quantity
- `minimumThreshold` (number, body, optional): Minimum stock threshold

**Success Example:**

```json
{
  "status": "success",
  "data": {
    "product": {
      "_id": "507f1f77bcf86cd799439011",
      "productName": "New Product",
      "sku": "PROD002",
      "unitPrice": 150.0,
      "unit": "piece",
      "category": "Electronics"
    }
  }
}
```

---

### GET `/api/product/:productId`

**Purpose:** Get specific product details.

**Parameters:**

- `productId` (string, URL): Product ID

**Success Example:**

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "productName": "Product A",
    "sku": "PROD001",
    "unitPrice": 100.0,
    "unit": "piece",
    "category": "Electronics",
    "isActive": true,
    "inventory": {
      "onHand": 50,
      "reserved": 10,
      "minimumThreshold": 20
    }
  }
}
```

---

### PATCH `/api/product/:productId`

**Purpose:** Update product information.

**Parameters:**

- `productId` (string, URL): Product ID
- `productName` (string, body, optional): New product name
- `unitPrice` (number, body, optional): New unit price
- `unit` (string, body, optional): New unit
- `category` (string, body, optional): New category
- `isActive` (boolean, body, optional): New active status

**Success Example:**

```json
{
  "status": "success",
  "message": "Product updated successfully."
}
```

---

### DELETE `/api/product/:productId`

**Purpose:** Delete a product (admin only).

**Parameters:**

- `productId` (string, URL): Product ID

**Success Example:**

```json
{
  "status": "success",
  "message": "Product deleted successfully."
}
```

---

### GET `/api/inventory/`

**Purpose:** List all inventory items for the company.

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `status` (string, optional): Filter by inventory status
- `location` (string, optional): Filter by location

**Success Example:**

```json
{
  "status": "success",
  "results": 5,
  "page": 1,
  "limit": 20,
  "total": 25,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "product": {
        "productName": "Product A",
        "sku": "PROD001"
      },
      "onHand": 50,
      "reserved": 10,
      "minimumThreshold": 20,
      "status": "In Stock",
      "location": {
        "locationName": "Warehouse A"
      }
    }
  ]
}
```

---

### GET `/api/inventory/:inventoryId`

**Purpose:** Get specific inventory details.

**Parameters:**

- `inventoryId` (string, URL): Inventory ID

**Success Example:**

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "product": {
      "productName": "Product A",
      "sku": "PROD001"
    },
    "onHand": 50,
    "reserved": 10,
    "minimumThreshold": 20,
    "status": "In Stock",
    "location": {
      "locationName": "Warehouse A"
    },
    "lastUpdated": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH `/api/inventory/:inventoryId`

**Purpose:** Update inventory quantities.

**Parameters:**

- `inventoryId` (string, URL): Inventory ID
- `onHand` (number, body, optional): New on-hand quantity
- `reserved` (number, body, optional): New reserved quantity
- `minimumThreshold` (number, body, optional): New minimum threshold
- `changeType` (string, body): Type of change
- `referenceType` (string, body, optional): Reference type
- `referenceId` (string, body, optional): Reference ID
- `notes` (string, body, optional): Change notes

**Success Example:**

```json
{
  "status": "success",
  "message": "Inventory updated successfully."
}
```

---

## Order Management

### Enums

**Order Status:**

- `Created` - Order created by employee
- `Rejected` - Order rejected by manager
- `Submitted` - Order submitted to supplier
- `Accepted` - Supplier accepted order
- `Declined` - Supplier declined order
- `Preparing` - Supplier preparing order
- `Ready_to_ship` - Order ready to ship
- `Shipped` - Order shipped
- `Delivered` - Order delivered
- `Received` - Order received by buyer
- `Completed` - Order completed
- `Cancelled` - Order cancelled

**Valid Status Transitions:**

- `Created` → `Rejected`, `Submitted`
- `Rejected` → `Submitted`
- `Submitted` → `Accepted`, `Declined`, `Cancelled`
- `Accepted` → `Preparing`, `Cancelled`, `Declined`
- `Preparing` → `Ready_to_ship`
- `Ready_to_ship` → `Shipped`
- `Shipped` → `Delivered`
- `Delivered` → `Received`
- `Received` → `Completed`

---

### GET `/api/order/`

**Purpose:** List all orders for the company.

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `status` (string, optional): Filter by order status
- `supplier` (string, optional): Filter by supplier ID

**Success Example:**

```json
{
  "status": "success",
  "results": 5,
  "page": 1,
  "limit": 20,
  "total": 25,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-1704067200000-1",
      "buyer": "Company A",
      "supplier": "Company B",
      "status": "Submitted",
      "totalAmount": 1000.0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### POST `/api/order/:supplierId`

**Purpose:** Create a new order with a specific supplier.

**Parameters:**

- `supplierId` (string, URL): Supplier company ID
- `items` (array, body): Order items
  - `sku` (string): Product SKU
  - `quantity` (number): Order quantity
- `deliveryLocation` (string, body): Delivery location ID
- `notes` (string, body, optional): Order notes
- `requestedDeliveryDate` (string, body): Requested delivery date (DD/MM/YYYY)

**Success Example:**

```json
{
  "status": "success",
  "message": "Order created successfully.",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-1704067200000-1",
      "status": "Created",
      "totalAmount": 1000.0
    }
  }
}
```

---

### GET `/api/order/:orderId`

**Purpose:** Get specific order details.

**Parameters:**

- `orderId` (string, URL): Order ID

**Success Example:**

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "orderNumber": "ORD-1704067200000-1",
    "buyer": "Company A",
    "supplier": "Company B",
    "status": "Submitted",
    "items": [
      {
        "sku": "PROD001",
        "productName": "Product A",
        "quantity": 10,
        "unitPrice": 100.0,
        "subtotal": 1000.0
      }
    ],
    "totalAmount": 1000.0,
    "deliveryLocation": "Warehouse A",
    "requestedDeliveryDate": "2024-02-01T00:00:00.000Z"
  }
}
```

---

### PATCH `/api/order/:orderId`

**Purpose:** Update order status.

**Parameters:**

- `orderId` (string, URL): Order ID
- `status` (string, body): New order status
- `notes` (string, body, optional): Status change notes

**Success Example:**

```json
{
  "status": "success",
  "message": "Order status updated successfully."
}
```

---

### PATCH `/api/order/:orderId/edit/:itemId`

**Purpose:** Edit a specific order item.

**Parameters:**

- `orderId` (string, URL): Order ID
- `itemId` (string, URL): Item ID
- `quantity` (number, body): New quantity
- `notes` (string, body, optional): Edit notes

**Success Example:**

```json
{
  "status": "success",
  "message": "Order item updated successfully."
}
```

---

### DELETE `/api/order/:orderId/remove/:itemId`

**Purpose:** Remove an item from the order.

**Parameters:**

- `orderId` (string, URL): Order ID
- `itemId` (string, URL): Item ID

**Success Example:**

```json
{
  "status": "success",
  "message": "Order item removed successfully."
}
```

---

### POST `/api/order/:orderId/add`

**Purpose:** Add a new item to the order.

**Parameters:**

- `orderId` (string, URL): Order ID
- `sku` (string, body): Product SKU
- `quantity` (number, body): Item quantity

**Success Example:**

```json
{
  "status": "success",
  "message": "Order item added successfully."
}
```

---

## Location Management

### Enums

**Location Types:**

- `Company` - Company headquarters
- `Warehouse` - Storage warehouse
- `Store` - Retail store
- `Manufacturing` - Manufacturing facility
- `Distribution Center` - Distribution center
- `Other` - Other location type

---

### GET `/api/location/`

**Purpose:** List all locations for the company.

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `type` (string, optional): Filter by location type

**Success Example:**

```json
{
  "status": "success",
  "results": 3,
  "page": 1,
  "limit": 20,
  "total": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "locationName": "Main Warehouse",
      "type": "Warehouse",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA"
    }
  ]
}
```

---

### POST `/api/location/`

**Purpose:** Create a new location.

**Headers:**

- `Authorization: Bearer <token>`

**Parameters:**

- `locationName` (string, body): Location name
- `type` (string, body): Location type
- `address` (string, body): Street address
- `city` (string, body): City
- `state` (string, body): State/province
- `country` (string, body): Country
- `postalCode` (string, body, optional): Postal code
- `phone` (string, body, optional): Phone number
- `email` (string, body, optional): Email address

**Success Example:**

```json
{
  "status": "success",
  "data": {
    "location": {
      "_id": "507f1f77bcf86cd799439011",
      "locationName": "New Warehouse",
      "type": "Warehouse",
      "address": "456 Oak St"
    }
  }
}
```

---

### GET `/api/location/:locationId`

**Purpose:** Get specific location details.

**Parameters:**

- `locationId` (string, URL): Location ID

**Success Example:**

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "locationName": "Main Warehouse",
    "type": "Warehouse",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postalCode": "10001",
    "phone": "+1-555-123-4567",
    "email": "warehouse@company.com"
  }
}
```

---

### PATCH `/api/location/:locationId`

**Purpose:** Update location information.

**Parameters:**

- `locationId` (string, URL): Location ID
- `locationName` (string, body, optional): New location name
- `type` (string, body, optional): New location type
- `address` (string, body, optional): New address
- `city` (string, body, optional): New city
- `state` (string, body, optional): New state
- `country` (string, body, optional): New country
- `postalCode` (string, body, optional): New postal code
- `phone` (string, body, optional): New phone number
- `email` (string, body, optional): New email address

**Success Example:**

```json
{
  "status": "success",
  "message": "Location updated successfully."
}
```

---

### DELETE `/api/location/:locationId`

**Purpose:** Delete a location.

**Parameters:**

- `locationId` (string, URL): Location ID

**Success Example:**

```json
{
  "status": "success",
  "message": "Location deleted successfully."
}
```

---

## Invoice Management

---

### POST `/api/invoice/from-order/:orderId`

**Purpose:** Generate an invoice from an order.

**Parameters:**

- `orderId` (string, URL): Order ID

**Headers:**

- `Authorization: Bearer <token>`

**Success Example:**

```json
{
  "status": "success",
  "message": "Invoice generated successfully.",
  "data": {
    "invoice": {
      "_id": "507f1f77bcf86cd799439011",
      "invoiceNumber": "INV-1704067200000-1",
      "order": "507f1f77bcf86cd799439012",
      "totalAmount": 1000.0
    }
  }
}
```

---

### GET `/api/invoice/`

**Purpose:** List all invoices for the company.

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `orderId` (string, optional): Filter by order ID

**Success Example:**

```json
{
  "status": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "invoiceNumber": "INV-1704067200000-1",
      "order": "507f1f77bcf86cd799439012",
      "totalAmount": 1000.0,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/invoice/:invoiceId`

**Purpose:** Get specific invoice details.

**Parameters:**

- `invoiceId` (string, URL): Invoice ID

**Success Example:**

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "invoiceNumber": "INV-1704067200000-1",
    "order": {
      "orderNumber": "ORD-1704067200000-1",
      "items": [...]
    },
    "totalAmount": 1000.00,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### GET `/api/invoice/download/:invoiceId`

**Purpose:** Download invoice as PDF.

**Parameters:**

- `invoiceId` (string, URL): Invoice ID

**Success Example:**

Returns PDF file (binary data)

---

## Notifications

### Enums

**Notification Types:**

- `notification` - General notification
- `createdOrder` - Order created
- `newOrder` - New order received
- `orderStatusChange` - Order status changed
- `shipmentUpdate` - Shipment update
- `inventoryAlert` - Inventory alert
- `partnerRequest` - Partner connection request
- `documentUpdate` - Document update
- `taskAssignment` - Task assignment
- `systemAlert` - System alert
- `partnerConnectionUpdate` - Partner connection update

**Notification Priority:**

- `Low` - Low priority
- `Medium` - Medium priority
- `High` - High priority
- `Urgent` - Urgent priority

**Notification Related Types:**

- `Order` - Order related
- `Shipment` - Shipment related
- `Inventory` - Inventory related
- `Partner` - Partner related
- `Document` - Document related
- `Task` - Task related
- `System` - System related

---

### GET `/api/notification/`

**Purpose:** List all notifications for the user.

**Headers:**

- `Authorization: Bearer <token>`

**Query Parameters:**

- `page` (number, optional): Page number
- `limit` (number, optional): Items per page
- `type` (string, optional): Filter by notification type
- `priority` (string, optional): Filter by priority
- `isRead` (boolean, optional): Filter by read status

**Success Example:**

```json
{
  "status": "success",
  "results": 5,
  "page": 1,
  "limit": 20,
  "total": 25,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "type": "newOrder",
      "title": "New Order Received",
      "message": "You have received a new order from Company A",
      "priority": "High",
      "isRead": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### PATCH `/api/notification/`

**Purpose:** Mark all notifications as read.

**Headers:**

- `Authorization: Bearer <token>`

**Success Example:**

```json
{
  "status": "success",
  "message": "All notifications marked as read."
}
```

---

### DELETE `/api/notification/`

**Purpose:** Delete all notifications for the user.

**Headers:**

- `Authorization: Bearer <token>`

**Success Example:**

```json
{
  "status": "success",
  "message": "All notifications deleted."
}
```

---

### GET `/api/notification/:notificationId`

**Purpose:** Get specific notification details.

**Parameters:**

- `notificationId` (string, URL): Notification ID

**Success Example:**

```json
{
  "status": "success",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "type": "newOrder",
    "title": "New Order Received",
    "message": "You have received a new order from Company A",
    "priority": "High",
    "isRead": false,
    "relatedType": "Order",
    "relatedId": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH `/api/notification/:notificationId`

**Purpose:** Mark specific notification as read.

**Parameters:**

- `notificationId` (string, URL): Notification ID

**Success Example:**

```json
{
  "status": "success",
  "message": "Notification marked as read."
}
```

---

### DELETE `/api/notification/:notificationId`

**Purpose:** Delete specific notification.

**Parameters:**

- `notificationId` (string, URL): Notification ID

**Success Example:**

```json
{
  "status": "success",
  "message": "Notification deleted successfully."
}
```

---

## Analytics

---

### GET `/api/analytics/kpis`

**Purpose:** Get company key performance indicators.

**Headers:**

- `Authorization: Bearer <token>`

**Success Example:**

```json
{
  "status": "success",
  "data": {
    "inventoryValue": 50000.0,
    "orderedValue": 25000.0,
    "remainingBudget": 75000.0,
    "productCount": 100,
    "orderCount": 25,
    "partnerCount": 10
  }
}
```

---

## Subscription & Billing

---

### POST `/api/subscription/checkout`

**Purpose:** Process subscription checkout.

**Headers:**

- `Authorization: Bearer <token>`

**Parameters:**

- `planId` (string, body): Subscription plan ID
- `paymentMethod` (string, body): Payment method details

**Success Example:**

```json
{
  "status": "success",
  "message": "Subscription activated successfully.",
  "data": {
    "subscriptionId": "sub_1234567890",
    "planId": "plan_premium",
    "status": "active"
  }
}
```

---
