"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Settings = Record<string, string>;

const DEFAULTS: Settings = {
  "smtp.host": "",
  "smtp.port": "587",
  "smtp.secure": "0",
  "smtp.user": "",
  "smtp.pass": "",
  "smtp.from": "CXO Media <no-reply@example.com>",
};

export default function SmtpSettingsPage() {
  const [data, setData] = useState<Settings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/settings", { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) return (window.location.href = "/admin/login");
    if (res.status === 403) return (window.location.href = "/admin/dashboard");
    setData({ ...DEFAULTS, ...(json.settings || {}) });
    setLoading(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: data }),
    });
    setSaving(false);
    alert("SMTP settings saved");
  }

  useEffect(() => {
    load();
  }, []);

  const set = (k: string, v: string) => setData((p) => ({ ...p, [k]: v }));

  if (loading) return <div className="container-fluid p-4">Loading…</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 m-0">SMTP</h1>
        <div className="d-flex gap-2">
          <Link href="/admin/settings" className="btn btn-outline-secondary btn-sm">Back</Link>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Host</label>
              <input className="form-control" value={data["smtp.host"]} onChange={(e) => set("smtp.host", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Port</label>
              <input className="form-control" value={data["smtp.port"]} onChange={(e) => set("smtp.port", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Secure (SSL)</label>
              <select className="form-select" value={data["smtp.secure"]} onChange={(e) => set("smtp.secure", e.target.value)}>
                <option value="0">No (STARTTLS)</option>
                <option value="1">Yes (SSL)</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label">Username</label>
              <input className="form-control" value={data["smtp.user"]} onChange={(e) => set("smtp.user", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Password / App Password</label>
              <input className="form-control" value={data["smtp.pass"]} onChange={(e) => set("smtp.pass", e.target.value)} />
            </div>

            <div className="col-md-12">
              <label className="form-label">From</label>
              <input className="form-control" value={data["smtp.from"]} onChange={(e) => set("smtp.from", e.target.value)} />
            </div>

            <div className="col-md-12">
              <div className="alert alert-warning mb-0">
                Use Gmail <b>App Password</b>, not your normal password.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
