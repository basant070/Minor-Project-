import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import useAuth from "../auth/useAuth";

const ROLE_HOME = {
  student: "/student",
  alumni: "/alumni",
  institute_admin: "/institute-admin",
  super_admin: "/super-admin",
};

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  if (user) return <Navigate to={ROLE_HOME[user.role] || "/"} replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setEmailNotVerified(false);
    setResendMessage("");
    setResendError("");
    setSubmitting(true);

    try {
      const loggedInUser = await login({ email, password });
      navigate(ROLE_HOME[loggedInUser.role] || "/", { replace: true });
    } catch (requestError) {
      setEmailNotVerified(
        requestError.response?.data?.code === "EMAIL_NOT_VERIFIED",
      );
      setError(
        requestError.response?.data?.message ||
          "Unable to log in. Check your details and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resendVerification = async () => {
    setResendMessage("");
    setResendError("");
    setResending(true);

    try {
      const { data } = await axiosClient.post("/auth/resend-verification", {
        email,
      });
      setResendMessage(data.message);
    } catch (requestError) {
      setResendError(
        requestError.response?.data?.message ||
          "Unable to request a verification email. Please try again later.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-[#f8faff] px-4 py-10 text-slate-900 sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80 rounded-full bg-indigo-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-violet-200/60 blur-3xl" />
      <section className="w-full max-w-md rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_30px_90px_-35px_rgba(79,70,229,0.3)] backdrop-blur sm:p-9">
        <Link className="text-sm font-bold text-indigo-700 hover:text-violet-700" to="/">
          ← Home
        </Link>
        <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
          Welcome back
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Log in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Use the same login page for your university account.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {emailNotVerified && (
          <div className="mt-3">
            <button
              type="button"
              onClick={resendVerification}
              disabled={resending || !email}
              className="cursor-pointer border-0 bg-transparent p-0 text-sm font-bold text-indigo-700 hover:text-violet-700 disabled:cursor-wait disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend verification email"}
            </button>
            {resendMessage && (
              <p role="status" className="mt-2 text-sm text-emerald-800">
                {resendMessage}
              </p>
            )}
            {resendError && (
              <p role="alert" className="mt-2 text-sm text-red-700">
                {resendError}
              </p>
            )}
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <button
            className="w-full cursor-pointer rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500">
          New here?{" "}
          <Link className="font-bold text-indigo-700 hover:text-violet-700" to="/register">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
