/** Purpose: Connect shared providers to the public and role-protected routes. */
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AuthProvider } from "./auth/authContext.jsx";
import ProtectedRoute from "./auth/ProtectedRoute";
import useAuth from "./auth/useAuth";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import InstituteAdminPortal from "./pages/InstituteAdminPortal";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import CommunityPortal from "./pages/CommunityPortal";
import ThemeToggle from "./components/ThemeToggle";
import { ThemeProvider } from "./theme/ThemeProvider";

// Keep role destinations consistent for /home and role-mismatch redirects.
const ROLE_HOME = {
  student: "/student",
  alumni: "/alumni",
  institute_admin: "/institute-admin",
  super_admin: "/super-admin",
};

function LandingRoute() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const goto = (destination) => {
    if (destination === "auth") navigate("/login");
    else if (destination === "reg") navigate("/register");
  };

  return (
    <LandingPage
      registered={Boolean(user)}
      justRegistered={false}
      goto={goto}
    />
  );
}

function AuthenticatedHome() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return <Navigate to={ROLE_HOME[user?.role] || "/"} replace />;
}

function AppRoutes() {
  return (
    <>
      <ThemeToggle />
      <Routes>
        {/* Public account and landing screens. */}
        <Route path="/" element={<LandingRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Student/alumni share a dashboard; institute and super admins have separate role gates. */}
        <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
          <Route
            path="/student"
            element={<CommunityPortal />}
          />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["alumni"]} />}>
          <Route
            path="/alumni"
            element={<CommunityPortal />}
          />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["institute_admin"]} />}>
          <Route
            path="/institute-admin"
            element={<InstituteAdminPortal />}
          />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
          <Route
            path="/super-admin"
            element={<SuperAdminDashboard />}
          />
        </Route>

        <Route path="/home" element={<AuthenticatedHome />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  // Providers wrap every route so session and theme state are shared site-wide.
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
