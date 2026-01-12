"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Cat = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
  parentName?: string | null;
  count: number;
};

export default function AdminCategoriesPage() {
  const [cats, setCats] = useState<Cat[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Settings (Default Category)
  const [defaultCategoryId, setDefaultCategoryId] = useState<number | null>(null);

  // Add form (left)
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [msg, setMsg] = useState("");

  // Bulk
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [bulk, setBulk] = useState("");

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k)),
    [selected]
  );

  async function load() {
    setLoading(true);
    setMsg("");

    const qs = search.trim() ? `?s=${encodeURIComponent(search.trim())}` : "";

    // ✅ include cookies so session works
    const res = await fetch(`/api/admin/categories${qs}`, {
      cache: "no-store",
      credentials: "include",
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      setMsg(json?.message || "Failed to load categories");
      setCats([]);
      setLoading(false);
      return;
    }

    setCats(json?.categories || []);
    setLoading(false);
  }

  async function loadDefaultCategory() {
    // optional endpoint (Settings → Writing)
    const res = await fetch("/api/admin/settings/writing", {
      cache: "no-store",
      credentials: "include",
    });

    const json = await res.json().catch(() => null);
    if (res.ok) {
      setDefaultCategoryId(json?.defaultCategoryId ? Number(json.defaultCategoryId) : null);
    }
  }

  useEffect(() => {
    load();
    loadDefaultCategory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addCategory(e: any) {
    e.preventDefault();
    setMsg("");

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name,
        slug,
        parentId: parentId ? Number(parentId) : null,
        description,
      }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.ok) {
      setMsg(json?.message || "Failed to create category");
      return;
    }

    setName("");
    setSlug("");
    setParentId("");
    setDescription("");
    setSelected({});
    setBulk("");
    load();
  }

  const toggleAll = (checked: boolean) => {
    const next: Record<number, boolean> = {};
    cats.forEach((c) => (next[c.id] = checked));
    setSelected(next);
  };

  async function runBulk() {
    if (!bulk || !selectedIds.length) return;

    const res = await fetch("/api/admin/categories/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: bulk, ids: selectedIds }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      setMsg(json?.message || "Bulk action failed");
      return;
    }

    setSelected({});
    setBulk("");
    load();
  }

  async function deleteWithReassign(categoryId: number, categoryName: string) {
    setMsg("");

    // wpne-like behavior: if category has posts, ask for reassignment
    const cat = cats.find((c) => c.id === categoryId);
    const hasPosts = (cat?.count || 0) > 0;

    if (!hasPosts) {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) setMsg(json?.message || "Delete failed");
      else load();
      return;
    }

    // Choose target category (default if available)
    const possibleTargets = cats.filter((c) => c.id !== categoryId);
    const defaultTarget = defaultCategoryId && defaultCategoryId !== categoryId ? defaultCategoryId : possibleTargets[0]?.id;

    const targetStr = window.prompt(
      `“${categoryName}” has ${cat?.count} posts.\n\nEnter the category ID to move posts into before deleting.\n` +
        `Suggested: ${defaultTarget || "N/A"}\n\nAvailable IDs:\n` +
        possibleTargets.slice(0, 12).map((c) => `${c.id}: ${c.name}`).join("\n"),
      defaultTarget ? String(defaultTarget) : ""
    );

    if (!targetStr) return;

    const targetId = Number(targetStr);
    if (!targetId || targetId === categoryId) {
      setMsg("Invalid reassignment category ID");
      return;
    }

    const res = await fetch(`/api/admin/categories/${categoryId}?reassignTo=${targetId}`, {
      method: "DELETE",
      credentials: "include",
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) setMsg(json?.message || "Delete failed");
    else load();
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="m-0" style={{ fontSize: 26, fontWeight: 400 }}>
          Categories
        </h1>

        <div className="d-flex gap-2">
          <input
            className="form-control"
            style={{ width: 280 }}
            placeholder="Search Categories"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={load}>
            Search Categories
          </button>

          {/* ✅ Settings shortcut like wpne */}
          <Link href="/admin/settings/writing" className="btn btn-outline-secondary">
            Settings → Writing
          </Link>
        </div>
      </div>

      {/* Default category warning (wpne-like) */}
      {!defaultCategoryId ? (
        <div className="alert alert-warning py-2">
          Default category is not set. Go to <b>Settings → Writing</b> and set it.
          This is required for safe deletion (reassignment).
        </div>
      ) : null}

      {msg ? <div className="alert alert-warning py-2">{msg}</div> : null}

      <div className="row g-4">
        {/* LEFT: Add New Category */}
        <div className="col-12 col-lg-4">
          <div className="bg-white border rounded p-3">
            <h4 className="mb-3" style={{ fontWeight: 600 }}>
              Add New Category
            </h4>

            <form onSubmit={addCategory}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                  The name is how it appears on your site.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Slug</label>
                <input className="form-control" value={slug} onChange={(e) => setSlug(e.target.value)} />
                <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                  The “slug” is the URL-friendly version of the name.
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Parent Category</label>
                <select className="form-select" value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">None</option>
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
                <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                  The description is not prominent by default; it may be used by some themes.
                </div>
              </div>

              <button className="btn btn-primary w-100" type="submit">
                Add New Category
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Categories table */}
        <div className="col-12 col-lg-8">
          <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
            <select className="form-select" style={{ width: 200 }} value={bulk} onChange={(e) => setBulk(e.target.value)}>
              <option value="">Bulk actions</option>
              <option value="DELETE">Delete</option>
            </select>

            <button className="btn btn-outline-primary" onClick={runBulk} disabled={!bulk || !selectedIds.length}>
              Apply
            </button>

            <div className="ms-auto text-muted">{loading ? "Loading..." : `${cats.length} items`}</div>
          </div>

          <div className="bg-white border rounded">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      onChange={(e) => toggleAll(e.target.checked)}
                      checked={cats.length > 0 && cats.every((c) => selected[c.id])}
                    />
                  </th>
                  <th>Name</th>
                  <th>Description</th>
                  <th style={{ width: 200 }}>Slug</th>
                  <th style={{ width: 90 }}>Count</th>
                </tr>
              </thead>

              <tbody>
                {cats.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={!!selected[c.id]}
                        onChange={(e) => setSelected((prev) => ({ ...prev, [c.id]: e.target.checked }))}
                      />
                    </td>

                    <td>
                      <div className="fw-semibold">
                        {c.parentName ? <span className="text-muted">— </span> : null}
                        {c.name}
                      </div>

                      <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                        <Link className="text-decoration-none" href={`/admin/categories/${c.id}/edit`}>
                          Edit
                        </Link>
                        {" | "}
                        <a
                          href="#"
                          className="text-decoration-none"
                          onClick={(e) => {
                            e.preventDefault();
                            deleteWithReassign(c.id, c.name);
                          }}
                        >
                          Delete
                        </a>
                        {" | "}
                        {/* ✅ archive link */}
                        <Link className="text-decoration-none" href={`/category/${c.slug}`} target="_blank">
                          View
                        </Link>
                      </div>
                    </td>

                    <td className="text-muted" style={{ fontSize: 13 }}>
                      {c.description || "—"}
                    </td>

                    <td>
                      <code>{c.slug}</code>
                    </td>

                    <td>{c.count}</td>
                  </tr>
                ))}

                {!cats.length ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      No categories found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
