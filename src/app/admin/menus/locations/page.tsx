"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Menu = { id: number; key: string; name: string };

export default function MenuLocationsPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [primary, setPrimary] = useState("");
  const [footer, setFooter] = useState("");

  async function load() {
    setLoading(true);

    const [menusRes, settingsRes] = await Promise.all([
      fetch("/api/admin/menus", { cache: "no-store" }),
      fetch("/api/admin/settings", { cache: "no-store" }),
    ]);

    const menusJson = await menusRes.json().catch(() => ({}));
    const settingsJson = await settingsRes.json().catch(() => ({}));

    setMenus(Array.isArray(menusJson.menus) ? menusJson.menus : []);

    const s = settingsJson.settings || {};
    setPrimary(s["menu.location.primary"] || "");
    setFooter(s["menu.location.footer"] || "");

    setLoading(false);
  }

  async function save() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        settings: {
          "menu.location.primary": primary,
          "menu.location.footer": footer,
        },
      }),
    });
    setSaving(false);
    alert("Menu locations saved");
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <div className="container-fluid p-4">Loading…</div>;

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 m-0">Menu Locations</h1>
        <div className="d-flex gap-2">
          <Link href="/admin/menus" className="btn btn-outline-secondary btn-sm">Back</Link>
          <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Primary Menu</label>
            <select className="form-select" value={primary} onChange={(e) => setPrimary(e.target.value)}>
              <option value="">— Select —</option>
              {menus.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-0">
            <label className="form-label">Footer Menu</label>
            <select className="form-select" value={footer} onChange={(e) => setFooter(e.target.value)}>
              <option value="">— Select —</option>
              {menus.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
