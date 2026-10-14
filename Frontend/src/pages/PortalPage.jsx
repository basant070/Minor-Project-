import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import AlumniCard from "../components/AlumniCard";
import Avatar from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import EventCard from "../components/EventCard";
import JobCard from "../components/JobCard";
import JobPostModal from "../components/JobPostModal";
import Messages from "../components/Messages";
import Navbar from "../components/Navbar";
import PostModal from "../components/PostModal";
import Profile from "../components/Profile";
import Section from "../components/Section";
import Sidebar from "../components/Sidebar";
import Stats from "../components/Stats";
import {
  ALUMNI,
  EVENTS,
  INST,
  INITIAL_CHAT,
  INITIAL_NOTIFS,
  INITIAL_POSTS,
  JOBS,
} from "../data";

export default function PortalPage({ me, onUpdateMe, onLogout, toast, ask }) {
  const [page, setPage] = useState("dash");
  const [loading, setLoading] = useState(false);
  const [managedStudents, setManagedStudents] = useState([]);
  const [managedAlumni, setManagedAlumni] = useState([]);
  const [managedUsersLoading, setManagedUsersLoading] = useState(
    () => me.role === "admin",
  );
  const [managedUsersError, setManagedUsersError] = useState("");

  const [q, setQ] = useState("");
  const [batch, setBatch] = useState("");
  const [view, setView] = useState("grid");
  const [typ, setTyp] = useState("");
  const [saved, setSaved] = useState({});
  const [rsvp, setRsvp] = useState({});
  const [conn, setConn] = useState({});
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS);
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [chat, setChat] = useState(INITIAL_CHAT);
  const [showPost, setShowPost] = useState(false);
  const [showJobPost, setShowJobPost] = useState(false);
  const [jobs, setJobs] = useState(JOBS);
  const [institutionStatuses, setInstitutionStatuses] = useState(
    () => Object.fromEntries(INST.map((institution) => [institution[0], institution[3]])),
  );

  useEffect(() => {
    if (me.role !== "admin") return undefined;

    let isCurrentRequest = true;
    Promise.all([
      axiosClient.get("/institute-admin/students"),
      axiosClient.get("/institute-admin/alumni"),
    ])
      .then(([studentsResponse, alumniResponse]) => {
        if (!isCurrentRequest) return;
        setManagedStudents(studentsResponse.data.users);
        setManagedAlumni(alumniResponse.data.users);
        setManagedUsersError("");
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setManagedUsersError(
            requestError.response?.data?.message ||
              "Could not load institute student and alumni accounts.",
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) setManagedUsersLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [me.role]);

  const go = (p) => {
    setPage(p);
    setQ("");
    setLoading(true);
  };
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, [loading, page]);

  const newCount = notifs.filter((n) => n[1]).length;
  const toggle = (setter, i) => setter((p) => ({ ...p, [i]: !p[i] }));
  const connect = (name) => {
    setConn((p) => ({ ...p, [name]: 1 }));
    toast("Connection request sent");
  };

  const removeManagedUser = (user) => {
    ask(`Permanently remove ${user.name}'s ${user.role} account? This cannot be undone.`, async () => {
      try {
        await axiosClient.delete(`/institute-admin/users/${user._id}`);
        if (user.role === "student") {
          setManagedStudents((users) => users.filter((item) => item._id !== user._id));
        } else {
          setManagedAlumni((users) => users.filter((item) => item._id !== user._id));
        }
        toast("Account permanently removed");
      } catch (requestError) {
        setManagedUsersError(
          requestError.response?.data?.message ||
            "Could not remove this account. Please try again.",
        );
      }
    });
  };

  const managedUsersPage = (role, users) => (
    <>
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-pri">
          Institute administration
        </span>
        <h2 className="mt-1">{role === "student" ? "Students" : "Alumni"}</h2>
        <p className="mt-2 text-[13px] text-mut">
          {managedUsersLoading
            ? "Loading institute accounts…"
            : managedUsersError
              ? "Account total unavailable."
              : `${users.length} registered ${role === "student" ? "student" : "alumni"} accounts in ${me.uni}.`}
        </p>
      </div>
      {managedUsersError && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {managedUsersError}
        </p>
      )}
      {managedUsersLoading ? (
        <p role="status" className="text-sm text-mut">Loading institute accounts…</p>
      ) : managedUsersError ? null : users.length ? (
        <div className="overflow-x-auto rounded-[18px] border border-ln bg-sf shadow-[0_4px_18px_rgba(30,30,80,0.06)]">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="border-b border-ln text-xs uppercase text-mut">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Account status</th>
                <th className="px-4 py-3">Email verification</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ln">
              {users.map((managedUser) => (
                <tr key={managedUser._id}>
                  <td className="px-4 py-3 font-bold">{managedUser.name}</td>
                  <td className="px-4 py-3 text-mut">{managedUser.email}</td>
                  <td className="px-4 py-3 capitalize">{managedUser.status}</td>
                  <td className="px-4 py-3">
                    {managedUser.emailVerified ? "Verified" : "Not verified"}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                      onClick={() => removeManagedUser(managedUser)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>
          No {role === "student" ? "students" : "alumni"} are registered with this institute.
        </EmptyState>
      )}
    </>
  );

  const alumniCard = (a, match) => (
    <AlumniCard
      key={a[0]}
      a={a}
      match={match}
      connected={conn[a[0]]}
      onConnect={() => connect(a[0])}
      onMessage={() => go("msg")}
      toast={toast}
    />
  );
  const jobCard = (j, i) => (
    <JobCard
      key={i}
      job={j}
      saved={saved[i]}
      onSave={() => toggle(setSaved, i)}
      toast={toast}
    />
  );
  const eventCard = (e, i) => (
    <EventCard
      key={i}
      ev={e}
      going={rsvp[i]}
      onToggle={() => {
        toast(rsvp[i] ? "RSVP cancelled" : "RSVP confirmed");
        toggle(setRsvp, i);
      }}
    />
  );

  const forumPostCard = (post, i) => (
    <article
      className="flex h-full flex-col rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]"
      key={`${post[0]}-${post[3]}-${i}`}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <Avatar name={post[0]} />
        <div>
          <b>{post[0]}</b>{" "}
          <span className={`inline-block rounded-full bg-soft px-[9px] py-0.5 text-xs font-bold text-pri ${post[1] === "Alumni" ? "!bg-okb !text-ok" : ""}`}>
            {post[1]}
          </span>
          <div className="text-[13px] text-mut">{post[2]}</div>
        </div>
      </div>
      <h3 className="mb-1 mt-2.5">{post[3]}</h3>
      <p className="flex-1">{post[4]}</p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2.5">
        <button
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-ln bg-sf px-3 py-1.5 text-[13px] font-bold text-ink transition hover:bg-soft"
          type="button"
          aria-label={`Like post, ${post[5]} likes`}
          title="Like"
          onClick={() =>
            setPosts((all) =>
              all.map((item, j) =>
                j === i ? [...item.slice(0, 5), item[5] + 1] : item,
              ),
            )
          }
        >
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 10v11H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3Z" />
            <path d="M7 10 11 3a3 3 0 0 1 2 3v4h5a2 2 0 0 1 2 2l-1.5 7a2 2 0 0 1-2 2H7" />
          </svg>
          <span className="ml-1.5">{post[5]}</span>
        </button>
        <button
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-ln bg-sf px-3 py-1.5 text-[13px] font-bold text-ink transition hover:bg-soft"
          type="button"
          aria-label="Comment on post"
          title="Comment"
          onClick={() => toast("Comments opened")}
        >
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z" />
          </svg>
        </button>
        <button
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-ln bg-sf px-3 py-1.5 text-[13px] font-bold text-ink transition hover:bg-soft"
          type="button"
          aria-label="Report post"
          title="Report"
          onClick={() =>
            ask("Report this post to moderators?", () =>
              toast("Report submitted"),
            )
          }
        >
          <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 21V5m0 0c5-4 9 4 14 0v11c-5 4-9-4-14 0" />
          </svg>
        </button>
      </div>
    </article>
  );

  const dashboardPosts = () => (
    <Section
      title="Latest from the forum"
      action={
        <button
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-ln bg-sf px-4 py-[9px] font-bold text-ink transition hover:bg-soft"
          onClick={() => go("forum")}
        >
          Visit forum
        </button>
      }
    >
      {posts.length ? (
        <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-3">
          {posts.map(forumPostCard)}
        </div>
      ) : (
        <EmptyState>No forum posts yet. Be the first to share something with your community.</EmptyState>
      )}
    </Section>
  );

  const studentDashboard = () => (
      <>
        <div className="relative overflow-hidden rounded-[24px] border border-ln bg-[linear-gradient(120deg,#312e81,#5b21b6_58%,#7c3aed)] p-7 text-white shadow-[0_14px_35px_rgba(67,56,202,0.18)] sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border-[32px] border-white/10" />
          <div className="relative max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">Your student hub</span>
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Your next chapter starts here, {me.name.split(" ")[0]}.</h2>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">{me.uni} · Build your network, find a mentor and take the next step in your career.</p>
            <button className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-white px-4 py-2.5 font-bold text-indigo-800 transition hover:bg-indigo-50" onClick={() => go("mentor")}>
              Find your mentor <span className="ml-2" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        <Stats
          items={[
            ["Connections", 18],
            ["Saved Jobs", Object.values(saved).filter(Boolean).length],
            ["Upcoming events", 3],
            ["Messages", 4],
          ]}
        />
        {dashboardPosts()}
        <Section title="Recommended mentors">
          <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
            {ALUMNI.slice(3)
              .concat(ALUMNI.slice(0, 1))
              .map((a) => alumniCard(a, true))}
          </div>
        </Section>
        <Section title="Latest jobs">
          <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">{jobs.slice(0, 2).map(jobCard)}</div>
        </Section>
        <Section title="Upcoming events">
          <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">{EVENTS.slice(0, 2).map(eventCard)}</div>
        </Section>
      </>
  );

  const alumniDashboard = () => (
    <>
      <div className="relative overflow-hidden rounded-[24px] border border-ln bg-[linear-gradient(120deg,#064e3b,#047857_58%,#0f766e)] p-7 text-white shadow-[0_14px_35px_rgba(4,120,87,0.17)] sm:p-9">
        <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border-[32px] border-white/10" />
        <div className="relative max-w-2xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">Alumni network</span>
          <h2 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Good to see you, {me.name.split(" ")[0]}.</h2>
          <p className="max-w-xl text-sm text-white/80 sm:text-base">Your experience can open doors. Share advice, connect with your university community and help the next generation grow.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-white px-4 py-2.5 font-bold text-emerald-900 transition hover:bg-emerald-50" onClick={() => setShowPost(true)}>
              Write a post <span className="ml-2" aria-hidden="true">→</span>
            </button>
            <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 font-bold text-white transition hover:bg-white/20" onClick={() => go("events")}>
              Explore events <span className="ml-2" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
      <Stats
        items={[
          ["Mentorship requests", notifs.filter((n) => n[0].toLowerCase().includes("mentorship")).length],
          ["Open opportunities", jobs.length],
          ["Community posts", posts.length],
          ["Unread updates", newCount],
        ]}
      />
      {dashboardPosts()}
    </>
  );

  const adminDashboard = () => {
    return (
      <>
        <div className="relative overflow-hidden rounded-[24px] border border-ln bg-[linear-gradient(120deg,#172554,#1e3a8a_58%,#3730a3)] p-7 text-white shadow-[0_14px_35px_rgba(30,58,138,0.17)] sm:p-9">
          <div className="pointer-events-none absolute -right-10 -top-24 h-64 w-64 rounded-full border-[32px] border-white/10" />
          <div className="relative max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]">Platform administration</span>
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Welcome back, {me.name.split(" ")[0]}.</h2>
            <p className="max-w-xl text-sm text-white/80 sm:text-base">Your overview of the alumni network. Review institution requests and keep the community running smoothly.</p>
            <button className="mt-5 inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-white px-4 py-2.5 font-bold text-blue-950 transition hover:bg-blue-50" onClick={() => go("institutions")}>
              Review institutions <span className="ml-2" aria-hidden="true">→</span>
            </button>
          </div>
        </div>
        {managedUsersError && (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {managedUsersError}
          </p>
        )}
        <Stats
          items={[
            ["Students", managedUsersLoading ? "…" : managedUsersError ? "—" : managedStudents.length],
            ["Alumni", managedUsersLoading ? "…" : managedUsersError ? "—" : managedAlumni.length],
            ["Pending alumni", managedUsersLoading ? "…" : managedUsersError ? "—" : managedAlumni.filter((alumnus) => alumnus.status === "pending").length],
            ["Unverified emails", managedUsersLoading ? "…" : managedUsersError ? "—" : [...managedStudents, ...managedAlumni].filter((managedUser) => !managedUser.emailVerified).length],
          ]}
        />
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] hover:brightness-110"
            onClick={() => go("students")}
          >
            Manage students
          </button>
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] hover:brightness-110"
            onClick={() => go("managedAlumni")}
          >
            Manage alumni
          </button>
        </div>
        {dashboardPosts()}
        <Section title="Institution requests">
          <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
            {INST.filter((institution) => institutionStatuses[institution[0]] === "Pending").length ? (
              INST.filter((institution) => institutionStatuses[institution[0]] === "Pending").map((institution) => (
                <div className="rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]" key={institution[0]}>
                  <span className="mb-3 inline-flex rounded-full bg-wnb px-3 py-1 text-xs font-bold text-wn">Pending review</span>
                  <h3 className="mb-1">{institution[0]}</h3>
                  <p className="text-[13px] text-mut">{institution[1]} · {institution[2]} members</p>
                  <button className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110" onClick={() => ask(`Approve ${institution[0]} as an active institution?`, () => {
                    setInstitutionStatuses((statuses) => ({ ...statuses, [institution[0]]: "Active" }));
                    toast("Institution approved");
                  })}>Review request</button>
                </div>
              ))
            ) : (
              <div className="rounded-[18px] border border-ln bg-sf p-[18px] text-[13px] text-mut">You’re all caught up. There are no institution requests waiting for review.</div>
            )}
          </div>
        </Section>
        <Section title="Network at a glance">
          <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
            {INST.map((institution) => (
              <div className="rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]" key={institution[0]}>
                <div className="flex items-start justify-between gap-3">
                  <div><h3 className="mb-1">{institution[0]}</h3><p className="text-[13px] text-mut">{institution[1]}</p></div>
                  <span className={`inline-block rounded-full px-[9px] py-0.5 text-xs font-bold ${institutionStatuses[institution[0]] === "Active" ? "bg-okb text-ok" : "bg-wnb text-wn"}`}>{institutionStatuses[institution[0]]}</span>
                </div>
                <p className="mt-4 text-sm"><b>{institution[2]}</b> <span className="text-mut">members</span></p>
              </div>
            ))}
          </div>
        </Section>
      </>
    );
  };

  const pages = {
    dash: () => me.role === "admin" ? adminDashboard() : me.role === "alumni" ? alumniDashboard() : studentDashboard(),
    students: () => managedUsersPage("student", managedStudents),
    managedAlumni: () => managedUsersPage("alumni", managedAlumni),
    institutions: () => {
      const pending = INST.filter((institution) => institutionStatuses[institution[0]] === "Pending");
      return (
        <>
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-pri">Administration</span>
            <h2 className="mt-1">Institution directory</h2>
            <p className="mt-2 text-[13px] text-mut">Review requests and monitor the institutions in your network.</p>
          </div>
          <Stats items={[["All institutions", INST.length], ["Awaiting review", pending.length], ["Active communities", INST.length - pending.length]]} />
          <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
            {INST.map((institution) => (
              <div className="rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]" key={institution[0]}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div><h3 className="mb-1">{institution[0]}</h3><p className="text-[13px] text-mut">{institution[1]}</p></div>
                  <span className={`inline-block rounded-full px-[9px] py-0.5 text-xs font-bold ${institutionStatuses[institution[0]] === "Active" ? "bg-okb text-ok" : "bg-wnb text-wn"}`}>{institutionStatuses[institution[0]]}</span>
                </div>
                <p className="text-sm"><b>{institution[2]}</b> <span className="text-mut">members</span></p>
                {institutionStatuses[institution[0]] === "Pending" && (
                  <button className="mt-4 inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110" onClick={() => ask(`Approve ${institution[0]} as an active institution?`, () => {
                    setInstitutionStatuses((statuses) => ({ ...statuses, [institution[0]]: "Active" }));
                    toast("Institution approved");
                  })}>Approve institution</button>
                )}
              </div>
            ))}
          </div>
        </>
      );
    },

    dir: () => {
      const l = ALUMNI.filter(
        (a) =>
          (a[0] + a[2] + a[5]).toLowerCase().includes(q.toLowerCase()) &&
          (!batch || a[4] === Number(batch)),
      );
      return (
        <>
          <h2>Find Alumni</h2>
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              className="min-w-[180px] flex-[2_1_0%]"
              placeholder="Search by name, company or skill..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="min-w-[120px] flex-1"
              value={batch}
              onChange={(e) => setBatch(e.target.value)}
            >
              <option value="">All batches</option>
              {[2017, 2018, 2019, 2020, 2021].map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
            <button
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 border border-ln bg-none bg-sf text-ink"
              onClick={() => setView(view === "grid" ? "list" : "grid")}
            >
              {view === "grid" ? "List view" : "Grid view"}
            </button>
          </div>
          <p className="text-[13px] text-mut">
            {l.length} alumni in {me.uni} only
          </p>
          {l.length ? (
            <div className={`grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))] ${view === "list" ? "grid-cols-1" : ""}`}>
              {l.map((a) => alumniCard(a))}
            </div>
          ) : (
            <EmptyState>No alumni found matching your filters.</EmptyState>
          )}
        </>
      );
    },

    mentor: () => (
      <>
        <h2>Find Your Mentor</h2>
        <p className="text-[13px] text-mut">
          Discover alumni who match your interests, skills and career goals.
        </p>
        <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {[...ALUMNI]
            .sort((a, b) => b[6] - a[6])
            .map((a) => alumniCard(a, true))}
        </div>
      </>
    ),

    jobs: () => {
      const l = jobs.map((j, i) => [j, i]).filter(
        ([j]) =>
          (j[0] + j[1]).toLowerCase().includes(q.toLowerCase()) &&
          (!typ || j[3] === typ),
      );
      return (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-pri">Career opportunities</span>
              <h2 className="mt-1">Jobs & Internships</h2>
            </div>
          </div>
          {me.role === "alumni" && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-violet-50 p-5 shadow-sm sm:p-6">
              <div className="max-w-xl">
                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-indigo-700 shadow-sm">For alumni</span>
                <h3 className="mt-3 text-lg font-extrabold text-slate-900">Help a student take their next step</h3>
                <p className="mt-1 text-sm text-slate-600">Share an open role or internship with your university community.</p>
              </div>
              <button
                className="inline-flex flex-none cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 font-bold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:shadow-xl"
                onClick={() => setShowJobPost(true)}
              >
                <span aria-hidden="true" className="text-lg leading-none">+</span> Post an opportunity
              </button>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              className="min-w-[180px] flex-[2_1_0%]"
              placeholder="Search jobs, internships or companies..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select
              className="min-w-[120px] flex-1"
              value={typ}
              onChange={(e) => setTyp(e.target.value)}
            >
              <option value="">All types</option>
              <option>Job</option>
              <option>Internship</option>
            </select>
          </div>
          {l.length ? (
            <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">{l.map(([j, i]) => jobCard(j, i))}</div>
          ) : (
            <EmptyState>No jobs match your search.</EmptyState>
          )}
          {!Object.values(saved).some(Boolean) && (
            <p className="text-[13px] text-mut">You haven't saved any jobs yet.</p>
          )}
        </>
      );
    },

    events: () => (
      <>
        <h2>Events</h2>
        <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">{EVENTS.map(eventCard)}</div>
      </>
    ),

    forum: () => (
      <>
        <div className="flex flex-wrap items-center gap-2.5 justify-between">
          <h2>Forum</h2>
          <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110" onClick={() => setShowPost(true)}>
            Create post
          </button>
        </div>
        {posts.length ? (
          <div className="grid grid-cols-1 gap-[14px] sm:grid-cols-2 xl:grid-cols-3">
            {posts.map(forumPostCard)}
          </div>
        ) : (
          <EmptyState>No forum posts yet. Be the first to start a discussion.</EmptyState>
        )}
      </>
    ),

    msg: () => <Messages chat={chat} setChat={setChat} uni={me.uni} />,

    notif: () => (
      <>
        <div className="flex flex-wrap items-center gap-2.5 justify-between">
          <h2>Notifications</h2>
          <button
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 border border-ln bg-none bg-sf text-ink"
            onClick={() => setNotifs((n) => n.map((x) => [x[0], 0]))}
          >
            Mark all as read
          </button>
        </div>
        {notifs.map((n, i) => (
          <div className="rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)] flex flex-wrap items-center gap-2.5 justify-between mb-2" key={i}>
            {n[1] ? <span className="inline-block rounded-full bg-soft px-[9px] py-0.5 text-xs font-bold text-pri">New</span> : null}
            <span className="flex-1">{n[0]}</span>
            <button
              className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 border border-ln bg-none bg-sf text-ink !px-3 !py-1.5 !text-[13px]"
              onClick={() =>
                setNotifs((all) => all.map((x, j) => (j === i ? [x[0], 0] : x)))
              }
            >
              Mark as read
            </button>
          </div>
        ))}
      </>
    ),

    profile: () => <Profile me={me} onSave={onUpdateMe} toast={toast} />,

    settings: () => (
      <>
        <h2>Settings</h2>
        <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(250px,1fr))]">
          {[
            "Email notifications",
            "Mentorship request alerts",
            "Show my profile to my university only",
          ].map((x) => (
            <label className="rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)] flex flex-wrap items-center gap-2.5 justify-between m-0" key={x}>
              <span>{x}</span>
              <input className="w-auto" type="checkbox" defaultChecked />
            </label>
          ))}
        </div>
        <button
          className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 border border-ln bg-none bg-sf text-ink"
          onClick={() => ask("Log out from all devices?", onLogout)}
        >
          Log out from all devices
        </button>
      </>
    ),
  };

  const sub = me.role === "admin"
    ? "Platform administration"
    : me.role === "alumni"
      ? "Alumni"
      : me.uni?.startsWith("Far Western")
      ? "School of Engineering · Computer Program"
      : "Private community";

  return (
    <div className="portal-shell relative isolate min-h-screen overflow-x-clip">
      <div className="pointer-events-none absolute -left-40 top-24 z-0 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 top-[35rem] z-0 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl" />
      <div className="relative z-10">
        <Navbar
          university={me.uni}
          subtitle={sub}
          newCount={newCount}
          activePage={page}
          onNavigate={go}
          onLogout={onLogout}
        />
        <div className="grid min-h-[calc(100vh-76px)] grid-cols-[230px_minmax(0,1fr)] max-[760px]:min-h-0 max-[760px]:block">
          <Sidebar page={page} role={me.role} onNavigate={go} />
          <main className="mx-auto w-full max-w-[1320px] min-w-0 space-y-7 p-4 sm:p-6 lg:p-8">
            {loading ? (
              <div className="grid gap-[14px] [grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr))]">
                <div className="h-[110px] rounded-[18px] bg-[linear-gradient(90deg,var(--ln),var(--soft),var(--ln))] [background-size:200%] motion-reduce:animate-none animate-[sh_1s_infinite]" />
                <div className="h-[110px] rounded-[18px] bg-[linear-gradient(90deg,var(--ln),var(--soft),var(--ln))] [background-size:200%] motion-reduce:animate-none animate-[sh_1s_infinite]" />
                <div className="h-[110px] rounded-[18px] bg-[linear-gradient(90deg,var(--ln),var(--soft),var(--ln))] [background-size:200%] motion-reduce:animate-none animate-[sh_1s_infinite]" />
              </div>
            ) : (
              pages[page]()
            )}
          </main>
        </div>

        <footer className="bg-slate-950 px-6 py-12 text-white sm:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
              <div>
                <p className="text-lg font-extrabold tracking-tight">
                  Alumni-Student Connect
                </p>
                <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
                  Stronger connections today. More possibilities tomorrow.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Contact</h3>
                <p className="mt-3 text-xs text-slate-400">
                  Sample details for demonstration
                </p>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Email</h3>
                <a
                  className="mt-3 inline-block text-sm text-indigo-300 transition hover:text-white"
                  href="mailto:hello@example.org"
                >
                  hello@example.org
                </a>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Phone</h3>
                <a
                  className="mt-3 inline-block text-sm text-indigo-300 transition hover:text-white"
                  href="tel:+12025550147"
                >
                  +1 (202) 555-0147
                </a>
                <p className="mt-2 text-xs text-slate-400">
                  123 Demo Street, Example City
                </p>
              </div>
            </div>
            <p className="mt-10 border-t border-white/10 pt-5 text-center text-xs text-slate-500">
              © {new Date().getFullYear()} Alumni-Student Connect. All rights
              reserved.
            </p>
          </div>
        </footer>

        {showPost && (
          <PostModal
            onCancel={() => setShowPost(false)}
            onPublish={(p) => {
              setPosts((all) => [
                ["You", me.role[0].toUpperCase() + me.role.slice(1), p.cat, p.title, p.body, 0],
                ...all,
              ]);
              setShowPost(false);
              toast("Published");
            }}
            toast={toast}
          />
        )}
        {showJobPost && (
          <JobPostModal
            onCancel={() => setShowJobPost(false)}
            onPublish={(job) => {
              setJobs((all) => [job, ...all]);
              setShowJobPost(false);
              toast("Opportunity published");
            }}
          />
        )}
      </div>
    </div>
  );
}
