# Backend guide

This guide explains the backend in everyday language first, then gives the
technical details needed to run or change it.

## What is the backend?

The frontend is the part of the website people see and click. The backend works
behind the scenes. It receives requests from the website, checks whether the
request is allowed, reads or changes information in the database, and sends a
reply.

For example, when someone logs in, the backend checks their email and password.
If they are allowed to sign in, it gives the browser a signed access token. The
browser sends that token with future requests so the backend can check who is
asking.

Think of the backend as a university office:

- The **routes** are the office windows for different requests.
- The **middleware** checks identity and permission before someone reaches a
  window.
- The **controllers** do the requested work.
- The **models** describe the records kept in the filing system.
- **MongoDB** is the filing system where records are stored.
- The email service sends messages such as verification links.

Some of these technical words are explained again in the glossary at the end.

## What happens to a request?

1. Someone uses the website, such as submitting a registration form.
2. The browser sends the information to an API address.
3. The backend finds the matching route and checks any sign-in or role rules.
4. A controller checks the information and performs the requested task.
5. If needed, a model reads or saves records in MongoDB.
6. The backend returns a success message or an explanation of the problem.

In the code, that path is:

```text
Browser
  -> src/app.js
  -> src/routes/
  -> src/middleware/ and src/controllers/
  -> src/models/
  -> MongoDB
```

If a request fails unexpectedly, the shared error handler in
`src/middleware/error.middleware.js` creates the API error response.

## Registration and sign-in, step by step

1. A student or alumnus chooses an active institute and department, then enters
   their details.
2. The backend checks that the institute and department exist and are active,
   that registration is open, and that the email is not already in use.
3. The backend saves the account. It stores a protected version of the password,
   not the original password.
4. The backend sends an email verification link. If email delivery fails, the
   account is still created and the user can request another verification
   email.
5. The user must verify their email before signing in. Alumni accounts also
   start in a pending state and must be approved before they can sign in.
6. After a successful sign-in, the backend returns a signed access token. The
   browser includes it with requests that need an authenticated user.

## Who can do what?

| Account type | In everyday language |
| --- | --- |
| Student | Can create an account for an active institute and department. |
| Alumni | Can create an account; after email verification, the account remains pending until approved. |
| Institute admin | Can view students and alumni for their own institute and remove accounts there, when the required permission is enabled. |
| Super admin | Manages the platform across institutes, including institutes, accounts, departments, settings, and reports. |

An institute is also called a **tenant** in the code and database. Regular
accounts belong to one institute. A super-admin account is platform-wide and
does not belong to a single institute.

## What the backend currently handles

All API addresses begin with `/api`.

| Address | What it is for | Access |
| --- | --- | --- |
| `/api/auth` | Register, sign in, verify email, resend verification, and get the signed-in user's basic profile. | Registration and sign-in are public; profile requires sign-in. |
| `/api/tenants` | Show active institutes and their active departments so a person can register. | Public. |
| `/api/institute-admin` | List students and alumni for an institute, or remove an account from that institute. | Institute admin with the required permission. |
| `/api/super-admin` | Manage platform-wide data and settings. | Super admin only. |
| `/api/test` | Check that role-based access rules are working. | Signed-in users with the matching role. |

