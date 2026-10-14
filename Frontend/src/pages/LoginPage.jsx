import { useState } from "react";
import Field from "../components/Field";

export default function LoginPage({ me, goto, onLogin }) {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const submit = (event) => {
    event.preventDefault();
    if (me && email.trim() === me.email && pw === me.pw) onLogin();
    else setErr("Email or password is incorrect.");
  };

  return (
    <div className="relative isolate flex min-h-screen overflow-hidden bg-[#f8faff] px-4 py-6 text-slate-900 sm:px-6 sm:py-8 lg:items-center lg:px-8">
      <div className="pointer-events-none absolute -left-40 top-12 -z-10 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 bottom-0 -z-10 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />

      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <a
            className="flex min-w-0 items-center gap-3 no-underline"
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              goto("landing");
            }}
          >
            <span className="grid h-11 w-11 flex-none place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-500 text-sm font-black text-white shadow-lg shadow-indigo-200">
              AC
            </span>
            <span className="min-w-0">
              <b className="block truncate text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
                Alumni-Student Connect
              </b>
              <span className="hidden text-xs text-slate-500 sm:block">
                Your campus community, connected
              </span>
            </span>
          </a>
          <button
            type="button"
            className="grid h-11 w-11 flex-none place-items-center rounded-xl border border-slate-200 bg-white/80 text-2xl font-black leading-none text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:text-indigo-700"
            aria-label="Back to home"
            title="Back to home"
            onClick={() => goto("landing")}
          >
            <span aria-hidden="true">←</span>
          </button>
        </div>

        <div className="grid overflow-hidden rounded-[28px] border border-white/80 bg-white/70 shadow-[0_30px_90px_-35px_rgba(79,70,229,0.3)] backdrop-blur-xl lg:min-h-[590px] lg:grid-cols-[1fr_0.9fr]">
          <section className="relative isolate flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white sm:p-9 lg:p-12">
            <div className="pointer-events-none absolute -right-24 -top-28 -z-10 h-80 w-80 rounded-full border-[42px] border-white/10" />
            <div className="pointer-events-none absolute -bottom-32 -left-24 -z-10 h-80 w-80 rounded-full border-[36px] border-white/10" />

            <div>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300" />
                Welcome back
              </span>
              <h1 className="max-w-xl text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-5xl">
                Good to see you.
                <span className="mt-1 block text-indigo-200">
                  Your community is waiting.
                </span>
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-indigo-100 sm:text-base">
                Reconnect with your university network, discover new
                opportunities, and keep building your future.
              </p>
            </div>
          </section>

          <section className="flex items-center justify-center bg-white/85 p-5 sm:p-9 lg:p-12">
            <form className="w-full max-w-md" onSubmit={submit}>
              <div className="mb-8">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                  Your next chapter
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                  Log in
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Sign in to continue to your community.
                </p>
              </div>

              {err && (
                <p
                  role="alert"
                  className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {err}
                </p>
              )}
              <div className="space-y-4">
                <Field
                  id="le"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(value) => {
                    setEmail(value);
                    setErr("");
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="border-slate-200 bg-white text-slate-900 shadow-sm transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
                <Field
                  id="lp"
                  label="Password"
                  type="password"
                  value={pw}
                  onChange={(value) => {
                    setPw(value);
                    setErr("");
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="border-slate-200 bg-white text-slate-900 shadow-sm transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <button
                className="group mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-200 transition duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-indigo-200"
                type="submit"
              >
                Log in to your community
                <span
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>

              <p className="mt-6 text-center text-sm text-slate-500">
                New to the community?{" "}
                <button
                  className="cursor-pointer border-0 bg-transparent p-0 font-bold text-indigo-700 transition hover:text-violet-700"
                  type="button"
                  onClick={() => goto("reg")}
                >
                  Create an account
                </button>
              </p>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
