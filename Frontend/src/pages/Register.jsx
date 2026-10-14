import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import useAuth from "../auth/useAuth";

export default function Register() {
  const { user, register } = useAuth();
  const [institutes, setInstitutes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingInstitutes, setLoadingInstitutes] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [tenantId, setTenantId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [canResendVerification, setCanResendVerification] = useState(false);

  useEffect(() => {
    axiosClient
      .get("/tenants")
      .then(({ data }) => setInstitutes(data.institutes))
      .catch((requestError) => {
        setError(
          requestError.response?.data?.message ||
            "Could not load institutes. Please try again later.",
        );
      })
      .finally(() => setLoadingInstitutes(false));
  }, []);

  useEffect(() => {
    if (!tenantId) return;

    let isCurrentRequest = true;
    axiosClient
      .get(`/tenants/${tenantId}/departments`)
      .then(({ data }) => {
        if (isCurrentRequest) setDepartments(data.departments);
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setError(
            requestError.response?.data?.message ||
              "Could not load departments. Please try again later.",
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) setLoadingDepartments(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [tenantId]);

  if (user) return <Navigate to="/" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setResendMessage("");
    setResendError("");
    setCanResendVerification(false);
    setSubmitting(true);

    try {
      const response = await register({
        name,
        email,
        password,
        role,
        tenantId,
        departmentId,
      });
      setSuccess(
        `${response.message} We sent it to ${email}. Please check your inbox (and spam folder) and verify your email before logging in.`,
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to register. Check your details and try again.",
      );
      setCanResendVerification(
        requestError.response?.status === 503 &&
          requestError.response?.data?.code?.startsWith("EMAIL_"),
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
      <section className="w-full max-w-xl rounded-[28px] border border-white bg-white/90 p-6 shadow-[0_30px_90px_-35px_rgba(79,70,229,0.3)] backdrop-blur sm:p-9">
        <Link className="text-sm font-bold text-indigo-700 hover:text-violet-700" to="/">
          ← Home
        </Link>
        <p className="mt-8 text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
          Join the community
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Create an account</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Register as a student or alumnus of an active institute.
        </p>

        {error && (
          <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}
        {success && (
          <div
            role="status"
            className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <p>{success}</p>
            {role === "alumni" && (
              <p className="mt-2">
                After email verification, an institute admin must also approve your account before you can log in.
              </p>
            )}
          </div>
        )}
        {(success || canResendVerification) && (
          <div className="mt-4">
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

        {!success && (
          <form className="mt-6 space-y-4" onSubmit={submit}>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="register-role">I am registering as</label>
            <select
              id="register-role"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            >
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="register-institute">Institute</label>
            <select
              id="register-institute"
              required
              value={tenantId}
              onChange={(event) => {
                const selectedTenantId = event.target.value;
                setTenantId(selectedTenantId);
                setDepartmentId("");
                setDepartments([]);
                setLoadingDepartments(Boolean(selectedTenantId));
                setError("");
              }}
              disabled={loadingInstitutes || institutes.length === 0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
            >
              <option value="">
                {loadingInstitutes ? "Loading institutes…" : "Select your institute"}
              </option>
              {institutes.map((institute) => (
                <option key={institute._id} value={institute._id}>
                  {institute.name}
                </option>
              ))}
            </select>
            {!loadingInstitutes && institutes.length === 0 && !error && (
              <p className="mt-1 text-xs text-slate-500">No active institutes are available yet.</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="register-department">Department</label>
            <select
              id="register-department"
              required
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              disabled={!tenantId || loadingDepartments || departments.length === 0}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:bg-slate-100"
            >
              <option value="">
                {!tenantId
                  ? "Select an institute first"
                  : loadingDepartments
                    ? "Loading departments…"
                    : "Select your department"}
              </option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
            {tenantId && !loadingDepartments && departments.length === 0 && !error && (
              <p className="mt-1 text-xs text-slate-500">
                No active departments are available for this institute yet.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="register-name">Full name</label>
            <input
              id="register-name"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-bold" htmlFor="register-password">Password (at least 8 characters)</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </div>
          <button
            className="w-full cursor-pointer rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            type="submit"
            disabled={
              submitting ||
              loadingInstitutes ||
              institutes.length === 0 ||
              loadingDepartments ||
              departments.length === 0
            }
          >
            {submitting ? "Creating account…" : "Create account"}
          </button>
          </form>
        )}
        {!success && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link className="font-bold text-indigo-700 hover:text-violet-700" to="/login">
              Log in
            </Link>
          </p>
        )}
        {success && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Already verified?{" "}
            <Link className="font-bold text-indigo-700 hover:text-violet-700" to="/login">
              Log in
            </Link>
          </p>
        )}
      </section>
    </main>
  );
}
