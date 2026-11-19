/** Purpose: Verify registration tokens and let users request a replacement email. */
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axiosClient from "../api/axiosClient";

const verificationRequests = new Map();

const verifyEmailToken = (token) => {
  const pendingRequest = verificationRequests.get(token);
  if (pendingRequest) return pendingRequest;

  const request = axiosClient.get("/auth/verify-email", {
    params: { token },
  });
  verificationRequests.set(token, request);
  request.then(
    () => {
      if (verificationRequests.get(token) === request) {
        verificationRequests.delete(token);
      }
    },
    () => {
      if (verificationRequests.get(token) === request) {
        verificationRequests.delete(token);
      }
    },
  );

  return request;
};

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    let isCurrentRequest = true;

    if (!token) return undefined;

    verifyEmailToken(token)
      .then(({ data }) => {
        if (isCurrentRequest) {
          setStatus("success");
          setMessage(data.message);
        }
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setStatus("error");
          setMessage(
            requestError.response?.data?.message ||
              "Unable to verify this email. Please request a new verification email.",
          );
        }
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [token]);

  const displayedStatus = token ? status : "error";
  const displayedMessage = token
    ? message
    : "This verification link is invalid or expired.";

  const resendVerification = async (event) => {
    event.preventDefault();
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
    <main className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-bg px-4 py-10 text-ink sm:px-6">
      <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-80 w-80 rounded-full bg-indigo-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-80 w-80 rounded-full bg-violet-200/60 blur-3xl" />
      <section className="w-full max-w-xl rounded-[28px] border border-ln bg-sf/90 p-6 shadow-[0_30px_90px_-35px_rgba(79,70,229,0.3)] backdrop-blur sm:p-9">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-pri">
          Email verification
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">
          {displayedStatus === "loading"
            ? "Verifying your email…"
            : displayedStatus === "success"
              ? "Email verified"
              : "Verification unsuccessful"}
        </h1>
        <p
          role={displayedStatus === "error" ? "alert" : displayedStatus === "success" ? "status" : undefined}
          className={`mt-3 text-sm leading-6 ${
            displayedStatus === "error" ? "text-bd" : "text-mut"
          }`}
        >
          {displayedStatus === "loading" ? "Please wait while we check your link." : displayedMessage}
        </p>

        {/* Resend is shown only when the token is missing or verification failed. */}
        {displayedStatus === "error" && (
          <form className="mt-6 space-y-4" onSubmit={resendVerification}>
            <div>
              <label className="mb-1.5 block text-sm font-bold" htmlFor="verification-email">
                Email address
              </label>
              <input
                id="verification-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-ln bg-sf px-3 py-3 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-soft"
              />
            </div>
            <button
              type="submit"
              disabled={resending}
              className="w-full cursor-pointer rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
            >
              {resending ? "Sending…" : "Resend verification email"}
            </button>
            {resendMessage && (
              <p role="status" className="rounded-xl border border-okb bg-okb px-4 py-3 text-sm text-ok">
                {resendMessage}
              </p>
            )}
            {resendError && (
              <p role="alert" className="rounded-xl border border-bdb bg-bdb px-4 py-3 text-sm text-bd">
                {resendError}
              </p>
            )}
          </form>
        )}

        {/* Continue only after the backend confirms the token. */}
        {displayedStatus === "success" && (
          <Link
            className="mt-6 inline-flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5"
            to="/login"
          >
            Continue to login
          </Link>
        )}
        {displayedStatus === "error" && (
          <Link className="mt-5 inline-block text-sm font-bold text-pri hover:text-violet-700" to="/login">
            Back to login
          </Link>
        )}
      </section>
    </main>
  );
}
