import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import useAuth from "../auth/useAuth";
import ConfirmModal from "../components/ConfirmModal";

const modules = [
  { id: "overview", label: "Platform Dashboard", icon: "▦", group: "Platform" },
  { id: "tenants", label: "Tenant Management", icon: "⌂", group: "Manage" },
  { id: "users", label: "User Management", icon: "♙", group: "Manage" },
  { id: "admins", label: "Admin Management", icon: "♧", group: "Manage" },
  { id: "access", label: "Access Control", icon: "◈", group: "Manage" },
  { id: "departments", label: "Departments", icon: "▤", group: "Manage" },
  { id: "ai", label: "AI Management", icon: "✳", group: "Platform" },
  { id: "moderation", label: "Moderation", icon: "⚑", group: "Platform" },
  { id: "settings", label: "System Settings", icon: "⚙", group: "Platform" },
  { id: "analytics", label: "Analytics", icon: "▥", group: "Insights" },
  { id: "audit", label: "Audit Logs", icon: "≡", group: "Insights" },
];

const permissionCatalog = [
  { id: "users.manage", label: "View and manage university users" },
  { id: "departments.manage", label: "Manage university departments" },
  { id: "reports.review", label: "Review university reports" },
];
const manageableRoles = ["student", "alumni", "institute_admin"];
const panelClass =
  "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6";
const buttonClass =
  "inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-wait disabled:opacity-50";
const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

const getErrorMessage = (error) =>
  error.response?.data?.message || "The request could not be completed. Please try again.";

function ModuleHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-600">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

function MetricCard({ label, value, note, tone = "indigo" }) {
  const tones = {
    indigo: "bg-indigo-50 text-indigo-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className={panelClass}>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
        {value}
      </p>
      <p className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>
        {note}
      </p>
    </div>
  );
}

