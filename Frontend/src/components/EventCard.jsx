export default function EventCard({ ev, going, onToggle }) {
  return (
    <div className="rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]">
      <div className="relative mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-4 text-white shadow-lg shadow-indigo-200/60">
        <div className="pointer-events-none absolute -right-5 -top-10 h-32 w-32 rounded-full border-[18px] border-white/10" />
        <div className="relative flex items-center justify-between gap-3">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold">
            {ev[1]}
          </span>
          <svg aria-hidden="true" className="h-6 w-6 text-indigo-100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M16 3v4M8 3v4M3 11h18" />
            <path d="m9 16 2 2 4-4" />
          </svg>
        </div>
        <p className="relative mt-4 text-lg font-extrabold tracking-tight">{ev[2]}</p>
        <p className="relative mt-0.5 text-xs font-medium text-indigo-100">Save the date</p>
      </div>
      <h3 className="my-1.5">{ev[0]}</h3>
      <p className="text-[13px] text-mut">
        {ev[3]}
      </p>
      <p className="text-[13px] text-mut">{ev[4] + (going ? 1 : 0)} attending</p>
      <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 !px-3 !py-1.5 !text-[13px] mt-2" onClick={onToggle}>
        {going ? "Cancel RSVP" : "RSVP"}
      </button>
    </div>
  );
}
