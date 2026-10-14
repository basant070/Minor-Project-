import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import useAuth from "../auth/useAuth";
import ConfirmModal from "../components/ConfirmModal";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message || fallback;

export default function SuperAdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loadingInstitutes, setLoadingInstitutes] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [instituteError, setInstituteError] = useState("");
  const [adminListError, setAdminListError] = useState("");
  const [instituteMessage, setInstituteMessage] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminMessage, setAdminMessage] = useState("");
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(false);
  const [creatingInstitute, setCreatingInstitute] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [instituteForm, setInstituteForm] = useState({ name: "", slug: "" });
  const [adminForm, setAdminForm] = useState({
    tenantId: "",
    name: "",
    email: "",
    password: "",
  });

  const loadInstitutes = useCallback(async () => {
    try {
      const { data } = await axiosClient.get("/super-admin/institutes");
      setInstitutes(data.institutes);
      setAdminForm((current) => ({
        ...current,
        tenantId:
          current.tenantId ||
          (data.institutes.length ? data.institutes[0]._id : ""),
      }));
    } catch (error) {
      setInstituteError(
        getErrorMessage(error, "Could not load institutes. Please try again."),
      );
    } finally {
      setLoadingInstitutes(false);
    }
  }, []);

  const loadAdmins = useCallback(async () => {
    setLoadingAdmins(true);
    setAdminListError("");
    try {
      const { data } = await axiosClient.get("/super-admin/admins");
      setAdmins(data.admins);
    } catch (error) {
      setAdminListError(
        getErrorMessage(error, "Could not load institute admins."),
      );
    } finally {
      setLoadingAdmins(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;
    axiosClient
      .get("/super-admin/institutes")
      .then(({ data }) => {
        if (!isCurrent) return;
        setInstitutes(data.institutes);
        setAdminForm((current) => ({
          ...current,
          tenantId:
            current.tenantId ||
            (data.institutes.length ? data.institutes[0]._id : ""),
        }));
      })
      .catch((error) => {
        if (!isCurrent) return;
        setInstituteError(
          getErrorMessage(error, "Could not load institutes. Please try again."),
        );
      })
      .finally(() => {
        if (isCurrent) setLoadingInstitutes(false);
      });

    axiosClient
      .get("/super-admin/admins")
      .then(({ data }) => {
        if (isCurrent) setAdmins(data.admins);
      })
      .catch((error) => {
        if (isCurrent) {
          setAdminListError(
            getErrorMessage(error, "Could not load institute admins."),
          );
        }
      })
      .finally(() => {
        if (isCurrent) setLoadingAdmins(false);
      });

    return () => {
      isCurrent = false;
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleInstituteSubmit = async (event) => {
    event.preventDefault();
    setInstituteError("");
    setInstituteMessage("");
    setCreatingInstitute(true);
    try {
      const { data } = await axiosClient.post(
        "/super-admin/institutes",
        instituteForm,
      );
      setInstitutes((current) =>
        [...current, data.institute].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setAdminForm((current) => ({
        ...current,
        tenantId: current.tenantId || data.institute._id,
      }));
      setInstituteForm({ name: "", slug: "" });
      setInstituteMessage(data.message);
    } catch (error) {
      setInstituteError(
        getErrorMessage(error, "Could not create the institute."),
      );
    } finally {
      setCreatingInstitute(false);
    }
  };

  const handleAdminSubmit = async (event) => {
    event.preventDefault();
    setAdminError("");
    setAdminMessage("");
    setCreatingAdmin(true);
    try {
      const { data } = await axiosClient.post(
        `/super-admin/institutes/${adminForm.tenantId}/admins`,
        {
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password,
        },
      );
      const institute = institutes.find(
        (item) => item._id === data.user.tenantId,
      );
      setAdmins((current) =>
        [...current, { ...data.user, institute: institute ? {
          id: institute._id,
          name: institute.name,
          slug: institute.slug,
        } : null }].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setAdminMessage(
        `${data.message} ${data.user.name} (${data.user.email}) is active for ${
          institute?.name || "the selected institute"
        }.`,
      );
      setAdminForm((current) => ({
        ...current,
        name: "",
        email: "",
        password: "",
      }));
    } catch (error) {
      setAdminError(
        getErrorMessage(error, "Could not create the institute admin."),
      );
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!adminToDelete) return;

    setDeletingAdmin(true);
    setAdminError("");
    setAdminMessage("");
    try {
      const { data } = await axiosClient.delete(
        `/super-admin/admins/${adminToDelete.id}`,
      );
      setAdmins((current) =>
        current.filter((admin) => admin.id !== adminToDelete.id),
      );
      setAdminMessage(data.message);
      setAdminToDelete(null);
    } catch (error) {
      setAdminError(
        getErrorMessage(error, "Could not delete the institute admin."),
      );
      setAdminToDelete(null);
    } finally {
      setDeletingAdmin(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8faff] text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-indigo-600">
              Platform administration
            </p>
            <h1 className="mt-1 text-xl font-black sm:text-2xl">
              Super Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right sm:block">
              <span className="block text-sm font-bold">{user.name}</span>
              <span className="block text-xs text-slate-500">{user.email}</span>
            </span>
            <button
              type="button"
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <section className="mb-8 overflow-hidden rounded-[28px] bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-600 p-6 text-white shadow-xl shadow-indigo-200 sm:p-9">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-indigo-200">
            Platform overview
          </p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
            <div>
              <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                Manage your institutes.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
                Create institutes and assign an active institute admin to each
                one. Admin accounts are linked to the institute selected here.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4">
              <span className="block text-3xl font-black">
                {institutes.length}
              </span>
              <span className="text-xs font-semibold text-indigo-100">
                institutes
              </span>
            </div>
          </div>
        </section>

        {instituteError && (
          <p
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {instituteError}
          </p>
        )}

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-600">
                Institute directory
              </p>
              <h2 className="mt-2 text-xl font-black">Create an institute</h2>
              <p className="mt-1 text-sm text-slate-500">
                Use a short, unique slug such as{" "}
                <code className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                  north-campus
                </code>
                .
              </p>
            </div>

            {instituteMessage && (
              <p
                role="status"
                className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              >
                {instituteMessage}
              </p>
            )}

            <form className="space-y-4" onSubmit={handleInstituteSubmit}>
              <div>
                <label
                  className="mb-1.5 block text-sm font-bold"
                  htmlFor="institute-name"
                >
                  Institute name
                </label>
                <input
                  id="institute-name"
                  className={inputClassName}
                  autoComplete="organization"
                  required
                  maxLength={120}
                  value={instituteForm.name}
                  onChange={(event) =>
                    setInstituteForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Example University"
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-bold"
                  htmlFor="institute-slug"
                >
                  Institute slug
                </label>
                <input
                  id="institute-slug"
                  className={inputClassName}
                  required
                  pattern="[A-Za-z0-9]+(-[A-Za-z0-9]+)*"
                  title="Use letters or numbers separated by single hyphens."
                  value={instituteForm.slug}
                  onChange={(event) =>
                    setInstituteForm((current) => ({
                      ...current,
                      slug: event.target.value.toLowerCase(),
                    }))
                  }
                  placeholder="example-university"
                />
              </div>
              <button
                className="w-full cursor-pointer rounded-xl border-0 bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 font-bold text-white shadow-lg shadow-indigo-100 transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
                type="submit"
                disabled={creatingInstitute}
              >
                {creatingInstitute ? "Creating institute…" : "Create institute"}
              </button>
            </form>
          </section>

          <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-5">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-violet-600">
                Account setup
              </p>
              <h2 className="mt-2 text-xl font-black">
                Create an institute admin
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                The admin will be active and assigned to the selected institute.
              </p>
            </div>

            {adminError && (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {adminError}
              </p>
            )}
            {adminMessage && (
              <p
                role="status"
                className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
              >
                {adminMessage}
              </p>
            )}

            <form className="space-y-4" onSubmit={handleAdminSubmit}>
              <div>
                <label
                  className="mb-1.5 block text-sm font-bold"
                  htmlFor="admin-institute"
                >
                  Institute
                </label>
                <select
                  id="admin-institute"
                  className={inputClassName}
                  required
                  disabled={loadingInstitutes || institutes.length === 0}
                  value={adminForm.tenantId}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      tenantId: event.target.value,
                    }))
                  }
                >
                  {institutes.length === 0 && (
                    <option value="">
                      {loadingInstitutes
                        ? "Loading institutes…"
                        : "Create an institute first"}
                    </option>
                  )}
                  {institutes.map((institute) => (
                    <option key={institute._id} value={institute._id}>
                      {institute.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-bold"
                  htmlFor="admin-name"
                >
                  Admin name
                </label>
                <input
                  id="admin-name"
                  className={inputClassName}
                  autoComplete="name"
                  required
                  value={adminForm.name}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-bold"
                  htmlFor="admin-email"
                >
                  Admin email
                </label>
                <input
                  id="admin-email"
                  className={inputClassName}
                  type="email"
                  autoComplete="email"
                  required
                  value={adminForm.email}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label
                  className="mb-1.5 block text-sm font-bold"
                  htmlFor="admin-password"
                >
                  Temporary password (at least 8 characters)
                </label>
                <input
                  id="admin-password"
                  className={inputClassName}
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={adminForm.password}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                />
              </div>
              <button
                className="w-full cursor-pointer rounded-xl border-0 bg-slate-900 px-4 py-3 font-bold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-60"
                type="submit"
                disabled={
                  creatingAdmin ||
                  loadingInstitutes ||
                  institutes.length === 0
                }
              >
                {creatingAdmin ? "Creating admin…" : "Create institute admin"}
              </button>
            </form>
          </section>

          <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-violet-600">
                  Account management
                </p>
                <h2 className="mt-2 text-xl font-black">
                  Institute admins
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  View admins created for institutes and remove an admin account.
                </p>
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-60"
                onClick={loadAdmins}
                disabled={loadingAdmins}
              >
                {loadingAdmins ? "Refreshing…" : "Refresh admins"}
              </button>
            </div>
            {adminListError && (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {adminListError}
              </p>
            )}
            {loadingAdmins ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Loading institute admins…
              </p>
            ) : admins.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No institute admin accounts have been created yet.
              </p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {admins.map((admin) => (
                  <li
                    key={admin.id}
                    className="flex min-w-0 flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-bold text-slate-900">
                        {admin.name}
                      </span>
                      <span className="mt-1 block truncate text-sm text-slate-600">
                        {admin.email}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {admin.institute?.name || "Institute not found"}
                        {admin.institute?.slug
                          ? ` · ${admin.institute.slug}`
                          : ""}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          admin.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : admin.status === "suspended"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {admin.status}
                      </span>
                      <button
                        type="button"
                        className="cursor-pointer rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                        disabled={deletingAdmin}
                        onClick={() => setAdminToDelete(admin)}
                      >
                        Delete
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm sm:p-7 lg:col-span-2">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-indigo-600">
                  All tenants
                </p>
                <h2 className="mt-2 text-xl font-black">Institutes</h2>
              </div>
              <button
                type="button"
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-60"
                onClick={() => {
                  setLoadingInstitutes(true);
                  setInstituteError("");
                  loadInstitutes();
                }}
                disabled={loadingInstitutes}
              >
                {loadingInstitutes ? "Refreshing…" : "Refresh list"}
              </button>
            </div>

            {loadingInstitutes ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                Loading institutes…
              </p>
            ) : institutes.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No institutes yet. Create one above to get started.
              </p>
            ) : (
              <ul className="grid gap-3 md:grid-cols-2">
                {institutes.map((institute) => (
                  <li
                    key={institute._id}
                    className="flex min-w-0 items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-bold text-slate-900">
                        {institute.name}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-500">
                        {institute.slug}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">
                      {institute.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
      {adminToDelete && (
        <ConfirmModal
          message={`Delete the institute admin account for ${adminToDelete.name} (${adminToDelete.email})? This cannot be undone.`}
          onCancel={() => setAdminToDelete(null)}
          onConfirm={handleDeleteAdmin}
        />
      )}
    </main>
  );
}
