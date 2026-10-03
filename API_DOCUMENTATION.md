# EventsOS API Reference & Integration Documentation

## Base URL
```
Development: http://localhost:8000/api/v1
Production:  Configured via VITE_API_BASE_URL (or VITE_API_URL)
```

All requests expect standard headers:
```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <access_token>
X-Organizer-UUID: <active_organizer_uuid> (optional, automatically attached when active)
```

---

## 1. Authentication (`/auth`)

### 1.1 Register User
- **Method:** `POST`
- **URL:** `/auth/register`
- **Request Payload:**
```json
{
  "firstName": "Kelvin",
  "lastName": "Okonkwo",
  "email": "kelvin@example.com",
  "password": "Password123!",
  "accountType": "organizer"
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "id": "usr-9281928",
      "firstName": "Kelvin",
      "lastName": "Okonkwo",
      "email": "kelvin@example.com",
      "accountType": "organizer"
    },
    "organizer": {
      "id": "org-52cf6f41-a41f-4f56-b354-8c620edc2c36",
      "name": "Apex Events Ltd",
      "slug": "apex-events-ltd",
      "type": "organization"
    },
    "token": "1|laravel_sanctum_personal_access_token..."
  }
}
```

### 1.2 Login User
- **Method:** `POST`
- **URL:** `/auth/login`
- **Request Payload:**
```json
{
  "email": "kelvin@example.com",
  "password": "Password123!"
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Authenticated successfully.",
  "data": {
    "user": {
      "id": "usr-9281928",
      "firstName": "Kelvin",
      "lastName": "Okonkwo",
      "email": "kelvin@example.com",
      "accountType": "organizer"
    },
    "organizer": {
      "id": "org-52cf6f41-a41f-4f56-b354-8c620edc2c36",
      "name": "Apex Events Ltd",
      "slug": "apex-events-ltd",
      "type": "organization"
    },
    "token": "2|laravel_sanctum_personal_access_token..."
  }
}
```

### 1.3 Get Current Profile
- **Method:** `GET`
- **URL:** `/auth/me`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Profile retrieved.",
  "data": {
    "user": {
      "id": "usr-9281928",
      "firstName": "Kelvin",
      "lastName": "Okonkwo",
      "email": "kelvin@example.com",
      "accountType": "organizer"
    },
    "organizer": {
      "id": "org-52cf6f41-a41f-4f56-b354-8c620edc2c36",
      "name": "Apex Events Ltd",
      "slug": "apex-events-ltd",
      "type": "organization"
    }
  }
}
```

---

## 2. Public Events Discovery (`/explore`)

### 2.1 Discover Events List
- **Method:** `GET`
- **URL:** `/explore/events`
- **Query Parameters:**
  - `page`: Page number (default: 1)
  - `per_page`: Items per page (default: 12)
  - `search`: Search query string
  - `category`: Category name filter
  - `eventType`: Filter by format (`physical` | `virtual`)
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "52cf6f41-a41f-4f56-b354-8c620edc2c36",
      "slug": "pussy-hunt",
      "title": "Pussy Hunt",
      "description": "Exclusive festival gathering.",
      "category": "Party",
      "eventFormat": "Festival",
      "status": "Published",
      "bannerUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
      "startDate": "2026-09-25",
      "startTime": "20:00",
      "endDate": "2026-09-26",
      "endTime": "04:00",
      "city": "Lagos",
      "state": "Lagos",
      "country": "Nigeria",
      "venueName": "Wave Beach",
      "tickets": []
    }
  ],
  "meta": {
    "current_page": 1,
    "last_page": 1,
    "per_page": 12,
    "total": 1
  }
}
```

