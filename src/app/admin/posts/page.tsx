"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PostRow = any;

export default function AdminPostsPage() {
  const [status, setStatus] = useState("ALL");
  const [s, setS] = useState("");
  const [page, setPage] = useState(1);
  const take = 20;

  const [data, setData] = useState<{ posts: PostRow[]; total: number; pages: number } | null>(null);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [bulk, setBulk] = useState("");

  const ids = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k)), [selected]);

  async function load() {
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("take", String(take));
    if (status !== "ALL") qs.set("status", status);
    if (s.trim()) qs.set("s", s.trim());

    const res = await fetch(`/api/admin/posts?${qs.toString()}`, { cache: "no-store" });
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  const toggleAll = (checked: boolean) => {
    const next: Record<number, boolean> = {};
    (data?.posts || []).forEach((p: any) => (next[p.id] = checked));
    setSelected(next);
  };

  const runBulk = async () => {
    if (!bulk || !ids.length) return;

    await fetch("/api/admin/posts/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: bulk, ids }),
    });

    setSelected({});
    setBulk("");
    load();
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Posts</h1>
        <Link className="btn btn-dark" href="/admin/posts/new">
          Add New
        </Link>
      </div>

      <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
        <select className="form-select" style={{ width: 180 }} value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}>
          <option value="ALL">All</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="TRASH">Trash</option>
        </select>

        <form
          className="d-flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            load();
          }}
        >
          <input className="form-control" style={{ width: 260 }} placeholder="Search posts..." value={s} onChange={(e) => setS(e.target.value)} />
          <button className="btn btn-outline-dark" type="submit">Search</button>
        </form>

        <div className="ms-auto d-flex gap-2">
          <select className="form-select" style={{ width: 200 }} value={bulk} onChange={(e) => setBulk(e.target.value)}>
            <option value="">Bulk actions</option>
            <option value="TRASH">Move to Trash</option>
            <option value="RESTORE">Restore (to Draft)</option>
            <option value="PUBLISH">Publish</option>
            <option value="DRAFT">Move to Draft</option>
            <option value="DELETE">Delete Permanently</option>
          </select>
          <button className="btn btn-outline-dark" onClick={runBulk} disabled={!bulk || !ids.length}>
            Apply
          </button>
        </div>
      </div>

      <div className="table-responsive bg-white border rounded">
        <table className="table table-hover align-middle m-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: 44 }}>
                <input
                  type="checkbox"
                  onChange={(e) => toggleAll(e.target.checked)}
                  checked={(data?.posts || []).length > 0 && (data?.posts || []).every((p: any) => selected[p.id])}
                />
              </th>
              <th>Title</th>
              <th style={{ width: 140 }}>Status</th>
              <th style={{ width: 180 }}>Category</th>
              <th style={{ width: 180 }}>Author</th>
              <th style={{ width: 140 }}>Date</th>
              <th style={{ width: 120 }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {(data?.posts || []).map((p: any) => (
              <tr key={p.id}>
                <td>
                  <input type="checkbox" checked={!!selected[p.id]} onChange={(e) => setSelected((prev) => ({ ...prev, [p.id]: e.target.checked }))} />
                </td>

                <td>
                  <div className="fw-semibold">{p.title}</div>
                  <div className="text-muted" style={{ fontSize: 12 }}>
                    /{p.slug}
                  </div>
                </td>

                <td>
                  <span className="badge text-bg-secondary">{p.status}</span>
                </td>

                <td>{p.category?.name || "-"}</td>
                <td>{p.author?.username || "-"}</td>
                <td className="text-muted" style={{ fontSize: 12 }}>
                  {p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : "-"}
                </td>

                <td>
                  <Link className="btn btn-sm btn-outline-dark" href={`/admin/posts/${p.id}/edit`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}

            {!data?.posts?.length ? (
              <tr>
                <td colSpan={7} className="text-center text-muted py-4">
                  No posts found.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted" style={{ fontSize: 13 }}>
          Total: {data?.total ?? 0}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-dark btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Prev
          </button>
          <div className="px-2 text-muted" style={{ fontSize: 13, alignSelf: "center" }}>
            Page {page} / {data?.pages ?? 1}
          </div>
          <button className="btn btn-outline-dark btn-sm" disabled={data ? page >= data.pages : true} onClick={() => setPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
