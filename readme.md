# Controllers Documentation

This document provides a comprehensive overview of all controllers in the application, organized by domain.

## Table of Contents
- [Admin Controllers](#admin-controllers)
- [Auth Controllers](#auth-controllers)
- [Inventory Controllers](#inventory-controllers)
- [Location Controllers](#location-controllers)
- [Notification Controllers](#notification-controllers)
- [Order Controllers](#order-controllers)
- [Partner Connection Controllers](#partner-connection-controllers)
- [Product Controllers](#product-controllers)
- [Setup Controllers](#setup-controllers)
- [Team Controllers](#team-controllers)
- [User Controllers](#user-controllers)

## Admin Controllers

Controllers for administrative operations.

### approveCompany.controller.js
- **Purpose**: Approves a company registration
- **Endpoint**: POST /api/admin/companies/approve
- **Description**: Allows platform administrators to approve pending company registrations.
- **Authorization**: Requires admin role

### getPendingCompanies.controller.js
- **Purpose**: Retrieves pending company registrations
- **Endpoint**: GET /api/admin/companies/pending
- **Description**: Fetches all companies that are waiting for approval.
- **Authorization**: Requires admin role

## Auth Controllers

Controllers for authentication and user management.

### completeRegistration.controller.js
- **Purpose**: Completes user registration process
- **Endpoint**: POST /api/auth/complete-registration
- **Description**: Finalizes user registration by providing additional required information.

### confirm2faLogin.controller.js
- **Purpose**: Confirms two-factor authentication during login
- **Endpoint**: POST /api/auth/confirm-2fa
- **Description**: Validates the 2FA code entered by a user during login.

### enable2fa.controller.js
- **Purpose**: Enables two-factor authentication for a user
- **Endpoint**: POST /api/auth/enable-2fa
- **Description**: Activates 2FA security for a user account.
- **Authorization**: Requires authentication

### forgotPassword.controller.js
- **Purpose**: Initiates password reset process
- **Endpoint**: POST /api/auth/forgot-password
- **Description**: Sends a password reset link to the user's email.

### login.controller.js
- **Purpose**: Authenticates users
- **Endpoint**: POST /api/auth/login
- **Description**: Validates credentials and provides authentication tokens.

### logout.controller.js
- **Purpose**: Logs out users
- **Endpoint**: POST /api/auth/logout
- **Description**: Invalidates current authentication tokens.
- **Authorization**: Requires authentication

### register.controller.js
- **Purpose**: Registers new users
- **Endpoint**: POST /api/auth/register
- **Description**: Creates a new user account with provided information.

### resendVerificationEmail.controller.js
- **Purpose**: Resends verification email
- **Endpoint**: POST /api/auth/resend-verification
- **Description**: Sends a new verification email to the user.

### resetPassword.controller.js
- **Purpose**: Resets user password
- **Endpoint**: POST /api/auth/reset-password
- **Description**: Updates user password after verification.

### verify2fa.controller.js
- **Purpose**: Verifies 2FA setup
- **Endpoint**: POST /api/auth/verify-2fa
- **Description**: Verifies that 2FA setup is working correctly.
- **Authorization**: Requires authentication

### verifyEmail.controller.js
- **Purpose**: Verifies user email
- **Endpoint**: GET /api/auth/verify-email/:token
- **Description**: Confirms user email address via verification token.

## Inventory Controllers

Controllers for inventory management.

### createInventory.controller.js
- **Purpose**: Creates new inventory items
- **Endpoint**: POST /api/inventory
- **Description**: Adds new inventory items to a company's stock.
- **Authorization**: Requires authentication and appropriate permissions

### deleteInventory.controller.js
- **Purpose**: Deletes inventory items
- **Endpoint**: DELETE /api/inventory/:id
- **Description**: Removes inventory items from the system.
- **Authorization**: Requires authentication and appropriate permissions

### getAllInventory.controller.js
- **Purpose**: Retrieves all inventory items
- **Endpoint**: GET /api/inventory
- **Description**: Gets all inventory items for the user's company with optional filtering.
- **Authorization**: Requires authentication

### getInventoryById.controller.js
- **Purpose**: Gets a specific inventory item
- **Endpoint**: GET /api/inventory/:id
- **Description**: Retrieves detailed information for a specific inventory item.
- **Authorization**: Requires authentication and appropriate permissions

### updateInventory.controller.js
- **Purpose**: Updates inventory information
- **Endpoint**: PUT /api/inventory/:id
- **Description**: Modifies existing inventory item details.
- **Authorization**: Requires authentication and appropriate permissions

## Location Controllers

Controllers for location management.

### createLocation.js
- **Purpose**: Creates new locations
- **Endpoint**: POST /api/locations
- **Description**: Adds new warehouses, stores, or other locations to a company.
- **Authorization**: Requires authentication and appropriate permissions

### deleteLocation.js
- **Purpose**: Deletes locations
- **Endpoint**: DELETE /api/locations/:id
- **Description**: Removes locations from the system.
- **Authorization**: Requires authentication and appropriate permissions

### getAllLocations.js
- **Purpose**: Retrieves all locations
- **Endpoint**: GET /api/locations
- **Description**: Gets all locations for a company with optional filtering.
- **Authorization**: Requires authentication

### getLocationById.js
- **Purpose**: Gets a specific location
- **Endpoint**: GET /api/locations/:id
- **Description**: Retrieves detailed information for a specific location.
- **Authorization**: Requires authentication

### updateLocation.js
- **Purpose**: Updates location information
- **Endpoint**: PUT /api/locations/:id
- **Description**: Modifies existing location details.
- **Authorization**: Requires authentication and appropriate permissions

## Notification Controllers

Controllers for managing notifications.

### createNotification.js
- **Purpose**: Creates new notifications
- **Endpoint**: POST /api/notifications
- **Description**: Generates notifications for users.
- **Authorization**: Requires authentication

### deleteAllNotificationsForUser.js
- **Purpose**: Deletes all notifications for a user
- **Endpoint**: DELETE /api/notifications/all
- **Description**: Clears all notifications for the authenticated user.
- **Authorization**: Requires authentication

### deleteNotification.js
- **Purpose**: Deletes a specific notification
- **Endpoint**: DELETE /api/notifications/:id
- **Description**: Removes a single notification.
- **Authorization**: Requires authentication

### getAllNotifications.js
- **Purpose**: Retrieves all notifications
- **Endpoint**: GET /api/notifications
- **Description**: Gets all notifications for the authenticated user.
- **Authorization**: Requires authentication

### getNotificationById.js
- **Purpose**: Gets a specific notification
- **Endpoint**: GET /api/notifications/:id
- **Description**: Retrieves detailed information for a specific notification.
- **Authorization**: Requires authentication

### markAllNotificationsAsRead.js
- **Purpose**: Marks all notifications as read
- **Endpoint**: PUT /api/notifications/read-all
- **Description**: Updates all notifications for the user to read status.
- **Authorization**: Requires authentication

### markNotificationAsRead.js
- **Purpose**: Marks a notification as read
- **Endpoint**: PUT /api/notifications/:id/read
- **Description**: Updates the read status of a specific notification.
- **Authorization**: Requires authentication

### sendNotificationToUsers.js
- **Purpose**: Sends notifications to users
- **Endpoint**: POST /api/notifications/send
- **Description**: Sends notifications to specified users.
- **Authorization**: Requires authentication and appropriate permissions

## Order Controllers

Controllers for order management.

### createOrder.js
- **Purpose**: Creates new orders
- **Endpoint**: POST /api/orders
- **Description**: Creates purchase orders between companies.
- **Authorization**: Requires authentication and appropriate permissions

### deleteOrder.js
- **Purpose**: Deletes orders
- **Endpoint**: DELETE /api/orders/:id
- **Description**: Removes orders from the system.
- **Authorization**: Requires authentication and appropriate permissions

### getOrderById.js
- **Purpose**: Gets a specific order
- **Endpoint**: GET /api/orders/:id
- **Description**: Retrieves detailed information for a specific order.
- **Authorization**: Requires authentication and appropriate permissions

### getOrdersReceivedByCompany.js
- **Purpose**: Retrieves orders received by a company
- **Endpoint**: GET /api/orders/received
- **Description**: Gets all orders where the company is the receiver.
- **Authorization**: Requires authentication

### getOrdersSentByCompany.js
- **Purpose**: Retrieves orders sent by a company
- **Endpoint**: GET /api/orders/sent
- **Description**: Gets all orders where the company is the sender.
- **Authorization**: Requires authentication

### updateOrderStatus.js
- **Purpose**: Updates order status
- **Endpoint**: PUT /api/orders/:id/status
- **Description**: Modifies the status of an existing order.
- **Authorization**: Requires authentication and appropriate permissions

## Partner Connection Controllers

Controllers for managing connections between business partners.

### createPartnerConnection.js
- **Purpose**: Creates new partner connections
- **Endpoint**: POST /api/partner-connections
- **Description**: Establishes a new business relationship between companies.
- **Authorization**: Requires authentication and appropriate permissions

### deletePartnerConnection.js
- **Purpose**: Deletes partner connections
- **Endpoint**: DELETE /api/partner-connections/:id
- **Description**: Removes a business relationship from the system.
- **Authorization**: Requires authentication and appropriate permissions

### getAllPartnerConnections.js
- **Purpose**: Retrieves all partner connections
- **Endpoint**: GET /api/partner-connections
- **Description**: Gets all business relationships for a company.
- **Authorization**: Requires authentication

### getPartnerConnectionById.js
- **Purpose**: Gets a specific partner connection
- **Endpoint**: GET /api/partner-connections/:id
- **Description**: Retrieves detailed information for a specific business relationship.
- **Authorization**: Requires authentication and appropriate permissions

### terminatePartnerConnection.js
- **Purpose**: Terminates a partner connection
- **Endpoint**: PUT /api/partner-connections/:id/terminate
- **Description**: Ends a business relationship between companies.
- **Authorization**: Requires authentication and appropriate permissions

### updatePartnerConnectionStatus.js
- **Purpose**: Updates partner connection status
- **Endpoint**: PUT /api/partner-connections/:id/status
- **Description**: Modifies the status of a business relationship.
- **Authorization**: Requires authentication and appropriate permissions

### updatePartnerConnectionVisibility.js
- **Purpose**: Updates partner connection visibility
- **Endpoint**: PUT /api/partner-connections/:id/visibility
- **Description**: Changes visibility settings for a business relationship.
- **Authorization**: Requires authentication and appropriate permissions

## Product Controllers

Controllers for product management.

### createProduct.js
- **Purpose**: Creates new products
- **Endpoint**: POST /api/products
- **Description**: Adds new products to a company's catalog.
- **Authorization**: Requires authentication and appropriate permissions

### deleteProduct.js
- **Purpose**: Deletes products
- **Endpoint**: DELETE /api/products/:id
- **Description**: Removes products from the system.
- **Authorization**: Requires authentication and appropriate permissions

### getAllProducts.js
- **Purpose**: Retrieves all products
- **Endpoint**: GET /api/products
- **Description**: Gets all products for a company with optional filtering.
- **Authorization**: Requires authentication

### getProductById.js
- **Purpose**: Gets a specific product
- **Endpoint**: GET /api/products/:id
- **Description**: Retrieves detailed information for a specific product.
- **Authorization**: Requires authentication

### updateProduct.js
- **Purpose**: Updates product information
- **Endpoint**: PUT /api/products/:id
- **Description**: Modifies existing product details.
- **Authorization**: Requires authentication and appropriate permissions

## Setup Controllers

Controllers for system setup operations.

### createPlatformAdmin.controller.js
- **Purpose**: Creates platform administrator
- **Endpoint**: POST /api/setup/admin
- **Description**: Sets up the initial platform administrator for the system.
- **Authorization**: Special one-time setup process

## Team Controllers

Controllers for team management.

### invite.controller.js
- **Purpose**: Sends team invitations
- **Endpoint**: POST /api/team/invite
- **Description**: Invites new members to join a company team.
- **Authorization**: Requires authentication and appropriate permissions

### verifyInvite.controller.js
- **Purpose**: Verifies team invitations
- **Endpoint**: GET /api/team/verify-invite/:token
- **Description**: Validates invitation tokens when users accept invites.

## User Controllers

Controllers for user management.

### users.controller.js
- **Purpose**: Manages user operations
- **Endpoints**: 
  - GET /api/users - Gets all users
- **Description**: Provides functionality for user management within a company.
- **Authorization**: Requires authentication and appropriate permissions