function StatusPill({ status }) {
  const classes =
    status === "active" || status === "resolved"
      ? "bg-emerald-50 text-emerald-700"
      : status === "suspended" || status === "critical"
        ? "bg-rose-50 text-rose-700"
        : status === "investigating" || status === "pending" || status === "high"
          ? "bg-amber-50 text-amber-800"
          : "bg-slate-100 text-slate-600";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${classes}`}>
      {status || "unknown"}
    </span>
  );
}

function EmptyList({ children }) {
  return (
    <p className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {children}
    </p>
  );
}

export default function SuperAdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [statistics, setStatistics] = useState(null);
  const [institutes, setInstitutes] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [adminsError, setAdminsError] = useState("");
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [settings, setSettings] = useState(null);
  const [aiStatus, setAiStatus] = useState(null);
  const [reports, setReports] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [instituteForm, setInstituteForm] = useState({ name: "", slug: "" });
  const [adminForm, setAdminForm] = useState({
    tenantId: "",
    name: "",
    email: "",
    password: "",
  });
  const [departmentForm, setDepartmentForm] = useState({
    tenantId: "",
    name: "",
    code: "",
  });
  const [reportForm, setReportForm] = useState({
    tenantId: "",
    title: "",
    details: "",
    category: "other",
    severity: "medium",
    reporterName: "",
  });
  const [editingTenant, setEditingTenant] = useState(null);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [
        dashboardResponse,
        institutesResponse,
        adminsResponse,
        usersResponse,
        departmentsResponse,
        settingsResponse,
        aiResponse,
        reportsResponse,
        analyticsResponse,
        auditResponse,
      ] = await Promise.all([
        axiosClient.get("/super-admin/dashboard"),
        axiosClient.get("/super-admin/institutes"),
        axiosClient.get("/super-admin/admins"),
        axiosClient.get("/super-admin/users"),
        axiosClient.get("/super-admin/departments"),
        axiosClient.get("/super-admin/settings"),
        axiosClient.get("/super-admin/ai/status"),
        axiosClient.get("/super-admin/reports"),
        axiosClient.get("/super-admin/analytics"),
        axiosClient.get("/super-admin/audit-logs"),
      ]);
      const availableInstitutes = institutesResponse.data.institutes;
      setStatistics(dashboardResponse.data.statistics);
      setInstitutes(availableInstitutes);
      setAdmins(adminsResponse.data.admins);
      setUsers(usersResponse.data.users);
      setDepartments(departmentsResponse.data.departments);
      setSettings(settingsResponse.data.settings);
      setAiStatus(aiResponse.data);
      setReports(reportsResponse.data.reports);
      setAnalytics(analyticsResponse.data);
      setAuditLogs(auditResponse.data.logs);
      setAdminForm((current) => ({
        ...current,
        tenantId: current.tenantId || availableInstitutes[0]?._id || "",
      }));
      setDepartmentForm((current) => ({
        ...current,
        tenantId: current.tenantId || availableInstitutes[0]?._id || "",
      }));
      setReportForm((current) => ({
        ...current,
        tenantId: current.tenantId || availableInstitutes[0]?._id || "",
      }));
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(loadDashboard);
  }, [loadDashboard]);

  const refreshAdmins = useCallback(async () => {
    setAdminsLoading(true);
    setAdminsError("");
    try {
      const { data } = await axiosClient.get("/super-admin/admins");
      setAdmins(data.admins);
      return data.admins;
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setAdminsError(message);
      throw requestError;
    } finally {
      setAdminsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeModule !== "admins") return;
    Promise.resolve()
      .then(refreshAdmins)
      .catch(() => {});
  }, [activeModule, refreshAdmins]);

  const runAction = async (action, successMessage) => {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await action();
      await loadDashboard();
      setNotice(
        typeof successMessage === "function"
          ? successMessage(response)
          : successMessage,
      );
      return true;
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleCreateInstitute = (event) => {
    event.preventDefault();
    runAction(
      () => axiosClient.post("/super-admin/institutes", instituteForm),
      "University created successfully.",
    ).then((succeeded) => {
      if (succeeded) setInstituteForm({ name: "", slug: "" });
    });
  };

  const saveInstitute = (event) => {
    event.preventDefault();
    if (!editingTenant) return;
    runAction(
      () =>
        axiosClient.patch(
          `/super-admin/institutes/${editingTenant._id}`,
          editingTenant,
        ),
      "University updated successfully.",
    ).then((succeeded) => {
      if (succeeded) setEditingTenant(null);
    });
  };

  const handleCreateAdmin = (event) => {
    event.preventDefault();
    const { tenantId, ...credentials } = adminForm;
    runAction(
      () =>
        axiosClient.post(
          `/super-admin/institutes/${tenantId}/admins`,
          credentials,
        ),
      ({ data }) => {
        const createdAdmin = data.user;
        const institute = institutes.find((item) => item._id === tenantId);
        setAdmins((current) => [
          {
            id: createdAdmin.id,
            name: createdAdmin.name,
            email: createdAdmin.email,
            role: createdAdmin.role,
            status: createdAdmin.status,
            institute: institute
              ? {
                  id: institute._id,
                  name: institute.name,
                  slug: institute.slug,
                }
              : null,
          },
          ...current.filter((admin) => admin.id !== createdAdmin.id),
        ]);
        return data.emailSent
          ? "Institute admin account created and welcome email sent."
          : "Institute admin account created, but the welcome email could not be sent. Check backend email settings.";
      },
    ).then((succeeded) => {
      if (succeeded) {
        setAdminForm((current) => ({
          ...current,
          name: "",
          email: "",
          password: "",
        }));
      }
    });
  };

  const updateUser = (id, patch) =>
    runAction(
      () => axiosClient.patch(`/super-admin/users/${id}`, patch),
      "User updated successfully.",
    );

  const saveDepartment = (event) => {
    event.preventDefault();
    if (!editingDepartment) return;
    runAction(
      () =>
        axiosClient.patch(
          `/super-admin/departments/${editingDepartment._id}`,
          {
            name: editingDepartment.name,
            code: editingDepartment.code,
          },
        ),
      "Department updated successfully.",
    ).then((succeeded) => {
      if (succeeded) setEditingDepartment(null);
    });
  };

  const updateSettings = (patch, successMessage = "Platform settings saved.") =>
    runAction(
      () => axiosClient.patch("/super-admin/settings", patch),
      successMessage,
    );

  const togglePermission = (role, permission) => {
    const permissions = { ...(settings?.permissions || {}) };
    const assigned = permissions[role] || [];
    permissions[role] = assigned.includes(permission)
      ? assigned.filter((value) => value !== permission)
      : [...assigned, permission];
    updateSettings({ permissions });
  };

  const activeModuleDetails = modules.find((item) => item.id === activeModule);
  const openReports = reports.filter((report) =>
    ["open", "investigating"].includes(report.status),
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-600 text-lg font-black text-white">
              SC
            </span>
            <span>
              <span className="block text-sm font-black tracking-tight">Student Alumni Connect</span>
              <span className="block text-xs font-semibold text-slate-500">Platform administration</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className={`${buttonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
              onClick={() => {
                setError("");
                setLoading(true);
                loadDashboard();
              }}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <span className="hidden text-right md:block">
              <span className="block text-sm font-bold">{user.name}</span>
              <span className="block text-xs text-slate-500">{user.email}</span>
            </span>
            <button
              type="button"
              className={`${buttonClass} bg-slate-900 text-white hover:bg-slate-700`}
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 lg:sticky lg:top-[88px]">
          <p className="px-3 pb-2 pt-1 text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-400">
            Workspace
          </p>
          {["Platform", "Manage", "Insights"].map((group) => (
            <div key={group} className="mb-3">
              <p className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                {group}
              </p>
              <nav aria-label={`${group} modules`} className="grid grid-cols-2 gap-1 lg:grid-cols-1">
                {modules
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveModule(item.id)}
                      aria-current={activeModule === item.id ? "page" : undefined}
                      className={`flex min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition sm:text-sm ${
                        activeModule === item.id
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-white text-sm shadow-sm">
                        {item.icon}
                      </span>
                      <span className="truncate">{item.label}</span>
                    </button>
                  ))}
              </nav>
            </div>
          ))}
          <div className="mt-4 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-700">Platform status</p>
            <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              API connected
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500">
              Super Admin <span className="px-1 text-slate-300">/</span>{" "}
              <span className="text-slate-800">{activeModuleDetails?.label}</span>
            </p>
            <p className="text-xs text-slate-400">Cross-university administration</p>
          </div>
          {error && (
            <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
              {error}
            </div>
          )}
          {notice && (
            <div role="status" className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
              {notice}
            </div>
          )}
          {loading ? (
            <div className={`${panelClass} py-16 text-center text-sm font-semibold text-slate-500`}>
              Loading platform data...
            </div>
          ) : (
            <>
              {activeModule === "overview" && (
                <section>
                  <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-indigo-950 to-indigo-800 p-6 text-white shadow-lg sm:p-8">
                    <p className="text-xs font-extrabold uppercase tracking-[0.17em] text-indigo-200">
                      Platform overview
                    </p>
                    <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
                      <div>
                        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                          Good day, {user.name.split(" ")[0]}.
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">
                          Your cross-university control center for tenants, users, platform policy, and safety.
                        </p>
                      </div>
                      <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-3">
                        <p className="text-2xl font-black">{openReports}</p>
                        <p className="text-xs font-semibold text-indigo-100">reports need review</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard label="Universities" value={statistics?.universities ?? 0} note={`${statistics?.universitiesByStatus?.active || 0} active`} />
                    <MetricCard label="Platform users" value={statistics?.users ?? 0} note={`${statistics?.usersByRole?.student || 0} students`} tone="emerald" />
                    <MetricCard label="Departments" value={statistics?.departments ?? 0} note="Across all universities" tone="amber" />
                    <MetricCard label="Open reports" value={statistics?.openReports ?? 0} note="Open or investigating" tone={openReports ? "rose" : "emerald"} />
                  </div>
                  <div className="mt-5 grid gap-5 xl:grid-cols-[1.3fr_1fr]">
                    <section className={panelClass}>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-black">University status</h3>
                          <p className="mt-1 text-xs text-slate-500">Live tenant directory</p>
                        </div>
                        <button type="button" onClick={() => setActiveModule("tenants")} className="text-sm font-bold text-indigo-700 hover:text-indigo-900">Manage</button>
                      </div>
                      {institutes.length ? (
                        <ul className="divide-y divide-slate-100">
                          {institutes.slice(0, 5).map((institute) => (
                            <li key={institute._id} className="flex items-center justify-between gap-4 py-3">
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-bold">{institute.name}</span>
                                <span className="block text-xs text-slate-500">{institute.slug}</span>
                              </span>
                              <StatusPill status={institute.status} />
                            </li>
                          ))}
                        </ul>
                      ) : <EmptyList>No universities have been added yet.</EmptyList>}
                    </section>
                    <section className={panelClass}>
                      <h3 className="font-black">Platform operations</h3>
                      <p className="mt-1 text-xs text-slate-500">Configuration and activity at a glance</p>
                      <dl className="mt-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-sm text-slate-600">New registrations</dt>
                          <StatusPill status={settings?.registrationsEnabled ? "active" : "inactive"} />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-sm text-slate-600">Maintenance mode</dt>
                          <StatusPill status={settings?.maintenanceMode ? "active" : "inactive"} />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <dt className="text-sm text-slate-600">AI provider</dt>
                          <StatusPill status={aiStatus?.providerConfigured ? "active" : "unconfigured"} />
                        </div>
                      </dl>
                      <button type="button" onClick={() => setActiveModule("audit")} className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50">
                        Review recent admin activity <span className="float-right">→</span>
                      </button>
                    </section>
                  </div>
                </section>
              )}

              {activeModule === "tenants" && (
                <section>
                  <ModuleHeading eyebrow="Institution directory" title="Tenant Management" description="Create, edit, activate, or deactivate universities. Deactivated universities cannot sign in or accept new registrations." />
                  <div className="grid items-start gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                    <form className={panelClass} onSubmit={handleCreateInstitute}>
                      <h3 className="mb-4 font-black">Add a university</h3>
                      <label className="mb-1 block text-sm font-bold" htmlFor="tenant-name">University name</label>
                      <input id="tenant-name" className={inputClass} required maxLength={120} value={instituteForm.name} onChange={(event) => setInstituteForm((current) => ({ ...current, name: event.target.value }))} placeholder="Example University" />
                      <label className="mb-1 mt-4 block text-sm font-bold" htmlFor="tenant-slug">Unique slug</label>
                      <input id="tenant-slug" className={inputClass} required pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*" value={instituteForm.slug} onChange={(event) => setInstituteForm((current) => ({ ...current, slug: event.target.value.toLowerCase() }))} placeholder="example-university" />
                      <button className={`${buttonClass} mt-5 w-full bg-indigo-600 text-white hover:bg-indigo-700`} disabled={saving}>Create university</button>
                    </form>
                    <section className={panelClass}>
                      <h3 className="mb-4 font-black">All universities <span className="ml-1 text-sm font-semibold text-slate-400">{institutes.length}</span></h3>
                      {institutes.length ? (
                        <div className="space-y-3">
                          {institutes.map((institute) => (
                            <article key={institute._id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                              <div className="min-w-0">
                                <p className="truncate font-bold">{institute.name}</p>
                                <p className="mt-1 truncate text-xs text-slate-500">{institute.slug}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <StatusPill status={institute.status} />
                                <button type="button" className={`${buttonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`} onClick={() => setEditingTenant({ ...institute })}>Edit</button>
                                <button type="button" className={`${buttonClass} ${institute.status === "active" ? "bg-amber-50 text-amber-800 hover:bg-amber-100" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"}`} disabled={saving} onClick={() => runAction(() => axiosClient.patch(`/super-admin/institutes/${institute._id}`, { status: institute.status === "active" ? "inactive" : "active" }), `University ${institute.status === "active" ? "deactivated" : "activated"}.`)}>
                                  {institute.status === "active" ? "Deactivate" : "Activate"}
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      ) : <EmptyList>Create a university to get started.</EmptyList>}
                    </section>
                  </div>
                </section>
              )}

              {activeModule === "users" && (
                <section>
                  <ModuleHeading eyebrow="Cross-tenant accounts" title="User Management" description="Review all student, alumni, and university admin accounts across the platform. Role and status changes take effect on the user's next request." />
                  <section className={`${panelClass} overflow-hidden`}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-black">All users <span className="ml-1 text-sm font-semibold text-slate-400">{users.length}</span></h3>
                      <span className="text-xs text-slate-500">Showing up to 500 most recently created accounts</span>
                    </div>
                    {users.length ? (
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                            <tr><th className="pb-3 pr-4">User</th><th className="pb-3 pr-4">University</th><th className="pb-3 pr-4">Role</th><th className="pb-3">Status</th></tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {users.map((account) => (
                              <tr key={account.id}>
                                <td className="py-4 pr-4"><p className="font-bold">{account.name}</p><p className="text-xs text-slate-500">{account.email}</p></td>
                                <td className="py-4 pr-4 text-slate-600">{account.tenant?.name || "No university"}</td>
                                <td className="py-4 pr-4"><select aria-label={`Role for ${account.name}`} className={`${inputClass} min-w-40 py-2`} disabled={saving} value={account.role} onChange={(event) => updateUser(account.id, { role: event.target.value })}>{manageableRoles.map((role) => <option key={role} value={role}>{role.replace("_", " ")}</option>)}</select></td>
                                <td className="py-4"><select aria-label={`Status for ${account.name}`} className={`${inputClass} min-w-32 py-2`} disabled={saving} value={account.status} onChange={(event) => updateUser(account.id, { status: event.target.value })}>{["active", "pending", "suspended"].map((status) => <option key={status} value={status}>{status}</option>)}</select></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : <EmptyList>No platform users found.</EmptyList>}
                  </section>
                </section>
              )}

              {activeModule === "admins" && (
                <section>
                  <ModuleHeading
                    eyebrow="Institution access"
                    title="Admin Management"
                    description="Provision university administrators and manage or revoke their accounts."
                    action={
                      <button
                        type="button"
                        className={`${buttonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}
                        onClick={() => refreshAdmins().catch(() => {})}
                        disabled={adminsLoading}
                      >
                        {adminsLoading ? "Refreshing…" : "Refresh admins"}
                      </button>
                    }
                  />
                  {adminsError && (
                    <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                      Could not load university admins: {adminsError}
                    </div>
                  )}
                  <div className="grid items-start gap-5 xl:grid-cols-[0.8fr_1.2fr]">
                    <form className={panelClass} onSubmit={handleCreateAdmin}>
                      <h3 className="mb-4 font-black">Create university admin</h3>
                      <label className="mb-1 block text-sm font-bold" htmlFor="admin-tenant">University</label>
                      <select id="admin-tenant" className={inputClass} required value={adminForm.tenantId} disabled={!institutes.length} onChange={(event) => setAdminForm((current) => ({ ...current, tenantId: event.target.value }))}>
                        {institutes.map((institute) => <option key={institute._id} value={institute._id}>{institute.name}</option>)}
                        {!institutes.length && <option value="">Create a university first</option>}
                      </select>
                      <label className="mb-1 mt-4 block text-sm font-bold" htmlFor="admin-name">Full name</label>
                      <input id="admin-name" className={inputClass} required value={adminForm.name} onChange={(event) => setAdminForm((current) => ({ ...current, name: event.target.value }))} />
                      <label className="mb-1 mt-4 block text-sm font-bold" htmlFor="admin-email">Email</label>
                      <input id="admin-email" type="email" className={inputClass} required value={adminForm.email} onChange={(event) => setAdminForm((current) => ({ ...current, email: event.target.value }))} />
                      <label className="mb-1 mt-4 block text-sm font-bold" htmlFor="admin-password">Temporary password</label>
                      <input id="admin-password" type="password" minLength={8} className={inputClass} required value={adminForm.password} onChange={(event) => setAdminForm((current) => ({ ...current, password: event.target.value }))} />
                      <button className={`${buttonClass} mt-5 w-full bg-indigo-600 text-white hover:bg-indigo-700`} disabled={saving || !institutes.length}>Create admin account</button>
                    </form>
                    <section className={panelClass}>
                      <h3 className="mb-4 font-black">University admins <span className="ml-1 text-sm font-semibold text-slate-400">{admins.length}</span></h3>
                      {adminsLoading && !admins.length ? <EmptyList>Loading university admins…</EmptyList> : admins.length ? <div className="space-y-3">{admins.map((admin) => (
                        <article key={admin.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                          <div className="min-w-0"><p className="truncate font-bold">{admin.name}</p><p className="truncate text-xs text-slate-500">{admin.email}</p><p className="mt-1 text-xs text-indigo-700">{admin.institute?.name || "University unavailable"}</p></div>
                          <div className="flex items-center gap-2"><StatusPill status={admin.status} /><button type="button" className={`${buttonClass} bg-rose-50 text-rose-700 hover:bg-rose-100`} disabled={saving} onClick={() => setConfirming({ message: `Delete ${admin.name}'s university admin account? This cannot be undone.`, action: () => runAction(() => axiosClient.delete(`/super-admin/admins/${admin.id}`), "Admin account deleted.") })}>Delete</button></div>
                        </article>
                      ))}</div> : <EmptyList>No university admins have been created.</EmptyList>}
                    </section>
                  </div>
                </section>
              )}

              {activeModule === "access" && (
                <section>
                  <ModuleHeading eyebrow="Role-based policy" title="Access Control" description="Assign roles in User Management and configure capabilities for each role. Super Admin accounts are deliberately excluded from cross-tenant role changes." />
                  <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm leading-6 text-indigo-900">
                    Changes to <strong>View and manage university users</strong> are enforced on the university admin user-list APIs. Other capability keys are saved for policy definition and require a corresponding feature endpoint before they grant access.
                  </div>
                  <div className="space-y-4">
                    {manageableRoles.map((role) => (
                      <section key={role} className={panelClass}>
                        <div className="mb-4 flex items-center justify-between gap-3">
                          <div><h3 className="font-black capitalize">{role.replace("_", " ")}</h3><p className="mt-1 text-xs text-slate-500">Capabilities assigned to this role</p></div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{statistics?.usersByRole?.[role] || 0} users</span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {permissionCatalog.map((permission) => {
                            const checked = (settings?.permissions?.[role] || []).includes(permission.id);
                            return <label key={permission.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-3 text-sm">
                              <input type="checkbox" className="mt-1 h-4 w-4 accent-indigo-600" checked={checked} disabled={saving} onChange={() => togglePermission(role, permission.id)} />
                              <span><span className="block font-bold text-slate-800">{permission.label}</span><span className="mt-1 block font-mono text-[11px] text-slate-400">{permission.id}</span></span>
                            </label>;
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </section>
              )}

              {activeModule === "departments" && (
                <section>
                  <ModuleHeading eyebrow="Institution structure" title="Departments" description="Maintain department directories under each university. Department codes are unique within their university." />
                  <form className={`${panelClass} mb-5`} onSubmit={(event) => {
                    event.preventDefault();
                    runAction(() => axiosClient.post("/super-admin/departments", departmentForm), "Department created.")
                      .then((succeeded) => {
                        if (succeeded) setDepartmentForm((current) => ({ ...current, name: "", code: "" }));
                      });
                  }}>
                    <div className="grid items-end gap-4 sm:grid-cols-2 xl:grid-cols-[1.3fr_1fr_0.7fr_auto]">
                      <div><label className="mb-1 block text-sm font-bold" htmlFor="department-tenant">University</label><select id="department-tenant" className={inputClass} required value={departmentForm.tenantId} onChange={(event) => setDepartmentForm((current) => ({ ...current, tenantId: event.target.value }))}>{institutes.map((institute) => <option key={institute._id} value={institute._id}>{institute.name}</option>)}</select></div>
                      <div><label className="mb-1 block text-sm font-bold" htmlFor="department-name">Department</label><input id="department-name" className={inputClass} required value={departmentForm.name} onChange={(event) => setDepartmentForm((current) => ({ ...current, name: event.target.value }))} placeholder="Computer Science" /></div>
                      <div><label className="mb-1 block text-sm font-bold" htmlFor="department-code">Code</label><input id="department-code" className={inputClass} required maxLength={16} value={departmentForm.code} onChange={(event) => setDepartmentForm((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="CS" /></div>
                      <button className={`${buttonClass} bg-indigo-600 text-white hover:bg-indigo-700`} disabled={saving || !institutes.length}>Add department</button>
                    </div>
                  </form>
                  <section className={`${panelClass} overflow-hidden`}>
                    <h3 className="mb-4 font-black">Department directory <span className="ml-1 text-sm font-semibold text-slate-400">{departments.length}</span></h3>
                    {departments.length ? <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="pb-3">Department</th><th className="pb-3">University</th><th className="pb-3">Code</th><th className="pb-3">Status</th><th className="pb-3">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{departments.map((department) => <tr key={department._id}><td className="py-3 font-bold">{department.name}</td><td className="py-3 text-slate-600">{department.tenantId?.name || "University unavailable"}</td><td className="py-3 font-mono text-xs">{department.code}</td><td className="py-3"><StatusPill status={department.status} /></td><td className="py-3"><button type="button" className={`${buttonClass} mr-2 bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200`} disabled={saving} onClick={() => setEditingDepartment({ ...department })}>Edit</button><button type="button" className={`${buttonClass} mr-2 bg-slate-100 px-3 py-2 text-xs text-slate-700 hover:bg-slate-200`} disabled={saving} onClick={() => runAction(() => axiosClient.patch(`/super-admin/departments/${department._id}`, { status: department.status === "active" ? "inactive" : "active" }), "Department status updated.")}>{department.status === "active" ? "Deactivate" : "Activate"}</button><button type="button" className={`${buttonClass} bg-rose-50 px-3 py-2 text-xs text-rose-700 hover:bg-rose-100`} disabled={saving} onClick={() => setConfirming({ message: `Delete the ${department.name} department?`, action: () => runAction(() => axiosClient.delete(`/super-admin/departments/${department._id}`), "Department deleted.") })}>Delete</button></td></tr>)}</tbody></table></div> : <EmptyList>No departments yet. Add a department above.</EmptyList>}
                  </section>
                </section>
              )}

              {activeModule === "ai" && (
                <section>
                  <ModuleHeading eyebrow="AI services" title="AI Management" description="Control whether recommendation and mentor-matching features are enabled, and check provider configuration." />
                  <div className={`mb-5 border ${aiStatus?.providerConfigured ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"} rounded-2xl p-5`}>
                    <div className="flex items-start gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-lg">✳</span>
                      <div><p className="font-black">{aiStatus?.providerConfigured ? `Provider configured${aiStatus.providerName ? `: ${aiStatus.providerName}` : ""}` : "AI provider not configured"}</p><p className="mt-1 text-sm leading-6 text-slate-600">{aiStatus?.message}</p></div>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { key: "aiRecommendationsEnabled", title: "AI recommendations", text: "Allow AI-powered recommendations to be available to the platform." },
                      { key: "mentorMatchingEnabled", title: "Mentor matching", text: "Allow AI-assisted mentor matching to be available to the platform." },
                    ].map((feature) => <section key={feature.key} className={panelClass}>
                      <div className="flex items-start justify-between gap-4">
                        <div><h3 className="font-black">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{feature.text}</p></div>
                        <button type="button" role="switch" aria-checked={Boolean(settings?.[feature.key])} aria-label={`Toggle ${feature.title}`} disabled={saving} onClick={() => updateSettings({ [feature.key]: !settings?.[feature.key] })} className={`relative h-7 w-12 shrink-0 rounded-full transition ${settings?.[feature.key] ? "bg-indigo-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${settings?.[feature.key] ? "left-6" : "left-1"}`} /></button>
                      </div>
                      <p className="mt-5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">Feature switch: <StatusPill status={settings?.[feature.key] ? "active" : "inactive"} /></p>
                    </section>)}
                  </div>
                  <p className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">Runtime recommendation volume, match quality, and latency are not yet collected because this application has no connected AI inference or telemetry service. Enabling a switch alone does not provide an AI integration.</p>
                </section>
              )}

              {activeModule === "moderation" && (
                <section>
                  <ModuleHeading eyebrow="Trust and safety" title="Platform Moderation" description="Create and triage serious platform-wide reports. Reports added here can be used for cases received outside the current application." />
                  <form className={`${panelClass} mb-5`} onSubmit={(event) => {
                    event.preventDefault();
                    const payload = { ...reportForm, tenantId: reportForm.tenantId || null };
                    runAction(() => axiosClient.post("/super-admin/reports", payload), "Report added to the moderation queue.")
                      .then((succeeded) => {
                        if (succeeded) {
                          setReportForm((current) => ({ ...current, title: "", details: "", reporterName: "" }));
                        }
                      });
                  }}>
                    <h3 className="mb-4 font-black">Log a report</h3>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                      <div className="xl:col-span-2"><label className="mb-1 block text-sm font-bold" htmlFor="report-title">Report title</label><input id="report-title" className={inputClass} required maxLength={160} value={reportForm.title} onChange={(event) => setReportForm((current) => ({ ...current, title: event.target.value }))} /></div>
                      <div><label className="mb-1 block text-sm font-bold" htmlFor="report-category">Category</label><select id="report-category" className={inputClass} value={reportForm.category} onChange={(event) => setReportForm((current) => ({ ...current, category: event.target.value }))}>{["safety", "harassment", "spam", "fraud", "other"].map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
                      <div><label className="mb-1 block text-sm font-bold" htmlFor="report-severity">Severity</label><select id="report-severity" className={inputClass} value={reportForm.severity} onChange={(event) => setReportForm((current) => ({ ...current, severity: event.target.value }))}>{["low", "medium", "high", "critical"].map((value) => <option key={value} value={value}>{value}</option>)}</select></div>
                      <div><label className="mb-1 block text-sm font-bold" htmlFor="report-tenant">University (optional)</label><select id="report-tenant" className={inputClass} value={reportForm.tenantId} onChange={(event) => setReportForm((current) => ({ ...current, tenantId: event.target.value }))}><option value="">Platform-wide</option>{institutes.map((institute) => <option key={institute._id} value={institute._id}>{institute.name}</option>)}</select></div>
                      <div><label className="mb-1 block text-sm font-bold" htmlFor="report-reporter">Reporter (optional)</label><input id="report-reporter" className={inputClass} value={reportForm.reporterName} onChange={(event) => setReportForm((current) => ({ ...current, reporterName: event.target.value }))} /></div>
                      <div className="md:col-span-2"><label className="mb-1 block text-sm font-bold" htmlFor="report-details">Details</label><textarea id="report-details" className={`${inputClass} min-h-24 resize-y`} required maxLength={4000} value={reportForm.details} onChange={(event) => setReportForm((current) => ({ ...current, details: event.target.value }))} /></div>
                      <div className="flex items-end"><button className={`${buttonClass} w-full bg-indigo-600 text-white hover:bg-indigo-700`} disabled={saving}>Add to queue</button></div>
                    </div>
                  </form>
                  <section className={`${panelClass} overflow-hidden`}>
                    <h3 className="mb-4 font-black">Moderation queue <span className="ml-1 text-sm font-semibold text-slate-400">{reports.length}</span></h3>
                    {reports.length ? <div className="space-y-3">{reports.map((report) => <article key={report._id} className="rounded-xl border border-slate-100 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h4 className="font-bold">{report.title}</h4><StatusPill status={report.severity} /></div><p className="mt-1 text-xs text-slate-500">{report.category} · {report.tenantId?.name || "Platform-wide"} · {report.reporterName || "No reporter listed"}</p></div>
                        <select aria-label={`Status for report ${report.title}`} className={`${inputClass} w-auto min-w-40 py-2`} disabled={saving} value={report.status} onChange={(event) => runAction(() => axiosClient.patch(`/super-admin/reports/${report._id}`, { status: event.target.value }), "Report status updated.")}>{["open", "investigating", "resolved", "dismissed"].map((status) => <option key={status} value={status}>{status}</option>)}</select></div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{report.details}</p>
                    </article>)}</div> : <EmptyList>The moderation queue is clear.</EmptyList>}
                  </section>
                </section>
              )}

              {activeModule === "settings" && settings && (
                <section>
                  <ModuleHeading eyebrow="Global configuration" title="System Settings" description="Configure platform-wide availability and registration behavior." />
                  <div className="space-y-4">
                    {[
                      { key: "registrationsEnabled", title: "Public registration", description: "Allow new students and alumni to register." },
                      { key: "maintenanceMode", title: "Maintenance mode", description: "Block authenticated non-super-admin API access while maintenance is in progress." },
                    ].map((item) => <section key={item.key} className={`${panelClass} flex flex-wrap items-center justify-between gap-4`}>
                      <div><h3 className="font-black">{item.title}</h3><p className="mt-1 text-sm text-slate-500">{item.description}</p></div>
                      <button type="button" role="switch" aria-checked={Boolean(settings[item.key])} aria-label={`Toggle ${item.title}`} disabled={saving} onClick={() => updateSettings({ [item.key]: !settings[item.key] })} className={`relative h-7 w-12 rounded-full transition ${settings[item.key] ? "bg-indigo-600" : "bg-slate-300"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${settings[item.key] ? "left-6" : "left-1"}`} /></button>
                    </section>)}
                  </div>
                  <p className="mt-5 text-xs leading-5 text-slate-500">Maintenance mode does not block public login or registration routes. Use it to stop authenticated application/API traffic during operational work.</p>
                </section>
              )}

              {activeModule === "analytics" && (
                <section>
                  <ModuleHeading eyebrow="Platform usage" title="Analytics" description="Tenant-level account adoption based on current user records." />
                  <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">{analytics?.notice || "Analytics only include account totals. Event and performance telemetry is not available."}</div>
                  <section className={`${panelClass} overflow-hidden`}>
                    <h3 className="mb-4 font-black">Usage by university</h3>
                    {analytics?.tenants?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="pb-3">University</th><th className="pb-3">Status</th><th className="pb-3">Users</th><th className="pb-3">Active users</th><th className="pb-3">Breakdown</th></tr></thead><tbody className="divide-y divide-slate-100">{analytics.tenants.map((tenant) => <tr key={tenant.id}><td className="py-4 font-bold">{tenant.name}</td><td className="py-4"><StatusPill status={tenant.status} /></td><td className="py-4 font-bold">{tenant.users}</td><td className="py-4">{tenant.activeUsers}</td><td className="py-4 text-xs text-slate-500">{Object.entries(tenant.byRole || {}).map(([role, count]) => `${role.replace("_", " ")}: ${count}`).join(" · ") || "No accounts"}</td></tr>)}</tbody></table></div> : <EmptyList>No university analytics are available.</EmptyList>}
                  </section>
                  <p className="mt-4 text-xs text-slate-400">Generated {analytics?.generatedAt ? new Date(analytics.generatedAt).toLocaleString() : "not available"}</p>
                </section>
              )}

              {activeModule === "audit" && (
                <section>
                  <ModuleHeading eyebrow="Administrative history" title="Audit Logs" description="Successful changes made through the Super Admin API. Logs include the acting administrator, operation, route, status, and timestamp; request contents and passwords are not recorded." />
                  <section className={`${panelClass} overflow-hidden`}>
                    <h3 className="mb-4 font-black">Recent activity <span className="ml-1 text-sm font-semibold text-slate-400">{auditLogs.length}</span></h3>
                    {auditLogs.length ? <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase text-slate-500"><tr><th className="pb-3">Administrator</th><th className="pb-3">Operation</th><th className="pb-3">Endpoint</th><th className="pb-3">Result</th><th className="pb-3">Time</th></tr></thead><tbody className="divide-y divide-slate-100">{auditLogs.map((entry) => <tr key={entry.id}><td className="py-4 font-semibold">{entry.actorEmail}</td><td className="py-4"><StatusPill status={entry.method.toLowerCase()} /></td><td className="py-4 font-mono text-xs text-slate-600">{entry.path}</td><td className="py-4">{entry.statusCode}</td><td className="py-4 text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</td></tr>)}</tbody></table></div> : <EmptyList>No admin changes have been logged yet.</EmptyList>}
                    <p className="mt-4 text-xs text-slate-400">Showing the latest 200 records. Logs are captured after successful write requests.</p>
                  </section>
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {editingTenant && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 p-4">
          <form className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="edit-tenant-heading" onSubmit={saveInstitute}>
            <div className="mb-5 flex items-start justify-between gap-3"><div><h2 id="edit-tenant-heading" className="text-xl font-black">Edit university</h2><p className="mt-1 text-sm text-slate-500">Update the display name and unique slug.</p></div><button type="button" aria-label="Close" className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100" onClick={() => setEditingTenant(null)}>×</button></div>
            <label className="mb-1 block text-sm font-bold" htmlFor="edit-tenant-name">University name</label><input id="edit-tenant-name" className={inputClass} required value={editingTenant.name} onChange={(event) => setEditingTenant((current) => ({ ...current, name: event.target.value }))} />
            <label className="mb-1 mt-4 block text-sm font-bold" htmlFor="edit-tenant-slug">Slug</label><input id="edit-tenant-slug" className={inputClass} required pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*" value={editingTenant.slug} onChange={(event) => setEditingTenant((current) => ({ ...current, slug: event.target.value.toLowerCase() }))} />
            <div className="mt-6 flex justify-end gap-2"><button type="button" className={`${buttonClass} border border-slate-200 text-slate-700`} onClick={() => setEditingTenant(null)}>Cancel</button><button type="submit" className={`${buttonClass} bg-indigo-600 text-white`} disabled={saving}>Save changes</button></div>
          </form>
        </div>
      )}
      {editingDepartment && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 p-4">
          <form className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="edit-department-heading" onSubmit={saveDepartment}>
            <div className="mb-5 flex items-start justify-between gap-3">
              <div><h2 id="edit-department-heading" className="text-xl font-black">Edit department</h2><p className="mt-1 text-sm text-slate-500">{editingDepartment.tenantId?.name || "University"}</p></div>
              <button type="button" aria-label="Close" className="rounded-lg px-2 py-1 text-xl text-slate-400 hover:bg-slate-100" onClick={() => setEditingDepartment(null)}>×</button>
            </div>
            <label className="mb-1 block text-sm font-bold" htmlFor="edit-department-name">Department name</label>
            <input id="edit-department-name" className={inputClass} required value={editingDepartment.name} onChange={(event) => setEditingDepartment((current) => ({ ...current, name: event.target.value }))} />
            <label className="mb-1 mt-4 block text-sm font-bold" htmlFor="edit-department-code">Department code</label>
            <input id="edit-department-code" className={inputClass} required maxLength={16} value={editingDepartment.code} onChange={(event) => setEditingDepartment((current) => ({ ...current, code: event.target.value.toUpperCase() }))} />
            <div className="mt-6 flex justify-end gap-2"><button type="button" className={`${buttonClass} border border-slate-200 text-slate-700`} onClick={() => setEditingDepartment(null)}>Cancel</button><button type="submit" className={`${buttonClass} bg-indigo-600 text-white`} disabled={saving}>Save changes</button></div>
          </form>
        </div>
      )}
      {confirming && (
        <ConfirmModal
          message={confirming.message}
          onCancel={() => setConfirming(null)}
          onConfirm={() => {
            const { action } = confirming;
            setConfirming(null);
            action();
          }}
        />
      )}
    </div>
  );
}
