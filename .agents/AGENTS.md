# AGENTS.md — EventsOS High-Assurance Engineering Contract

> **CRITICAL PRIORITY: ZERO COMPROMISE PROTOCOL ($200K+ COMMERCIAL ASSET)**  
> This project handles financial transactions, ticket reservations, credit card checkouts, organizer payouts, and user identity. Any bug, state leak, double-charge, race condition, or security defect represents immediate financial, legal, and reputational liability.  
> Every engineer and AI agent operating in this codebase is bound by this contract.

---

## 1. Core Architectural Mental Model & Topology

EventsOS operates as a dual-application monorepo:
1. **Consumer & Organizer Web (`src/`, Port 3000)**: Discovery, seat reservations, cart locks, secure payment gateway handshakes, QR ticket access, organizer event management, sales analytics.
2. **Admin Back-Office (`apps/admin-web/`, Port 3100)**: High-privilege domain — KYC verifications, payout authorizations, fraud detection, content takedowns, dispute arbitration.

```text
eventsos-auth-web/
├── apps/
│   └── admin-web/              # Administrative Back-Office (Port 3100)
│       ├── src/pages/          # Moderation, Payouts, Fraud, Verifications, Audit Logs
│       └── vite.config.ts
├── src/                        # Main Client & Organizer Application (Port 3000)
│   ├── api/                    # Strictly typed API services (Single Source of Truth)
│   ├── components/             # Atomic design system & domain primitives
│   ├── context/                # AuthContext, NotificationContext, SettingsContext
│   ├── pages/                  # Attendee & Organizer route views
│   ├── routes/                 # ProtectedRoute, GuestRoute, Role-guarded routers
│   ├── types/                  # Shared domain contracts (DTOs, schemas, enums)
│   └── utils/                  # Pure utility functions (formatting, storage, math)
└── AGENTS.md                   # THIS CONTRACT
```

---

## 2. Design Patterns & Architectural Standards

