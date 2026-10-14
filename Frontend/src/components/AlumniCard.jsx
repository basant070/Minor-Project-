import Avatar from "./Avatar";
import Chips from "./Chips";

export default function AlumniCard({ a, match, connected, onConnect, onMessage, toast }) {
  return (
    <div className="rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]">
      <div className="flex flex-wrap items-center gap-2.5">
        <Avatar name={a[0]} />
        <div>
          <b>{a[0]}</b> {a[7] ? <span className="inline-block rounded-full bg-soft px-[9px] py-0.5 text-xs font-bold !bg-okb !text-ok">Verified</span> : null}
          <div className="text-[13px] text-mut">
            {a[1]} · {a[2]}
          </div>
        </div>
      </div>
      <p className="text-[13px] text-mut my-2">
        {a[3]} · Batch {a[4]}
      </p>
      {match ? (
        <>
          <b className="text-pri">{a[6]}% match</b>
          <p className="text-[13px] text-mut">Shared skills: {a[5].slice(0, 3).join(", ")}</p>
        </>
      ) : (
        <Chips items={a[5]} />
      )}
      <div className="flex flex-wrap items-center gap-2.5 mt-3">
        <button
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 !px-3 !py-1.5 !text-[13px]"
          onClick={match ? () => toast("Mentorship request sent") : onConnect}
        >
          {match ? "Request Mentorship" : connected ? "Requested" : "Connect"}
        </button>
        <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 border border-ln bg-none bg-sf text-ink !px-3 !py-1.5 !text-[13px]" onClick={onMessage}>
          Message
        </button>
      </div>
    </div>
  );
}
