# Frontend guide

The frontend is a React single-page application built with Vite. It uses
React Router for navigation, Tailwind CSS for styling, and Axios for most
backend requests.

## Setup

From the `Frontend` directory:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

The development server normally runs at `http://localhost:5173`.

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend API base URL, including `/api`. Defaults to `http://localhost:5000/api`. |

Use the scripts below from this directory:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run lint` | Run Oxlint. |
| `npm run build` | Create the production bundle in `dist/`. |
| `npm run preview` | Preview the production bundle locally. |

## Routes and page ownership

Routes are declared in `src/App.jsx`.

| Route | Page/component | Purpose |
| --- | --- | --- |
| `/` | `pages/LandingPage.jsx` | Public landing page. |
| `/login` | `pages/Login.jsx` | Sign in. |
| `/register` | `pages/Register.jsx` | Student/alumni registration. |
| `/verify-email` | `pages/VerifyEmail.jsx` | Verify an email-address token. |
| `/student` | `pages/CommunityPortal.jsx` → `pages/PortalPage.jsx` | Student community dashboard. |
| `/alumni` | `pages/CommunityPortal.jsx` → `pages/PortalPage.jsx` | Alumni community dashboard. |
| `/institute-admin` | `pages/InstituteAdminPortal.jsx` → `pages/PortalPage.jsx` | Institute-admin dashboard. |
| `/super-admin` | `pages/SuperAdminDashboard.jsx` | Platform-wide administration. |
| `/home` | `AuthenticatedHome` in `App.jsx` | Redirect to the signed-in user's role home. |

`ProtectedRoute` checks whether a user is signed in and has the route's allowed
role. The backend still performs its own authorization; frontend checks are
not a security boundary.

## Source map

| Location | Responsibility |
| --- | --- |
| `src/main.jsx` | Loads global CSS, sets the initial theme, and mounts React. |
| `src/App.jsx` | Mounts providers and declares application routes. |
| `src/auth/` | Authentication context, session restoration, and protected routes. |
| `src/theme/` | Shared light/dark theme state and local-storage persistence. |
| `src/api/axiosClient.js` | API base URL and bearer-token request interceptor. |
| `src/pages/` | Route-level screens and dashboard page composition. |
| `src/components/` | Reusable navigation, cards, forms, dialogs, and the shared footer. |
| `src/data.js` | Shared sample data and UI constants. |
| `src/index.css` | Tailwind import, global styles, and light/dark color tokens. |

## Sign-in and API request flow

1. `AuthProvider` in `src/auth/authContext.jsx` restores a saved `authToken`
   by requesting `/auth/profile`.
2. Login stores the token in browser `localStorage`; logout removes it.
3. `src/api/axiosClient.js` adds the token as an
   `Authorization: Bearer ...` header when present.
4. `ProtectedRoute` redirects unauthenticated users to `/login` and sends users
   with the wrong role to their own role home.
5. Backend middleware independently verifies tokens, account status, role, and
   tenant access.

## Dashboard data

`CommunityPortal.jsx` loads the signed-in user's institute and passes user,
toast, confirmation, and logout behavior to `PortalPage.jsx`. The institute
admin route uses `InstituteAdminPortal.jsx` to load its institute context and
then uses the same `PortalPage.jsx` screen.

The super-admin screen is in `SuperAdminDashboard.jsx` and calls the
`/super-admin` API endpoints. The community UI also contains prototype
features; many example posts, events, jobs, profiles, and interactions come
from `src/data.js` or local component state rather than persisted backend
endpoints. Check the relevant component and backend route before assuming a
screen's data is stored in MongoDB.

## Light and dark themes

`ThemeProvider` is mounted around the application in `App.jsx`. The shared
`ThemeToggle` updates the root document's `data-theme` attribute. Theme colors
are CSS variables in `src/index.css`; the selected theme is stored under
`student-alumni-connect-theme` in `localStorage`. On a first visit, the initial
theme follows the system preference.
