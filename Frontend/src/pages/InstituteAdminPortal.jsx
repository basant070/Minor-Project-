import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import useAuth from "../auth/useAuth";
import ConfirmModal from "../components/ConfirmModal";
import PortalPage from "./PortalPage";

export default function InstituteAdminPortal() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [portalUser, setPortalUser] = useState(() => ({
    ...user,
    role: "admin",
    uni: "Your institute",
  }));
  const [instituteError, setInstituteError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const toastTimeout = useRef(null);

  useEffect(() => {
    let active = true;

    axiosClient
      .get("/tenants")
      .then(({ data }) => {
        const institute = data.institutes.find(
          (item) => item._id === user.tenantId,
        );
        if (!active) return;
        if (institute) {
          setPortalUser((current) => ({ ...current, uni: institute.name }));
        } else {
          setInstituteError(
            "Your institute could not be found. Showing the dashboard with limited institute information.",
          );
        }
      })
      .catch(() => {
        if (active) {
          setInstituteError(
            "Could not load your institute name. The dashboard is available, but the institute label may be incomplete.",
          );
        }
      });

    return () => {
      active = false;
      clearTimeout(toastTimeout.current);
    };
  }, [user.tenantId]);

  const toast = useCallback((message) => {
    setToastMessage(message);
    clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToastMessage(""), 2200);
  }, []);

  const ask = useCallback(
    (message, onConfirm) => setConfirmation({ message, onConfirm }),
    [],
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {instituteError && (
        <p
          role="status"
          className="fixed left-1/2 top-20 z-30 w-[min(92%,40rem)] -translate-x-1/2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-lg"
        >
          {instituteError}
        </p>
      )}
      <PortalPage
        me={portalUser}
        onUpdateMe={(patch) =>
          setPortalUser((current) => ({ ...current, ...patch }))
        }
        onLogout={handleLogout}
        toast={toast}
        ask={ask}
      />
      {confirmation && (
        <ConfirmModal
          message={confirmation.message}
          onCancel={() => setConfirmation(null)}
          onConfirm={() => {
            const action = confirmation.onConfirm;
            setConfirmation(null);
            action();
          }}
        />
      )}
      {toastMessage && (
        <div className="fixed bottom-[calc(80px+env(safe-area-inset-bottom,0px))] left-1/2 z-[30] -translate-x-1/2 rounded-xl bg-ink px-[18px] py-2.5 text-bg">
          {toastMessage}
        </div>
      )}
    </>
  );
}