### 2.1 The Repository / API Service Pattern (Non-Negotiable)
- **Zero raw Axios or `fetch()` calls in components or hooks**:
  All network interactions MUST route through [`src/api/client.ts`](file:///Users/kelvin/.gemini/antigravity/scratch/eventsos-auth-web/src/api/client.ts) via domain-specific API files (`auth.ts`, `events.ts`, `orders.ts`, `tickets.ts`, `organizers.ts`).
- **Idempotency on State Mutations**:
  Any operation involving checkout, ticket locks, payment verification, or bank payout initiation MUST support or pass client-generated idempotency keys (`uuidv4()`) to prevent duplicate execution during network retries.

### 2.2 Server State vs. Ambient Client State
- **Server State**: Managed strictly via **`@tanstack/react-query` v5**.
  - Always define explicit `queryKey` tuples: `['events', eventId]`, `['tickets', eventId]`, `['orders', orderId]`.
  - Stale times must be intentional (e.g. real-time ticket availability: 15–30s; static reference data: 5m).
  - Mutate with optimistic updates *only* when rollback logic is explicitly defined and tested.
- **Ambient Client State**: Auth credentials, active organizer scope, toast notifications, and theme settings live in React Contexts.
  - Never store transient server responses in raw local React `useState` when multiple components depend on them.

### 2.3 Strict Validation (Zod Gatekeeper Pattern)
- Every external input (forms, query params, critical API responses) must pass through a **Zod** schema.
- API models must not be trusted implicitly. Validate incoming payment confirmations and token payloads before rendering high-trust states (e.g., ticket QR codes or payment confirmation badges).

### 2.4 Finite State Machines (FSM) for Transactional Flows
- Checkouts, multi-step event wizards, and verification sequences MUST follow strict state machines rather than unstructured boolean flags (`isLoading`, `isFailed`, `isDone`).
- Valid transitions must be codified:
  ```text
  IDLE -> RESERVING_INVENTORY -> PAYMENT_PENDING -> VERIFYING_GATEWAY -> COMPLETED
                                                 \-> PAYMENT_FAILED   -> CANCELLED
  ```
- No component may render the `COMPLETED` screen without cryptographically or server-verified order confirmation.

---

## 3. Financial, Ticketing & High-Value Safety Rules

### 3.1 Financial Calculations & Precision
- **Never calculate floating-point currency in JavaScript without integer quantization**:
  - Store and calculate all monetary quantities in base subunits (cents, kobo, pence) as integers before converting to decimal display.
  - Always use [`src/utils/format.ts`](file:///Users/kelvin/.gemini/antigravity/scratch/eventsos-auth-web/src/utils/format.ts) for display currency (`formatCurrency`). Never do manual template string interpolation (`$${amount}`).

### 3.2 Double-Spend & Double-Click Mitigation
- All buttons initiating payments, ticket tier locks, payouts, or status cancellations MUST immediately disable upon click, display an explicit loading spinner, and debounce against rapid double-tapping.

### 3.3 Inventory & Ticket Reservation Holds
- Cart locks operate on strict server-synchronized countdowns (15-minute standard expiration).
- If the countdown reaches `00:00`, the reservation is automatically voided, UI locks are removed, and the user must be cleanly notified that the hold expired. Never attempt to process a payment after hold expiration.

---

## 4. Security & Compliance Mandates

### 4.1 Token Storage & Token Rotation
- Respect `rememberMe` choices:
  - Persistent login (`rememberMe = true`): store in `localStorage`.
  - Non-persistent login (`rememberMe = false`): store in `sessionStorage`.
- Authorization tokens must never be appended in URL query parameters.
- Token refresh in [`src/api/client.ts`](file:///Users/kelvin/.gemini/antigravity/scratch/eventsos-auth-web/src/api/client.ts) must be queued to prevent race-condition thundering herds on simultaneous 401s.

### 4.2 Anti-Enumeration & Privacy
- Password resets, account status queries, and organization lookups must return generalized, indistinguishable responses regardless of whether an email or ID exists in the backend.
- Resend actions (verification emails, OTPs) must be client- and server-throttled with 15-minute persistent cooldown locks.

### 4.3 Multi-Tenant Isolation (`X-Organizer-UUID`)
- When managing organizer dashboards or executing organizer-scoped mutations, the request interceptor MUST assert `X-Organizer-UUID`.
- Never allow one organizer's context to bleed into another during tenant switching. Clear relevant cached queries in React Query on switch.

---

## 5. UI/UX Excellence & Anti-Slop Directive

1. **Enterprise-Grade Craft**:
   - Every view must look like a tier-1 product (Linear, Stripe, Airbnb).
   - Crisp borders (`border-border/60`), subtle translucent backdrops (`backdrop-blur-md`), dark mode perfection, and fluid animations via `framer-motion`.
2. **Defensive Component Hierarchy**:
   - Before building any new button, input, badge, modal, or dropdown, check and reuse primitives from [`src/components/ui/`](file:///Users/kelvin/.gemini/antigravity/scratch/eventsos-auth-web/src/components/ui/).
   - All interactive elements must have accessible `:focus-visible` styling, hover states, disabled states, and ARIA attributes.
3. **No Placeholders or Generic Alerts**:
   - Never use browser native `alert()`, `confirm()`, or `prompt()`.
   - Never hardcode `lorem ipsum` or unstyled broken images. Use curated fallbacks from [`src/utils/imageUrl.ts`](file:///Users/kelvin/.gemini/antigravity/scratch/eventsos-auth-web/src/utils/imageUrl.ts).

---

## 6. Error Handling & Resilience (Blast-Radius Minimization)

1. **Error Boundaries**:
   - Every major route group (Auth, Organizer, EventDetails, Admin) must be shielded with an Error Boundary so an unhandled exception in one section never causes a white-screen crash for the whole application.
2. **Standardized Error Extraction**:
   - Use `getApiErrorMessage(error)` from [`src/api/client.ts`](file:///Users/kelvin/.gemini/antigravity/scratch/eventsos-auth-web/src/api/client.ts). It standardizes Laravel/Express validation error bodies (`422`), network disconnects, rate limits (`429`), and internal server errors (`500`).
3. **Zero Untyped Catch Blocks**:
   - Catch blocks must inspect errors with type guards or Axios type checks (`axios.isAxiosError(err)`). Never do `catch (e: any) { alert(e); }`.

---

## 7. Pre-Flight Verification & Quality Checklist

Before ANY change is marked complete, the agent MUST run and verify the following commands from the repository root:

```bash
# 1. Zero TypeScript compilation errors in main web
npm run build

# 2. Zero TypeScript compilation errors in admin portal
npm run build:admin

# 3. Linter cleanliness (no new warnings or syntax errors)
npm run lint
```

### Absolute Prohibitions:
- ❌ **No `any` types** (use strict interfaces, generics, or `unknown` with narrowing).
- ❌ **No bypass flags** (do not disable TypeScript checking via `// @ts-ignore` or `// @ts-nocheck`).
- ❌ **No mock data leaks into production endpoints**.
- ❌ **No uncommitted or phantom environment dependencies**.
