import { useState } from "react";
import { PORTAL } from "../data";

export default function Navbar({
  publicPage = false,
  onLogin,
  university,
  subtitle,
  newCount = 0,
  activePage,
  onNavigate,
  onLogout,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (publicPage) {
    const scrollTo = (id) => {
      setMenuOpen(false);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

    return (
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/50 bg-white/50 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <a
          href="#home"
          className="flex items-center gap-3 no-underline"
          onClick={(event) => {
            event.preventDefault();
            scrollTo("home");
          }}
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-500 text-sm font-black text-white shadow-lg shadow-indigo-200">
            AC
          </span>
          <span>
            <b className="block text-sm font-extrabold tracking-tight text-slate-900 sm:text-base">
              Alumni-Student Connect
            </b>
            <span className="hidden text-xs text-slate-500 sm:block">
              {PORTAL}
            </span>
          </span>
        </a>
        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 md:hidden"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="public-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
            <span className={`h-0.5 w-full rounded bg-current transition ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-full rounded bg-current transition ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-full rounded bg-current transition ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
        <nav
          id="public-navigation"
          aria-label="Main navigation"
          className={`${menuOpen ? "flex" : "hidden"} w-full flex-col gap-1 border-t border-slate-100 pt-3 md:flex md:w-auto md:flex-row md:items-center md:gap-1 md:border-0 md:pt-0`}
        >
          <button className="w-full rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 md:w-auto md:text-center" onClick={() => scrollTo("home")}>
            Home
          </button>
          <button className="w-full rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 md:w-auto md:text-center" onClick={() => scrollTo("about")}>
            About
          </button>
          <button className="w-full rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 md:w-auto md:text-center" onClick={() => scrollTo("guide")}>
            Guidelines
          </button>
          <button className="w-full rounded-xl border-0 bg-transparent px-3 py-2.5 text-left text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700 md:w-auto md:text-center" onClick={() => scrollTo("contact")}>
            Contact
          </button>
          <button
            className="w-full cursor-pointer rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-left text-sm font-bold text-white shadow-md shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-lg md:ml-2 md:w-auto md:text-center"
            onClick={() => {
              setMenuOpen(false);
              onLogin();
            }}
          >
            Log in
          </button>
        </nav>
        </div>
      </header>
    );
  }

  return (
    <div className="sticky top-0 z-[15] flex flex-wrap items-center justify-between gap-3 border-b border-ln bg-white/85 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6">
      <div className="min-w-0 flex-1">
        <b className="block break-words text-sm font-extrabold tracking-[0.02em] text-slate-900 sm:text-base">{university ? university.toUpperCase() : "ALUMNI-STUDENT CONNECT"}</b>
        <span className="block text-xs text-mut">{subtitle}</span>
      </div>
      <span className="flex flex-none flex-wrap items-center gap-2">
        <button
          type="button"
          className={`relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition ${activePage === "notif" ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-ln bg-white text-ink hover:bg-soft"}`}
          aria-label={newCount ? `Notifications, ${newCount} unread` : "Notifications"}
          title="Notifications"
          aria-current={activePage === "notif" ? "page" : undefined}
          onClick={() => onNavigate("notif")}
        >
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
            <path d="M10 21h4" />
          </svg>
          {newCount > 0 && (
            <span aria-hidden="true" className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-bd px-1.5 py-0.5 text-[11px] leading-none text-white">
              {newCount}
            </span>
          )}
        </button>
        <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-colors duration-150 hover:brightness-110 !bg-none border border-ln bg-sf !text-ink !px-3 !py-1.5 !text-[13px] hover:!border-rose-200 hover:!bg-rose-50 hover:!text-rose-700" onClick={onLogout}>
          Logout
        </button>
      </span>
    </div>
  );
}
