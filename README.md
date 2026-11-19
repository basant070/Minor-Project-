# Student–Alumni Connect

A multi-institute platform for connecting university students and alumni. The
repository contains a React frontend and an Express/MongoDB API.

## What the application does

- Students and alumni can register against an active institute and department.
- Registration requires email verification. Alumni accounts begin in a pending
  state until approved.
- Institute administrators manage student and alumni accounts within their
  institute.
- Super administrators manage institutes, administrators, departments, platform
  settings, moderation reports, and platform analytics.
- The frontend includes community screens for profiles, alumni discovery,
  mentorship, events, jobs, messaging, and posts. Some of these screens use
  sample data or local UI state; see the frontend guide for the current API
  boundaries.

## Technology

- **Frontend:** React, Vite, React Router, Tailwind CSS
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB
- **Authentication:** JWT bearer tokens and bcrypt password hashing
- **Email:** Nodemailer over SMTP

## How the code fits together

```text
Browser
  └─ React routes and pages (Frontend/src)
       └─ axiosClient adds the saved JWT to API requests
            └─ Express routes (Backend/src/routes)
                 └─ middleware → controllers → Mongoose models
                      └─ MongoDB
```

The backend is organized around these layers:

- `src/app.js` mounts API route groups and common middleware.
- `src/routes/` defines HTTP paths and access requirements.
- `src/middleware/` validates tokens, roles, permissions, and errors.
- `src/controllers/` implements request handling and business rules.
- `src/models/` defines MongoDB documents and their relationships.
- `src/services/` contains external integrations such as email.

The frontend route table and source map are in [Frontend/README.md](./Frontend/README.md).
Backend setup, environment variables, API groups, and authorization are in
[Backend/README.md](./Backend/README.md).

## Run locally

### Prerequisites

- Node.js and npm
- MongoDB (local or hosted)
- An SMTP account if you want to test registration and verification email

### 1. Configure and run the backend

Open a terminal in `Backend`:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Edit `Backend/.env` first. Set at least `MONGODB_URI` and a private
`JWT_SECRET`. SMTP settings are needed to deliver verification emails. The
backend listens on port `5000` by default.

### 2. Configure and run the frontend

In a second terminal, open `Frontend`:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` by default and uses
`http://localhost:5000/api` unless `VITE_API_URL` is set.

### 3. Create the first super administrator

Set `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, and `SUPER_ADMIN_PASSWORD` in
`Backend/.env`, then, from the `Backend` directory, run:

```powershell
npm run create:super-admin
```

The script refuses to create another super administrator if one already
exists. Treat the `.env` file and its credentials as private; do not commit it.

## Useful commands

Run these from the corresponding project directory:

| Directory | Command | Purpose |
| --- | --- | --- |
| `Backend` | `npm run dev` | Start the API with Nodemon |
| `Backend` | `npm start` | Start the API normally |
| `Backend` | `npm test` | Run Node's built-in test runner |
| `Backend` | `npm run test:email` | Send a test message using SMTP settings |
| `Frontend` | `npm run dev` | Start the Vite development server |
| `Frontend` | `npm run lint` | Run Oxlint |
| `Frontend` | `npm run build` | Create the production frontend build |

## Important notes

- Frontend route protection improves navigation, but backend middleware is the
  authority for API access.
- Tenant-scoped backend queries use the authenticated user's `tenantId`; do
  not remove that scope when changing institute-admin queries.
- AI settings currently report provider configuration and save feature flags;
  a configured provider does not by itself mean AI services are implemented.