### 2.2 Event Details by Slug / UUID
- **Method:** `GET`
- **URL:** `/explore/events/{slug_or_id}`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "id": "52cf6f41-a41f-4f56-b354-8c620edc2c36",
    "slug": "pussy-hunt",
    "title": "Pussy Hunt",
    "description": "Exclusive festival gathering.",
    "category": "Party",
    "eventFormat": "Festival",
    "status": "Published",
    "bannerUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
    "startDate": "2026-09-25",
    "startTime": "20:00",
    "endDate": "2026-09-26",
    "endTime": "04:00",
    "city": "Lagos",
    "country": "Nigeria",
    "venueName": "Wave Beach",
    "organizer": {
      "id": "org-52cf6f41-a41f-4f56-b354-8c620edc2c36",
      "name": "Apex Events Ltd",
      "slug": "apex-events-ltd"
    }
  }
}
```

---

## 3. Ticket Types Management (`/events/{eventUuid}/ticket-types`)

### 3.1 Get Ticket Types for Event
- **Method:** `GET`
- **URL:** `/events/{eventUuid}/ticket-types`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "9f7a9420-562a-4df0-bd61-12c823098514",
      "name": "Squad Table for 5",
      "type": "paid",
      "ticketType": "group",
      "ticket_type": "group",
      "groupSize": 5,
      "group_size": 5,
      "description": "Admits 5 guests together with VIP table service.",
      "ticketCapacity": "limited",
      "quantity": 20,
      "remainingQuantity": 20,
      "soldQuantity": 0,
      "price": 75000,
      "currency": "NGN",
      "status": "active"
    }
  ]
}
```

### 3.2 Create Ticket Type (Single or Group)
- **Method:** `POST`
- **URL:** `/events/{eventUuid}/ticket-types`
- **Request Payload:**
```json
{
  "name": "Squad Table for 5",
  "type": "paid",
  "ticket_type": "group",
  "ticketType": "group",
  "group_size": 5,
  "groupSize": 5,
  "description": "Group pass admitting 5 guests.",
  "ticket_capacity": "limited",
  "quantity": 20,
  "price": 75000,
  "currency": "NGN",
  "status": "active"
}
```
*For a single ticket:*
```json
{
  "name": "Early Bird Access",
  "type": "paid",
  "ticket_type": "single",
  "ticketType": "single",
  "group_size": 1,
  "groupSize": 1,
  "description": "General single attendee admission.",
  "ticket_capacity": "limited",
  "quantity": 150,
  "price": 10000,
  "currency": "NGN",
  "status": "active"
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Ticket type created successfully.",
  "data": {
    "id": "9f7a9420-562a-4df0-bd61-12c823098514",
    "name": "Squad Table for 5",
    "type": "paid",
    "ticketType": "group",
    "ticket_type": "group",
    "groupSize": 5,
    "group_size": 5,
    "price": 75000,
    "currency": "NGN",
    "quantity": 20,
    "remainingQuantity": 20,
    "status": "active"
  }
}
```

### 3.3 Update Ticket Type
- **Method:** `PUT`
- **URL:** `/ticket-types/{ticketTypeUuid}`
- **Request Payload:**
```json
{
  "name": "Squad Table for 5 (Tier 1)",
  "price": 85000,
  "ticket_type": "group",
  "group_size": 5,
  "quantity": 25
}
```
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Ticket type updated successfully.",
  "data": {
    "id": "9f7a9420-562a-4df0-bd61-12c823098514",
    "name": "Squad Table for 5 (Tier 1)",
    "price": 85000,
    "quantity": 25
  }
}
```

### 3.4 Delete Ticket Type
- **Method:** `DELETE`
- **URL:** `/ticket-types/{ticketTypeUuid}`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Ticket type deleted successfully.",
  "data": null
}
```

---

## 4. Attendee Issued Tickets (`/tickets`)

