/** Purpose: Present the public product overview, guidelines, and sign-in entry points. */
import Navbar from "../components/Navbar";
import SiteFooter from "../components/SiteFooter";
import { FEATURES } from "../data";

export default function LandingPage({ registered, justRegistered, goto }) {
  return (
    <div className="overflow-hidden bg-bg pt-[76px] text-ink">
      <Navbar publicPage onLogin={() => goto("auth")} />

      {justRegistered && (
        <div className="mx-auto mt-4 max-w-5xl rounded-2xl border border-okb bg-okb px-5 py-4 text-sm text-ok shadow-sm">
          <b>Registration complete.</b> Click Login to open your dashboard.
        </div>
      )}

      <main>
        {/* Hero: introduce the platform and offer the primary visitor actions. */}
        <section
          className="relative isolate mx-auto grid min-h-[620px] scroll-mt-[88px] items-center gap-14 px-6 py-20 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-24"
          id="home"
        >
          <div className="pointer-events-none absolute -left-40 top-4 -z-10 h-96 w-96 rounded-full bg-indigo-200/50 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-20 -z-10 h-80 w-80 rounded-full bg-violet-200/50 blur-3xl" />

          <div className="animate-[rise-in_700ms_ease-out_both] motion-reduce:animate-none">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ln bg-sf/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-pri shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Your campus community, connected
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[1.04] tracking-[-0.055em] text-ink sm:text-6xl lg:text-7xl">
              Big futures start with{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">
                one connection.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-mut sm:text-lg">
              Find a mentor who gets your journey, discover your next
              opportunity, and stay close to the people who make your university
              special.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <button
                className="group inline-flex items-center gap-3 rounded-2xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-sm font-bold text-white shadow-xl shadow-indigo-200 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-200"
                onClick={() => goto("auth")}
              >
                {registered
                  ? "Log in to your community"
                  : "Join your community"}
                <span
                  className="transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </button>
              <button
                className="rounded-2xl border-0 bg-transparent px-4 py-3 text-sm font-bold text-mut transition hover:text-pri"
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Explore the community
              </button>
            </div>
            <div className="mt-10 flex items-center gap-4 border-t border-ln/80 pt-6">
              <div className="flex -space-x-3" aria-hidden="true">
                {["A", "S", "R", "M"].map((initial, index) => (
                  <span
                    key={initial}
                    className={`grid h-10 w-10 place-items-center rounded-full border-[3px] border-bg text-xs font-extrabold text-white ${
                      [
                        "bg-indigo-600",
                        "bg-violet-500",
                        "bg-sky-600",
                        "bg-fuchsia-500",
                      ][index]
                    }`}
                  >
                    {initial}
                  </span>
                ))}
              </div>
              <p className="text-sm text-mut">
                <b className="text-ink">One network.</b> A lifetime of
                support.
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-lg animate-[rise-in_900ms_ease-out_both] motion-reduce:animate-none">
            <div className="absolute -right-5 -top-7 h-28 w-28 animate-[drift_7s_ease-in-out_infinite] rounded-full bg-violet-300/60 blur-2xl motion-reduce:animate-none" />
            <div className="absolute -bottom-8 -left-8 h-32 w-32 animate-[drift_8s_ease-in-out_infinite] rounded-full bg-sky-300/60 blur-2xl motion-reduce:animate-none" />
            <div className="relative rotate-1 rounded-[2rem] border border-ln/80 bg-sf/80 p-3 shadow-[0_35px_100px_-35px_rgba(79,70,229,0.4)] backdrop-blur-xl transition-transform duration-500 hover:rotate-0">
              <div className="rounded-[1.5rem] bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-200">
                      Your network
                    </p>
                    <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                      Room to grow.
                    </h2>
                  </div>
                  <span
                    className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-xl"
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {[
                    ["01", "Find mentors", "Learn from alumni"],
                    ["02", "Explore jobs", "Find your next step"],
                    ["03", "Meet people", "Join campus events"],
                    ["04", "Share ideas", "Grow together"],
                  ].map(([number, title, text]) => (
                    <div
                      key={number}
                      className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white/15"
                    >
                      <span className="text-xs font-bold text-indigo-200">
                        {number}
                      </span>
                      <h3 className="mt-3 text-sm font-bold text-white">
                        {title}
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-indigo-100">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl bg-sf p-4 text-ink shadow-lg shadow-indigo-950/10">
                  <div>
                    <p className="text-xs font-semibold text-mut">
                      A stronger future starts here
                    </p>
                    <p className="mt-1 text-sm font-extrabold">
                      Make your next connection.
                    </p>
                  </div>
                  <span
                    className="grid h-10 w-10 place-items-center rounded-xl bg-soft text-lg text-pri"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 right-2 animate-[drift_6s_ease-in-out_infinite] rounded-2xl border border-ln bg-sf px-4 py-3 shadow-xl shadow-slate-200/70 motion-reduce:animate-none">
              <p className="text-xs font-bold text-ink">
                Built around you
              </p>
              <p className="mt-1 text-[11px] text-mut">
                Your university. Your people.
              </p>
            </div>
          </div>
        </section>

        {/* About: explain the community and summarize its core features. */}
        <section
          className="scroll-mt-[88px] bg-sf px-6 py-20 sm:px-10 lg:py-24"
          id="about"
        >
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-pri">
                More than a directory
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">
                Your university community, working for your future.
              </h2>
              <p className="mt-4 leading-7 text-mut">
                Alumni-Student Connect gives every university a private place to
                build meaningful relationships. Students find guidance and
                opportunities; alumni share experience, jobs, events, and
                advice.
              </p>
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(([title, description], index) => (
                <article
                  className="group animate-[rise-in_600ms_ease-out_both] rounded-3xl border border-ln/80 bg-bg p-6 transition duration-300 hover:-translate-y-1 hover:border-ln hover:bg-sf hover:shadow-xl hover:shadow-indigo-100/70 motion-reduce:animate-none"
                  key={title}
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-soft text-xs font-black text-pri transition group-hover:bg-indigo-600 group-hover:text-white">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-base font-extrabold text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-mut">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Guidelines: set expectations for respectful community participation. */}
        <section
          className="scroll-mt-[88px] px-6 py-20 sm:px-10 lg:py-24"
          id="guide"
        >
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-pri">
                A community that feels right
              </p>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-4xl">
                Good connections start with respect.
              </h2>
              <p className="mt-4 leading-7 text-mut">
                A few shared guidelines help keep this a useful, welcoming space
                for everyone.
              </p>
            </div>
            <ul className="grid gap-3">
              {[
                "Register with your real name and university.",
                "Keep discussions respectful and relevant to careers and learning.",
                "Share only genuine jobs and events.",
                "Protect other people's private information.",
                "Report inappropriate content so admins can review it.",
              ].map((guideline, index) => (
                <li
                  key={guideline}
                  className="flex items-start gap-4 rounded-2xl border border-ln/80 bg-sf p-4 text-sm leading-6 text-ink shadow-sm"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-okb text-xs font-extrabold text-ok">
                    {index + 1}
                  </span>
                  {guideline}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Shared contact and social links used by the public page and portal. */}
        <SiteFooter />
      </main>
    </div>
  );
}
