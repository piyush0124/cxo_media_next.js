"use client";

import { useEffect, useState } from "react";

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [description, setDescription] = useState("");

  const [parents, setParents] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/categories/${id}`, { cache: "no-store" });
if (!res.ok) {
  const text = await res.text();
  throw new Error(text || `Request failed: ${res.status}`);
}
const json = await res.json();

    })();
  }, [id]);

  async function save() {
    setMsg("");
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug, parentId: parentId ? Number(parentId) : null, description }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return setMsg(json?.message || "Update failed");
    setMsg("Updated ✅");
  }

  if (loading) return <div className="container py-4">Loading...</div>;

  return (
    <div className="container py-4">
      <h1 style={{ fontSize: 26, fontWeight: 400 }} className="mb-3">
        Edit Category
      </h1>

      {msg ? <div className="alert alert-info py-2">{msg}</div> : null}

      <div className="bg-white border rounded p-3" style={{ maxWidth: 720 }}>
        <div className="mb-3">
          <label className="form-label">Name</label>
          <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Slug</label>
          <input className="form-control" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>

        <div className="mb-3">
          <label className="form-label">Parent Category</label>
          <select className="form-select" value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">None</option>
            {parents
              .filter((p: any) => p.id !== id)
              .map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea className="form-control" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <button className="btn btn-primary" onClick={save}>
          Update
        </button>
      </div>
    </div>
  );
}
