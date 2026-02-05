"use client";

import Link from "next/link";
import { useState } from "react";

type Role = "ADMIN" | "EDITOR" | "AUTHOR" | "CONTRIBUTOR" | "SUBSCRIBER";
const ROLES: Role[] = ["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR", "SUBSCRIBER"];

export default function NewUserPage() {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: "", name: "", email: "", role: "AUTHOR" as Role, password: "" });

  async function submit() {
    setSaving(true);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, email: form.email || null }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);

    if (res.status === 401) return (window.location.href = "/admin/login");
    if (res.status === 403) return (window.location.href = "/admin/dashboard");
    if (!res.ok) return alert(data.error || "Create failed");

    window.location.href = `/admin/users/${data.user.id}/edit`;
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 m-0">Add New User</h1>
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
              <label className="form-label">Password *</label>
              <input type="password" className="form-control" value={form.password} onChange={(e) => setForm(p => ({...p, password: e.target.value}))}/>
            </div>
          </div>

          <div className="mt-4">
            <button className="btn btn-primary" disabled={saving} onClick={submit}>
              {saving ? "Saving…" : "Create User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
