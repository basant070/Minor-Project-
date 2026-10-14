import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "./useAuth";

const ROLE_HOME = {
  student: "/student",
  alumni: "/alumni",
  institute_admin: "/institute-admin",
  super_admin: "/super-admin",
};

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8faff] text-slate-600">
        Checking your session…
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || "/login"} replace />;
  }

  return <Outlet />;
}
