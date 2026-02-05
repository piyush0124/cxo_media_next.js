"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Settings = Record<string, string>;

const DEFAULTS: Settings = {
  "cache.enabled": "1",
  "cache.ttl_seconds": "300",
};

export default function CacheSettingsPage() {
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
    alert("Cache settings saved");
  }

  useEffect(() => {
    load();
  }, []);

  const set = (k: string, v: string) => setData((p) => ({ ...p, [k]: v }));

  if (loading) return <div className="container-fluid p-4">Loading…</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 m-0">Cache</h1>
        <div className="d-flex gap-2">
          <Link href="/admin/settings" className="btn btn-outline-secondary btn-sm">Back</Link>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              checked={data["cache.enabled"] === "1"}
              onChange={(e) => set("cache.enabled", e.target.checked ? "1" : "0")}
              id="cacheEnabled"
            />
            <label className="form-check-label" htmlFor="cacheEnabled">
              Enable cache
            </label>
          </div>

          <label className="form-label">TTL (seconds)</label>
          <input
            className="form-control"
            value={data["cache.ttl_seconds"]}
            onChange={(e) => set("cache.ttl_seconds", e.target.value)}
          />
          <div className="form-text">Example: 300 = 5 minutes</div>
        </div>
      </div>
    </div>
  );
}
