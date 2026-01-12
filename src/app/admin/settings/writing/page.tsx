"use client";
import { useEffect, useState } from "react";

export default function WritingSettings() {
  const [cats, setCats] = useState<any[]>([]);
  const [val, setVal] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/writing", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setCats(d.categories || []);
        setVal(String(d.defaultCategoryId || ""));
      });
  }, []);

  async function save() {
    await fetch("/api/admin/settings/writing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ defaultCategoryId: Number(val) }),
    });
    alert("Saved");
  }

  return (
    <div className="container py-4">
      <h1>Writing Settings</h1>

      <label className="form-label">Default Category</label>
      <select className="form-select" value={val} onChange={(e) => setVal(e.target.value)}>
        <option value="">Select</option>
        {cats.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <button className="btn btn-primary mt-3" onClick={save}>
        Save Changes
      </button>
    </div>
  );
}
