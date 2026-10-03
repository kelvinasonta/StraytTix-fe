# EventsOS Authentication Frontend

A production-quality, responsive, and secure frontend implementation for **EventsOS**, integrating with the EventsOS Authentication API v1.

## 🚀 Key Features

- **Split Screen Layout**: Desktop-optimized visual brand card split layout, stacking gracefully into mobile viewports.
- **Dynamic Password Strength Meter**: Real-time evaluation of password complexity (character counts, uppercase, lowercase, numbers, and symbols).
- **Timezone Detection**: Automated browser timezone discovery defaulting to UTC when unavailable.
- **Email Enumeration Mitigation**: Forgot password submissions respond with general confirmations regardless of email existence.
- **Resend Throttle Management**: 15-minute countdown locks for resend actions cached inside local storage to resist page refreshes.
- **Axios Interceptor Layer**: Automatic Bearer token insertion, along with standardized handling of `401 Unauthorized`, `403 Verification Required`, `422 Validation Error`, `429 Rate Limits`, and `500 Server Errors`.
- **Hybrid Storage Strategy**: Abstraction supporting `localStorage` for remembered sessions and `sessionStorage` for temporary visits.
- **Accessibility & Focus States**: Semantic markup, ARIA tags, screen-reader validation announcements, and high contrast focus styles.

---

## 🛠️ Tech Stack

- **React 19** & **TypeScript**
- **Vite 8**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **Axios** (centralized instance)
- **React Router 6**

---

## 📂 Project Structure

```text
src/
├── api/
│   ├── client.ts         # Axios HTTP Client configurations and error parsers
│   └── auth.ts           # Authentication endpoint request wrappers
├── components/
│   ├── auth/
│   │   └── PasswordStrengthMeter.tsx # Real-time password requirement checklist
│   ├── layout/
│   │   └── AuthLayout.tsx # Split screen layout (desktop visual / mobile stack)
│   └── ui/
│       ├── Button.tsx     # Custom Button with loading spinner states
│       └── Input.tsx      # Standardized Inputs with password show/hide toggles
├── context/
│   ├── AuthContext.tsx    # Session states and startup token restore triggers
│   └── NotificationContext.tsx # Stackable toast notifications
├── pages/
│   ├── auth/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── VerifyEmail.tsx
│   │   ├── VerificationPending.tsx
│   │   ├── ForgotPassword.tsx
│   │   └── ResetPassword.tsx
│   ├── dashboard/
│   │   └── Profile.tsx   # Protected user profile area with verification badges
│   ├── Home.tsx          # Branding landing page
│   ├── NotFound.tsx      # 404 page
│   └── ErrorPage.tsx     # 500 error boundary page
├── routes/
│   ├── ProtectedRoute.tsx # Route shield ensuring authenticated sessions
│   └── GuestRoute.tsx     # Guest route shielding login/registration pages
├── types/
│   └── auth.ts           # Shared TypeScript models and requests
├── utils/
│   └── storage.ts        # Storage interface for local/session storage caching
```

---

## ⚙️ Setup and Installation

### 1. Clone & Install Dependencies
Navigate to the project root and install packages:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```bash
cp .env.example .env
```
Provide the base API url:
```env
VITE_API_URL=https://your-domain.com/api/v1
```

### 3. Run Development Server
Start the local Vite server:
```bash
npm run dev
```

### 4. Build for Production
Bundle CSS and JavaScript assets for deployment:
```bash
npm run build
```
This produces compiled static files inside the `dist/` directory.