### 4.1 Get Customer's Purchased Tickets
- **Method:** `GET`
- **URL:** `/tickets`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Tickets retrieved successfully.",
  "data": [
    {
      "id": "tkt-7c159239-0129-4b10-a920-819920192831",
      "ticketNumber": "TK-2026-09281",
      "pricePaid": 75000,
      "currency": "NGN",
      "status": "valid",
      "qrCode": "https://eventsos.live/verify/TK-2026-09281",
      "event": {
        "id": "52cf6f41-a41f-4f56-b354-8c620edc2c36",
        "title": "Pussy Hunt",
        "slug": "pussy-hunt",
        "startDate": "2026-09-25",
        "venueName": "Wave Beach",
        "bannerUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200"
      },
      "ticketType": {
        "name": "Squad Table for 5",
        "type": "paid",
        "groupSize": 5
      }
    }
  ]
}
```

### 4.2 Book / Issue Ticket
- **Method:** `POST`
- **URL:** `/tickets`
- **Request Payload:**
```json
{
  "ticket_type_uuid": "9f7a9420-562a-4df0-bd61-12c823098514"
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Ticket issued successfully.",
  "data": {
    "id": "tkt-7c159239-0129-4b10-a920-819920192831",
    "ticketNumber": "TK-2026-09281",
    "pricePaid": 75000,
    "currency": "NGN",
    "status": "valid",
    "qrCode": "https://eventsos.live/verify/TK-2026-09281"
  }
}
```

---

## 5. Organizer Event Management (`/organizers/{organizerUuid}/events`)

### 5.1 Get Organizer Events
- **Method:** `GET`
- **URL:** `/organizers/{organizerUuid}/events`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    {
      "id": "52cf6f41-a41f-4f56-b354-8c620edc2c36",
      "title": "Pussy Hunt",
      "slug": "pussy-hunt",
      "category": "Party",
      "eventFormat": "Festival",
      "status": "Published",
      "startDate": "2026-09-25",
      "startTime": "20:00",
      "endDate": "2026-09-26",
      "endTime": "04:00"
    }
  ]
}
```

### 5.2 Create Event
- **Method:** `POST`
- **URL:** `/organizers/{organizerUuid}/events`
- **Request Payload:**
```json
{
  "title": "Lagos Tech Expo 2026",
  "description": "Annual flagship technology and startups gathering.",
  "eventCategory": ["Technology", "Conference"],
  "eventFormat": "Conference",
  "eventType": "physical",
  "venueName": "Landmark Event Centre",
  "city": "Lagos",
  "state": "Lagos",
  "country": "Nigeria",
  "startDate": "2026-10-15",
  "startTime": "09:00",
  "endDate": "2026-10-16",
  "endTime": "18:00",
  "scheduleType": "single",
  "scheduleTimezone": "Africa/Lagos",
  "status": "published",
  "visibility": "public",
  "bannerUrl": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200",
  "isFeatured": true
}
```
- **Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Event created successfully.",
  "data": {
    "id": "68ea1023-1129-4ab3-9c88-129039120938",
    "slug": "lagos-tech-expo-2026",
    "title": "Lagos Tech Expo 2026",
    "status": "Published"
  }
}
```

### 5.3 State Transitions: Publish / Cancel / Archive
- `POST /organizers/{organizerUuid}/events/{eventUuid}/publish`
- `POST /organizers/{organizerUuid}/events/{eventUuid}/cancel` (Payload: `{ "reason": "Weather conditions" }`)
- `POST /organizers/{organizerUuid}/events/{eventUuid}/archive`

---

## 6. Favorites (`/events/favorites`)

### 6.1 Toggle Favorite Status
- **Method:** `POST`
- **URL:** `/events/favorites/{eventUuid}/toggle`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": {
    "favorited": true,
    "eventId": "52cf6f41-a41f-4f56-b354-8c620edc2c36",
    "message": "Event added to favorites."
  }
}
```

### 6.2 Get Favorite Event IDs
- **Method:** `GET`
- **URL:** `/events/favorites/ids`
- **Response (`200 OK`):**
```json
{
  "success": true,
  "data": [
    "52cf6f41-a41f-4f56-b354-8c620edc2c36"
  ]
}
```
