import { useState } from "react";

const initialForm = {
  title: "",
  company: "",
  location: "",
  type: "Job",
  mode: "On-site",
  deadline: "",
  skills: "",
};

export default function JobPostModal({ onCancel, onPublish }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const update = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const publish = (event) => {
    event.preventDefault();
    if (
      !form.title.trim() ||
      !form.company.trim() ||
      !form.location.trim() ||
      !form.deadline.trim() ||
      !form.skills.trim()
    ) {
      setError("Complete every field before publishing.");
      return;
    }

    onPublish([
      form.title.trim(),
      form.company.trim(),
      form.location.trim(),
      form.type,
      form.mode,
      form.deadline.trim(),
      form.skills.split(",").map((skill) => skill.trim()).filter(Boolean),
    ]);
  };

  return (
    <div className="fixed inset-0 z-30 grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm">
      <form
        className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto rounded-3xl border border-white/70 bg-white p-5 shadow-2xl shadow-indigo-950/20 sm:p-7"
        onSubmit={publish}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-post-title"
      >
        <div className="mb-5">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-600">Share an opportunity</span>
          <h2 id="job-post-title" className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Post a job or internship</h2>
          <p className="mt-2 text-sm text-slate-500">Help students discover their next opportunity.</p>
        </div>

        {error && <p className="mb-3 text-sm font-semibold text-red-700" role="alert">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="job-title">Role title</label>
            <input id="job-title" value={form.title} onChange={update("title")} placeholder="e.g. Frontend Developer" autoFocus />
          </div>
          <div>
            <label htmlFor="job-company">Company</label>
            <input id="job-company" value={form.company} onChange={update("company")} placeholder="Company name" />
          </div>
          <div>
            <label htmlFor="job-location">Location</label>
            <input id="job-location" value={form.location} onChange={update("location")} placeholder="City or remote" />
          </div>
          <div>
            <label htmlFor="job-type">Opportunity type</label>
            <select id="job-type" value={form.type} onChange={update("type")}>
              <option>Job</option>
              <option>Internship</option>
            </select>
          </div>
          <div>
            <label htmlFor="job-mode">Work mode</label>
            <select id="job-mode" value={form.mode} onChange={update("mode")}>
              <option>On-site</option>
              <option>Hybrid</option>
              <option>Remote</option>
            </select>
          </div>
          <div>
            <label htmlFor="job-deadline">Application deadline</label>
            <input id="job-deadline" value={form.deadline} onChange={update("deadline")} placeholder="e.g. Nov 15" />
          </div>
          <div>
            <label htmlFor="job-skills">Skills (comma-separated)</label>
            <input id="job-skills" value={form.skills} onChange={update("skills")} placeholder="e.g. React, JavaScript" />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-50" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl" type="submit">
            Publish opportunity
          </button>
        </div>
      </form>
    </div>
  );
}
