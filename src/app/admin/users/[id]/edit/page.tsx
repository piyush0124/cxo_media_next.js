"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Role = "ADMIN" | "EDITOR" | "AUTHOR" | "CONTRIBUTOR" | "SUBSCRIBER";
const ROLES: Role[] = ["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR", "SUBSCRIBER"];

export default function EditUserPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ username: "", name: "", email: "", role: "AUTHOR" as Role, password: "" });

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401) return (window.location.href = "/admin/login");
    if (res.status === 403) return (window.location.href = "/admin/dashboard");
    if (!res.ok) {
      setLoading(false);
      return alert(data.error || "Load failed");
    }

    setForm({
      username: data.user.username || "",
      name: data.user.name || "",
      email: data.user.email || "",
      role: data.user.role || "AUTHOR",
      password: "",
    });

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function save() {
    setSaving(true);
    const payload: any = { username: form.username, name: form.name, email: form.email || null, role: form.role };
    if (form.password.trim()) payload.password = form.password.trim();

    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) return alert(data.error || "Save failed");
    alert("Saved");
    setForm(p => ({ ...p, password: "" }));
  }

  if (loading) return <div className="container-fluid p-4 text-muted">Loading…</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 m-0">Edit User</h1>
        <Link href="/admin/users" className="btn btn-outline-secondary btn-sm">Back</Link>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Username *</label>
              <input className="form-control" value={form.username} onChange={(e) => setForm(p => ({...p, username: e.target.value}))}/>
            </div>
            <div className="col-md-6">
              <label className="form-label">Name *</label>
              <input className="form-control" value={form.name} onChange={(e) => setForm(p => ({...p, name: e.target.value}))}/>
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" value={form.email} onChange={(e) => setForm(p => ({...p, email: e.target.value}))}/>
            </div>
            <div className="col-md-6">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={(e) => setForm(p => ({...p, role: e.target.value as Role}))}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">New Password</label>
              <input type="password" className="form-control" value={form.password} onChange={(e) => setForm(p => ({...p, password: e.target.value}))}/>
              <div className="form-text">Leave blank to keep existing password.</div>
            </div>
          </div>

          <div className="mt-4">
            <button className="btn btn-primary" disabled={saving} onClick={save}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
