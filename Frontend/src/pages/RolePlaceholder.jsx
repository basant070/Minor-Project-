import { useNavigate } from "react-router-dom";
import useAuth from "../auth/useAuth";

export default function RolePlaceholder({ title }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f8faff] px-4 text-slate-900">
      <section className="w-full max-w-lg rounded-[28px] border border-white bg-white p-8 text-center shadow-xl shadow-indigo-100">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
          Authentication verified
        </p>
        <h1 className="mt-3 text-3xl font-black">{title}</h1>
        <p className="mt-3 text-slate-600">Welcome, {user.name}.</p>
        <p className="mt-1 break-all text-sm text-slate-500">{user.email}</p>
        <button
          type="button"
          className="mt-7 cursor-pointer rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3 font-bold text-white"
          onClick={handleLogout}
        >
          Log out
        </button>
      </section>
    </main>
  );
}
