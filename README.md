# MentorLagbe API — Backend

MentorLagbe is a full-stack tuition management platform. This repository contains its REST API, authentication integration, database access, role-based business logic, file uploads, and payment processing.

## Key Features

- Student, Tutor, and Admin roles
- Authentication powered by Better Auth
- User profile management
- Tuition creation and management
- Tuition approval workflow
- Student tuition applications
- Tutor applicant management
- Role-based dashboards
- Platform statistics
- Image upload integration
- Stripe Checkout for one-time Pro memberships
- Stripe webhook signature verification
- Centralized API responses and error handling
- MongoDB indexes and collection validators
- Security middleware and CORS configuration

## Technology Stack

| Category | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Language | TypeScript |
| Database | MongoDB |
| Authentication | Better Auth |
| Validation | Zod |
| Payment | Stripe |
| File Upload | Multer |
| Security Headers | Helmet |
| CORS | cors |
| Logging | Morgan |
| Environment | dotenv |

## Architecture

The backend uses a modular architecture.

```text
mentorlagbe-server/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   ├── lib/
│   ├── middleware/
│   ├── modules/
│   │   ├── admin/
│   │   ├── applications/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── payments/
│   │   ├── statistics/
│   │   ├── tuitions/
│   │   ├── uploads/
│   │   └── users/
│   ├── repositories/
│   ├── scripts/
│   ├── types/
│   └── utils/
├── package.json
└── README.md
```

Each feature module separates responsibilities such as routes, controllers, services, and validation where applicable.

## API Overview

Base URL:

`http://localhost:5000`

### Health Check

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check API availability |

### API Modules

| Prefix | Responsibility |
|---|---|
| `/api/auth` | Better Auth endpoints |
| `/api/users` | User and profile operations |
| `/api/tuitions` | Tuition management |
| `/api/applications` | Tuition applications |
| `/api/dashboard` | Dashboard data |
| `/api/admin` | Administrative operations |
| `/api/statistics` | Platform statistics |
| `/api/uploads` | File uploads |
| `/api/payments` | Checkout and payment history |
| `/api/payments/webhook` | Stripe webhook receiver |

Individual endpoints and their validation rules are maintained in their respective route and validation files.

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB database
- MentorLagbe frontend for local full-stack development

### 1. Clone the repository

```bash
git clone https://github.com/arafat11223/mentorlagbe-server.git
cd mentorlagbe-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

**PowerShell:**

```powershell
Copy-Item .env.example .env
```

Configure the values privately in `.env`.

| Variable | Purpose |
|---|---|
| `NODE_ENV` | Runtime environment |
| `PORT` | API server port |
| `CLIENT_URL` | Allowed frontend origin |
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | Database name |
| `BETTER_AUTH_SECRET` | Better Auth secret |
| `BETTER_AUTH_URL` | Authentication base URL |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `IMGBB_API_KEY` | Image upload API key |

Never commit `.env` or publish credentials.

### 4. Start development server

```bash
npm run dev
```

Default local API:

http://localhost:5000

### 5. Verify server health

Open:

http://localhost:5000/health

A successful response indicates that the API server is running.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server with file watching |
| `npm run build` | Compile TypeScript |
| `npm run start` | Start compiled server |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run admin:promote` | Run the admin promotion script |

The current `npm test` script is a placeholder and is not an implemented automated test suite.

## Database

Database:

`mentorlagbe`

Main application collections include:

- `users`
- `tuitions`
- `applications`
- `payments`

Better Auth also maintains its authentication-related data.

Database initialization includes index creation and collection validation.

## Authentication and Authorization

The application supports three roles:

- Student
- Tutor
- Admin

Protected operations use authenticated user context and role-based authorization.

Better Auth handles authentication integration.

## Tuition and Application Workflow

- Tutors create tuition posts.
- New tuition posts enter the pending approval workflow.
- Administrators review tuition posts.
- Students can apply to approved, active tuition posts.
- Tutors manage applications submitted to their own tuition posts.

## Membership and Payments

MentorLagbe offers one-time Pro memberships:

| Plan | Price |
|---|---:|
| Student Pro | USD 10 |
| Tutor Pro | USD 15 |

Stripe Checkout is used for payment collection.

The backend verifies Stripe webhook signatures and validates completed payment details before activating membership.

A pending checkout return page is not proof of a successful payment.

**Testing status:** Final Stripe Sandbox checkout-to-webhook verification remains pending.

## Security Notes

- Keep all secret keys in local environment variables.
- Never expose Stripe secret keys or webhook signing secrets.
- Configure the frontend origin correctly using `CLIENT_URL`.
- Use HTTPS and production-specific secrets in a properly configured production deployment.
- Do not use test credentials for live transactions.

## Related Repository

Frontend repository:

https://github.com/arafat11223/mentorlagbe-client

## Project Status

Core backend implementation is complete. Final Stripe Sandbox payment verification remains pending.

## License

This repository is maintained as a portfolio project.
