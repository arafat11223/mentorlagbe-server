# MentorLagbe — API Overview

## 1. Overview

The MentorLagbe backend exposes REST API modules through an Express application.

Base URL for local development:

http://localhost:5000

## 2. API Modules

| Prefix | Responsibility |
|---|---|
| `/api/auth` | Better Auth authentication endpoints |
| `/api/users` | User and profile operations |
| `/api/tuitions` | Tuition management |
| `/api/statistics` | Platform statistics |
| `/api/dashboard` | Role-based dashboard data |
| `/api/admin` | Administrative operations |
| `/api/uploads` | Image upload operations |
| `/api/applications` | Tuition applications |
| `/api/payments` | Checkout sessions and payment history |

The exact HTTP methods, request schemas, and response formats should be read from the corresponding route, controller, and validation files.

## 3. Health Check

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | Check API server health |

## 4. Authentication

Better Auth is mounted under:

`/api/auth`

Protected application endpoints require an authenticated session.

## 5. Role-Based Access

The platform supports three roles:

- Student
- Tutor
- Admin

Access to protected operations depends on the authenticated user's role and resource ownership.

## 6. Payment Endpoints

The payment module is mounted under:

`/api/payments`

The Stripe webhook endpoint is:

`POST /api/payments/webhook`

The webhook requires the raw request body for Stripe signature verification and is mounted before the JSON body parser.

## 7. Error Handling

The Express application uses centralized not-found and error-handling middleware.

## 8. Local Development

Start the backend:

```bash
npm install
npm run dev
```

Default local server:

http://localhost:5000

## 9. Important Notes

- Never expose environment secrets in API responses or documentation.
- Never trust client-submitted membership prices.
- Payment confirmation must be based on verified webhook events.
- Verify exact endpoint contracts from the implementation before integrating external clients.

