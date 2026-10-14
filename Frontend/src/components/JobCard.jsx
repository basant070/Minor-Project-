import Chips from "./Chips";

export default function JobCard({ job, saved, onSave, toast }) {
  return (
    <div className="rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]">
      <div className="flex flex-wrap items-center gap-2.5 justify-between">
        <h3>{job[0]}</h3>
        <span className={`inline-block rounded-full bg-soft px-[9px] py-0.5 text-xs font-bold text-pri ${job[3] === "Job" ? "" : "!bg-wnb !text-wn"}`}>{job[3]}</span>
      </div>
      <p className="text-[13px] text-mut">
        {job[1]} · {job[2]} · {job[4]}
      </p>
      <p className="text-[13px] text-mut">Deadline {job[5]} · Posted by verified alumni</p>
      <div>
        <Chips items={job[6]} />
      </div>
      <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
        <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 !px-3 !py-1.5 !text-[13px]" onClick={() => toast("Application started")}>
          Apply
        </button>
        <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 border border-ln bg-none bg-sf text-ink !px-3 !py-1.5 !text-[13px]" onClick={onSave}>
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}
