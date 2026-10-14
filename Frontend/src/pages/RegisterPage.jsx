import { useState } from "react";
import Field from "../components/Field";
import { FACULTIES, FACULTY_FIELDS, INST } from "../data";

export default function RegisterPage({ goto, onRegistered }) {
  const [f, setF] = useState({
    role: "",
    name: "",
    email: "",
    pw: "",
    confirmPw: "",
    uni: "",
    faculty: "",
    field: "",
    adminCode: "",
    batch: "",
    currentPosition: "",
    bio: "",
  });
  const [err, setErr] = useState("");
  const set = (k) => (v) => setF((p) => ({ ...p, [k]: v }));

  const submit = () => {
    const {
      role,
      name,
      email,
      pw,
      confirmPw,
      uni,
      faculty,
      field,
      adminCode,
      batch,
      currentPosition,
      bio,
    } = f;
    if (
      !role ||
      !name.trim() ||
      !email.trim() ||
      !pw ||
      !confirmPw ||
      (role === "admin" && !adminCode.trim()) ||
      (role !== "admin" && (!uni || !faculty.trim() || !bio.trim())) ||
      (role === "student" && !field) ||
      (role === "alumni" && (!batch.trim() || !currentPosition.trim()))
    )
      return setErr("Fill in every field before registering.");
    if (!/^\S+@\S+\.\S+$/.test(email.trim()))
      return setErr("Enter a valid email address.");
    if (pw.length < 6)
      return setErr("Use a password with at least 6 characters.");
    if (pw !== confirmPw)
      return setErr("Passwords do not match.");
    onRegistered({
      name: name.trim(),
      email: email.trim(),
      pw,
      ...(role !== "admin" && {
        uni,
        faculty: faculty.trim(),
        bio: bio.trim(),
      }),
      field: role === "student" ? field : "",
      batch: role === "alumni" ? batch.trim() : "",
      currentPosition: role === "alumni" ? currentPosition.trim() : "",
      role,
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8faff] px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-violet-200/50 blur-3xl" />
      <div className="relative mx-auto max-w-6xl">
        <button
          type="button"
          aria-label="Back to home"
          title="Back to home"
          className="mb-8 grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white/80 text-2xl font-black leading-none text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-white hover:text-indigo-700"
          onClick={() => goto("landing")}
        >
          <span aria-hidden="true">←</span>
        </button>

        <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <aside className="pt-2 lg:sticky lg:top-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-indigo-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Your next chapter starts here
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-[-0.045em] text-slate-950 sm:text-5xl">
              Find your people.
              <span className="mt-1 block bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                Build your future.
              </span>
            </h1>
            <p className="mt-5 max-w-md leading-7 text-slate-600">
              Create your account to connect with alumni, discover mentors, and
              find opportunities across your university community.
            </p>
            <div className="mt-10 hidden rounded-2xl border border-indigo-100 bg-white/70 p-5 shadow-sm lg:block">
              <p className="text-sm font-bold text-slate-900">
                One network. A lifetime of support.
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your university community is ready to welcome you.
              </p>
            </div>
          </aside>

          <section className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-[0_30px_90px_-35px_rgba(79,70,229,0.3)] backdrop-blur sm:p-8 lg:p-10">
            <div className="mb-7">
              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
                Join the community
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Create your account
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Start with your role, then add a few details to set up your
                profile.
              </p>
            </div>

            <label
              className="mb-1.5 mt-0 text-sm font-bold text-slate-800"
              htmlFor="rr"
            >
              I am joining as
            </label>
            <select
              className="border-slate-200 bg-white text-slate-900 shadow-sm transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              id="rr"
              value={f.role}
              onChange={(e) => {
                set("role")(e.target.value);
                setErr("");
              }}
            >
              <option value="">Choose your role</option>
              <option value="alumni">Alumni</option>
              <option value="student">Student</option>
            </select>

            {f.role && (
              <div className="mt-6 animate-[rise-in_350ms_ease-out_both] motion-reduce:animate-none">
                {err && (
                  <p
                    role="alert"
                    className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                  >
                    {err}
                  </p>
                )}

                <div className="grid gap-x-5 sm:grid-cols-2">
                  <Field
                    id="rn"
                    label="Full name"
                    value={f.name}
                    onChange={set("name")}
                    placeholder="Your name"
                    className="border-slate-200 bg-white text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                  <Field
                    id="re"
                    label="Email"
                    type="email"
                    value={f.email}
                    onChange={set("email")}
                    placeholder="you@example.com"
                    className="border-slate-200 bg-white text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                  <Field
                    id="rp"
                    label="Password (6+ characters)"
                    type="password"
                    value={f.pw}
                    onChange={set("pw")}
                    placeholder="Create a password"
                    className="border-slate-200 bg-white text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />
                  <Field
                    id="rcp"
                    label="Confirm password"
                    type="password"
                    value={f.confirmPw}
                    onChange={set("confirmPw")}
                    placeholder="Enter it again"
                    className="border-slate-200 bg-white text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                  />

                  {f.role === "admin" ? (
                    <Field
                      id="rac"
                      label="Admin code"
                      type="password"
                      value={f.adminCode}
                      onChange={set("adminCode")}
                      className="border-slate-200 bg-white text-slate-900 shadow-sm transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                    />
                  ) : (
                    <>
                      <div>
                        <label
                          className="mb-1.5 text-sm font-bold text-slate-800"
                          htmlFor="ru"
                        >
                          University
                        </label>
                        <select
                          className="border-slate-200 bg-white text-slate-900 shadow-sm transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                          id="ru"
                          value={f.uni}
                          onChange={(e) => set("uni")(e.target.value)}
                        >
                          <option value="">Choose your university</option>
                          {INST.filter((i) => i[3] === "Active").map((i) => (
                            <option key={i[0]}>{i[0]}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          className="mb-1.5 text-sm font-bold text-slate-800"
                          htmlFor="rfa"
                        >
                          Faculty
                        </label>
                        <select
                          className="border-slate-200 bg-white text-slate-900 shadow-sm transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                          id="rfa"
                          value={f.faculty}
                          onChange={(e) => {
                            set("faculty")(e.target.value);
                            set("field")("");
                          }}
                        >
                          <option value="">Choose your faculty</option>
                          {FACULTIES.map((x) => (
                            <option key={x} value={x}>
                              {x}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {f.role === "student" && (
                    <div className="sm:col-span-2">
                      <label
                        className="mb-1.5 text-sm font-bold text-slate-800"
                        htmlFor="rfield"
                      >
                        Interested field
                      </label>
                      <select
                        className="border-slate-200 bg-white text-slate-900 shadow-sm transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                        id="rfield"
                        value={f.field}
                        onChange={(e) => set("field")(e.target.value)}
                        disabled={!f.faculty}
                      >
                        <option value="">
                          {f.faculty ? "Choose a field" : "Choose faculty first"}
                        </option>
                        {(FACULTY_FIELDS[f.faculty] || []).map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {f.role === "alumni" && (
                    <>
                      <Field
                        id="rbatch"
                        label="Graduation batch"
                        value={f.batch}
                        onChange={set("batch")}
                        placeholder="e.g., 2020"
                        className="border-slate-200 bg-white text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                      />
                      <Field
                        id="rposition"
                        label="Current workplace / position"
                        value={f.currentPosition}
                        onChange={set("currentPosition")}
                        placeholder="e.g., Software Engineer at Acme"
                        className="border-slate-200 bg-white text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                      />
                    </>
                  )}

                  {f.role !== "admin" && (
                    <div className="sm:col-span-2">
                      <label
                        className="mb-1.5 text-sm font-bold text-slate-800"
                        htmlFor="rb"
                      >
                        Bio
                      </label>
                      <textarea
                        className="border-slate-200 bg-white text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                        id="rb"
                        rows={3}
                        placeholder="Tell us a little about yourself"
                        value={f.bio}
                        onChange={(e) => set("bio")(e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <button
                  className="mt-7 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-indigo-200"
                  onClick={submit}
                >
                  Create account
                </button>
                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  By registering, you agree to keep the community respectful
                  and safe for everyone.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
