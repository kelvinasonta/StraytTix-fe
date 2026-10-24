# StraytTix Web Platform

A high-performance, modern event discovery, ticketing, organizer management, and administrative platform built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS v4**.

---

## 🌟 Overview

StraytTix is an end-to-end event operating system consisting of two primary applications:

1. **Client & Organizer Web App (`src/`)**: Event discovery, interactive seat/ticket booking, checkout flow, user authentication, profile & favorites management, and organizer event creation and analytics.
2. **Admin Web Portal (`apps/admin-web/`)**: Dedicated administrative back-office featuring moderation, order auditing, refunds & payouts management, fraud monitoring, feature flags, and support escalation.

---

## ✨ Features

### 🎟️ User & Attendee Experience
- **Event Discovery**: Filter and search events by category, date, location, pricing, and tags with real-time feedback.
- **Event Details & Interactive Maps**: Detailed event views with rich media, venue maps (MapLibre GL), agenda schedules, and organizer profiles.
- **Ticketing & Checkout**: Tiered ticket selection, promo code validation, cart timers, and multi-gateway checkout modal.
- **Favorites & Bookmarks**: Save favorite events with synchronized client-side and remote state.
- **User Dashboard**: Manage booked tickets, purchase history, order statuses, and profile information.

### 🏢 Organizer Workspace
- **Event Creation & Editing**: Multi-step wizard supporting event branding, dates, locations, ticket tiers, capacities, and sales schedules.
- **Event Management**: Attendee roster tracking, check-in validation, and tier adjustments.
- **Analytics & Reporting**: Real-time sales metrics, revenue curves, conversion rates, and ticket inventory tracking.
- **Payout & Organization Settings**: Bank account setup, organization verification, and team permissions.

### 🛡️ Authentication & Security
- **Multi-Factor / Email Verification**: Secure registration, email activation token validation, and resend rate-limiting.
- **Password Hygiene**: Interactive password strength meter evaluating complexity and entropy in real-time.
- **Session Management**: Dual storage strategy (`localStorage` vs. `sessionStorage`), automated Bearer token injection, and proactive token refresh via Axios interceptors.
- **Access Guarding**: Role-based routing protecting Attendee, Organizer, and Admin routes.

### ⚙️ Admin Portal (`apps/admin-web`)
- **Overview & KPI Dashboard**: Platform-wide metrics, gross merchandise value (GMV), active events, and user growth.
- **Moderation & Verification**: Event approval workflow, organizer KYC/identity verification review.
- **Financial Operations**: Payout processing, refund approvals, and chargeback oversight.
- **Platform Health & Security**: Fraud anomaly monitoring, audit logs, feature flags toggles, and system announcements.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Framework & Core** | [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/), [Vite 8](https://vite.dev/) |
| **Styling & UI** | [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`), [Lucide React](https://lucide.dev/), [Framer Motion](https://www.framer.com/motion/) |
| **State & Data Fetching** | [@tanstack/react-query v5](https://tanstack.com/query/latest), Context API, [Axios](https://axios-http.com/) |
| **Validation & Schema** | [Zod](https://zod.dev/) |
| **Routing** | [React Router 7](https://reactrouter.com/) |
| **Maps & Geospatial** | [MapLibre GL](https://maplibre.org/) |
| **Code Quality** | [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) |

---

## 📁 Repository Structure

```text
strayttix-auth-web/
├── apps/
│   └── admin-web/               # Standalone Admin Portal
│       ├── src/
│       │   ├── components/      # Admin UI components & navigation layouts
│       │   ├── pages/           # Admin pages (Payouts, Fraud, Moderation, etc.)
│       │   └── types/           # Admin TypeScript interfaces
│       ├── package.json
│       └── vite.config.ts       # Runs on port 3100
├── public/                      # Static brand assets, favicons, illustrations
├── src/                         # Main Web & Organizer Application
│   ├── api/                     # Centralized Axios client & API endpoints
│   │   ├── auth.ts              # Authentication endpoints
│   │   ├── client.ts            # Interceptor & error normalization pipeline
│   │   ├── events.ts            # Event catalog & CRUD endpoints
│   │   ├── orders.ts            # Ticket orders & checkout APIs
│   │   ├── organizers.ts        # Organizer profile & analytics
│   │   └── tickets.ts           # Ticket tier APIs
│   ├── components/              # Modular UI library
│   │   ├── auth/                # Password strength, login form helpers
│   │   ├── checkout/            # Checkout modals & payment forms
│   │   ├── events/              # Event cards, hero headers, filter bars
│   │   ├── layout/              # Navbar, Footer, AuthLayout
│   │   └── ui/                  # Buttons, inputs, modals, toasts, badges
│   ├── context/                 # Global state providers (Auth, Notifications, Settings)
│   ├── pages/                   # Application views (Home, Discover, EventDetails, etc.)
│   │   ├── auth/                # Auth workflows (Login, Register, Forgot Password)
│   │   ├── checkout/            # Order confirmation & checkout pages
│   │   ├── dashboard/           # User account & ticket wallet
│   │   └── organizer/           # Organizer dashboard, create/manage event
│   ├── routes/                  # ProtectedRoute, GuestRoute, and App routing
│   ├── types/                   # Domain TypeScript models
│   └── utils/                   # Helpers for dates, storage, currency, and images
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts               # Runs on port 3000
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher (Recommended: `v22.x`)
- **npm**: `v10.x` or higher

### 1. Installation

Clone the repository and install dependencies at the root:

```bash
git clone https://github.com/your-username/strayttix-auth-web.git
cd strayttix-auth-web
npm install
```

To install dependencies for the admin sub-application:

```bash
npm --prefix apps/admin-web install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Open `.env` and configure your API URL:

```env
# StraytTix API Base URL (without trailing slash)
VITE_API_BASE_URL=https://api.strayttix.example.com/api/v1
```

*(Optional)* Configure an environment file for `apps/admin-web/.env` if connecting to a separate admin backend URL.

### 3. Development

Run the main client web application (runs at [http://localhost:3000](http://localhost:3000)):

```bash
npm run dev
```

Run the admin web portal in parallel (runs at [http://localhost:3100](http://localhost:3100)):

```bash
npm run dev:admin
```

---

## 📜 Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts the main web app in development mode on port `3000` |
| `npm run dev:admin` | Starts the admin portal dev server on port `3100` |
| `npm run build` | Typechecks and compiles production bundle to `dist/` |
| `npm run build:admin`| Typechecks and compiles admin portal to `apps/admin-web/dist/` |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs fast code diagnostics using Oxlint |

---

## 🔒 Security Best Practices

- **Token Safety**: Tokens are dynamically retrieved and injected via Axios request interceptors.
- **CSRF & Injection Defense**: Parameterized API calls with Zod schema validation for user payloads.
- **Email Enumeration Safeguards**: Generic, uniform messaging on forgot-password endpoints prevents account harvesting.
- **Throttle Defense**: Client-side storage timestamps enforce countdown locks on critical actions like email verification resends.

---

## 📄 License

This project is proprietary and confidential. All rights reserved.
