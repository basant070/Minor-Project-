import { useState } from "react";

export default function PostModal({ onCancel, onPublish, toast }) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("Career Advice");
  const [body, setBody] = useState("");

  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(10,10,30,0.5)] p-4">
      <div className="w-full max-w-[400px] rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]">
        <h3>Create post</h3>
        <label htmlFor="pt">Title</label>
        <input
          id="pt"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <label htmlFor="pcat">Category</label>
        <select id="pcat" value={cat} onChange={(e) => setCat(e.target.value)}>
          {["Career Advice", "Programming", "Jobs", "Higher Studies"].map(
            (c) => (
              <option key={c}>{c}</option>
            ),
          )}
        </select>
        <label htmlFor="pb">Description</label>
        <textarea
          id="pb"
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex flex-wrap items-center gap-2.5 mt-3">
          <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 border border-ln bg-none bg-sf text-ink" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110"
            onClick={() => {
              if (!title.trim()) return toast("Add a title first");
              onPublish({ title, cat, body });
            }}
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- root ---------- */
