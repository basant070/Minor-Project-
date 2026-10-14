import { ROLE_NAV } from "../data";

export default function Sidebar({ page, role, onNavigate }) {
  const nav = ROLE_NAV[role] || ROLE_NAV.student;

  return (
    <nav className="sticky top-[76px] h-[calc(100vh-76px)] self-start overflow-y-auto border-r border-ln bg-white/80 p-3 backdrop-blur-xl max-[760px]:fixed max-[760px]:top-auto max-[760px]:bottom-0 max-[760px]:left-0 max-[760px]:right-0 max-[760px]:z-20 max-[760px]:flex max-[760px]:h-auto max-[760px]:gap-1 max-[760px]:overflow-x-auto max-[760px]:overflow-y-hidden max-[760px]:border-0 max-[760px]:border-t max-[760px]:border-ln max-[760px]:bg-white/95 max-[760px]:p-1.5 max-[760px]:pb-[calc(6px+env(safe-area-inset-bottom,0px))]" aria-label="Main">
      {nav.map(([id, label]) => (
        <a
          key={id}
          className={`mb-0.5 block cursor-pointer whitespace-nowrap rounded-xl px-3 py-[10px] font-bold text-mut transition-colors hover:bg-soft hover:text-pri max-[760px]:m-0 max-[760px]:flex-none max-[760px]:px-3 max-[760px]:py-2 ${page === id ? "bg-soft text-pri" : ""}`}
          tabIndex={0}
          role="button"
          aria-current={page === id ? "page" : undefined}
          onClick={() => onNavigate(id)}
          onKeyDown={(event) => event.key === "Enter" && onNavigate(id)}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
