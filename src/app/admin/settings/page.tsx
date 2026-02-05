"use client";

import { useEffect, useState } from "react";

const DEFAULTS: Record<string, string> = {
  /* General */
  "site.title": "CXO Media",
  "site.tagline": "",
  "site.url": "http://localhost:3000",
  "site.admin_email": "",

  /* Writing */
  "writing.default_category": "news",
  "writing.default_post_format": "standard",

  /* Reading */
  "reading.posts_per_page": "10",
  "reading.homepage": "latest",

  /* Discussion */
  "discussion.allow_comments": "1",
  "discussion.require_login": "0",
  "discussion.auto_close_days": "14",

  /* Media */
  "media.thumbnail_w": "150",
  "media.thumbnail_h": "150",
  "media.medium_w": "300",
  "media.large_w": "1024",

  /* Permalinks */
  "permalink.structure": "/%year%/%month%/%day%/%slug%",

  /* Users */
  "users.registration": "0",
  "users.default_role": "SUBSCRIBER",
};

export default function SettingsPage() {
  const [data, setData] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/admin/settings");
    const json = await res.json();
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
    alert("Settings saved");
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="p-4">Loading…</div>;

  function set(key: string, value: string) {
    setData((p) => ({ ...p, [key]: value }));
  }

  return (
    <div className="container-fluid">
      <h1 className="h4 mb-3">Settings</h1>

      {/* GENERAL */}
      <Section title="General">
        <Input label="Site Title" value={data["site.title"]} onChange={(v) => set("site.title", v)} />
        <Input label="Tagline" value={data["site.tagline"]} onChange={(v) => set("site.tagline", v)} />
        <Input label="Site URL" value={data["site.url"]} onChange={(v) => set("site.url", v)} />
        <Input label="Admin Email" value={data["site.admin_email"]} onChange={(v) => set("site.admin_email", v)} />
      </Section>

      {/* WRITING */}
      <Section title="Writing">
        <Input label="Default Category" value={data["writing.default_category"]} onChange={(v) => set("writing.default_category", v)} />
      </Section>

      {/* READING */}
      <Section title="Reading">
        <Input type="number" label="Posts per page" value={data["reading.posts_per_page"]} onChange={(v) => set("reading.posts_per_page", v)} />
      </Section>

      {/* DISCUSSION */}
      <Section title="Discussion">
        <Checkbox label="Allow comments" checked={data["discussion.allow_comments"] === "1"} onChange={(v) => set("discussion.allow_comments", v ? "1" : "0")} />
        <Checkbox label="Users must be logged in" checked={data["discussion.require_login"] === "1"} onChange={(v) => set("discussion.require_login", v ? "1" : "0")} />
      </Section>

      {/* MEDIA */}
      <Section title="Media">
        <Input type="number" label="Thumbnail Width" value={data["media.thumbnail_w"]} onChange={(v) => set("media.thumbnail_w", v)} />
        <Input type="number" label="Thumbnail Height" value={data["media.thumbnail_h"]} onChange={(v) => set("media.thumbnail_h", v)} />
      </Section>

      {/* PERMALINKS */}
      <Section title="Permalinks">
        <Input label="URL Structure" value={data["permalink.structure"]} onChange={(v) => set("permalink.structure", v)} />
        <small>Example: /%year%/%month%/%day%/%slug%</small>
      </Section>

      {/* USERS */}
      <Section title="Users">
        <Checkbox label="Anyone can register" checked={data["users.registration"] === "1"} onChange={(v) => set("users.registration", v ? "1" : "0")} />
        <Input label="Default Role" value={data["users.default_role"]} onChange={(v) => set("users.default_role", v)} />
      </Section>

      <button className="btn btn-primary mt-3" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="card mb-3">
      <div className="card-header fw-bold">{title}</div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="mb-3">
      <label className="form-label">{label}</label>
      <input type={type} className="form-control" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function Checkbox({ label, checked, onChange }: any) {
  return (
    <div className="form-check mb-2">
      <input type="checkbox" className="form-check-input" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <label className="form-check-label">{label}</label>
    </div>
  );
}