Some example API addresses:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/verify-email?token=...
POST /api/auth/resend-verification
GET  /api/auth/profile
GET  /api/tenants
GET  /api/tenants/:tenantId/departments
GET  /api/institute-admin/students
GET  /api/institute-admin/alumni
GET  /api/super-admin/dashboard
```

The words at the beginning describe the request:

- **GET** asks to view information.
- **POST** sends information or creates something.
- **PATCH** changes part of an existing record.
- **DELETE** removes a record.

The super-admin API also has addresses for managing institutes, administrators,
users, departments, settings, moderation reports, analytics, AI status, and
audit logs. The exact paths and allowed request types are listed in
`src/routes/superAdminRoutes.js`.

## What is stored in the database?

The backend uses MongoDB. These models describe the main kinds of records:

| Record | What it represents |
| --- | --- |
| `User` | A person's account, role, institute, department, email-verification state, and account status. |
| `Tenant` | An institute, including whether it is active. |
| `Department` | A department that belongs to one institute. |
| `PlatformSettings` | Platform-wide switches, such as maintenance mode and whether registration is open. |
| `ModerationReport` | A report that a super admin can review and update. |
| `AdminAuditLog` | A record of successful super-admin changes. |

## How access is protected

- Passwords are hashed before they are stored.
- A signed token is like a temporary pass that identifies the user. It expires
  after the configured time; the default is one day.
- The backend checks the token and account status before allowing protected
  requests. Routes tied to an institute also check that the institute is active.
- Role checks limit certain requests to institute admins or super admins.
- Institute-admin queries are restricted to the admin's own institute.
- The frontend also hides pages from some users, but that is only for navigation.
  The backend is responsible for enforcing access.

## Current limits to know about

- Community content such as posts, jobs, events, and messages is not currently
  saved through backend API routes. Parts of those screens use sample data or
  temporary browser state.
- The profile API currently returns a user's information; there is no profile
  update route.
- The AI status screen reports whether a provider key is configured and shows
  feature switches. It does not run AI recommendations or mentor matching.
- Analytics currently reports account counts. It does not collect general
  activity, speed, or uptime measurements.
- `/api/test` is a role-checking route, not a normal community feature.
- `npm test` currently finds zero automated tests. A successful test command
  therefore does not yet verify the backend's behavior.

## Run the backend on your computer

You need Node.js, npm, and a MongoDB database. An SMTP email account is needed
if you want the backend to send verification and welcome emails.

Open a terminal at the project folder, move into `Backend`, and run:

```powershell
cd Backend
Copy-Item .env.example .env
npm install
npm run dev
```

Then open `Backend/.env` and replace the example values with your own. The
backend listens on port `5000` by default.

The database and email settings matter:

- Without `MONGODB_URI`, the server can start, but database-backed features
  cannot work.
- Without valid email settings, the server can start, but it cannot send
  verification or welcome emails.
- `CLIENT_URL` should be the address where the frontend runs. It is also used
  for browser links in emails.

### Environment settings

| Setting | What it means |
| --- | --- |
| `PORT` | The port used by the backend. Defaults to `5000`. |
| `MONGODB_URI` | The connection address for the MongoDB database. |
| `JWT_SECRET` | A private key the backend uses to create and check sign-in tokens. Keep it secret. |
| `JWT_EXPIRES_IN` | How long a sign-in token lasts. Defaults to `1d` (one day). |
| `CLIENT_URL` | The frontend's address, used for CORS and links in email. |
| `EMAIL_HOST`, `EMAIL_PORT` | The email provider's SMTP server and port. |
| `EMAIL_USER`, `EMAIL_PASSWORD` | The email account used to send messages. |
| `EMAIL_FROM` | The sender address shown in outgoing messages. |
| `SUPER_ADMIN_NAME`, `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD` | Details used only when creating the first super-admin account. The password must be at least 12 characters. |
| `AI_PROVIDER_API_KEY`, `AI_PROVIDER_NAME` | Optional values used to show AI provider configuration in the super-admin screen. They do not connect an AI feature by themselves. |

Never share or commit your real `.env` file. The `.env.example` file contains
placeholders, not working credentials.

## Create the first super admin

The first super admin is created from a one-time command, not from public
registration. Add the three `SUPER_ADMIN_*` values to `Backend/.env`, then run
this command from the `Backend` folder:

```powershell
npm run create:super-admin
```

The command refuses to create another super admin if one already exists.

## Useful commands

Run these commands from the `Backend` folder:

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the backend and restarts it when code changes. |
| `npm start` | Starts the backend normally. |
| `npm run create:super-admin` | Creates the first platform-wide administrator. |
| `npm run test:email` | Checks email settings and sends a test email. |
| `npm test` | Runs automated tests. There are currently no backend tests. |

## Where to look in the code

| File or folder | Plain-language purpose |
| --- | --- |
| `src/server.js` | Loads settings, connects to the database, and starts the server. |
| `src/app.js` | Connects API addresses to their route groups and common checks. |
| `src/routes/` | Lists the API addresses and who is allowed to use them. |
| `src/controllers/` | Contains the work done for each request. |
| `src/middleware/` | Contains reusable sign-in, role, permission, and error checks. |
| `src/models/` | Describes the records saved in MongoDB. |
| `src/config/database.js` | Connects the backend to MongoDB. |
| `src/services/emailService.js` | Sets up email delivery and sends email messages. |
| `src/utils/tenantScope.js` | Helps keep institute-admin searches within their own institute. |
| `scripts/` | Contains one-time or diagnostic commands, such as creating the first super admin. |

## Small glossary

| Word | Meaning |
| --- | --- |
| API | The set of addresses the website uses to ask the backend for information or actions. |
| Database | The place where saved accounts, institutes, departments, and other records live. |
| Middleware | A check that runs before a request reaches its main task, such as checking a user's sign-in or role. |
| MongoDB | The database product used by this project. |
| SMTP | A standard way for the backend to send email through an email provider. |
| Tenant | The backend's technical word for an institute and the data belonging to it. |
| Token | A signed, temporary pass the browser sends to prove which user is signed in. |

For how the browser side connects to this API, see
[the frontend guide](../Frontend/README.md). For setup of the whole application,
see the [project guide](../README.md).
