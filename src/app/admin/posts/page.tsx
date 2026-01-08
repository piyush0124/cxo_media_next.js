"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PostRow = any;

type MonthsItem = { value: string; label: string };

export default function AdminPostsPage() {
  const [tab, setTab] = useState<"ALL" | "MINE" | "PUBLISHED" | "SCHEDULED" | "DRAFT" | "PRIVATE" | "TRASH">("ALL");
  const [s, setS] = useState("");
  const [page, setPage] = useState(1);
  const take = 20;

  const [categoryId, setCategoryId] = useState<string>("");
  const [month, setMonth] = useState<string>(""); // YYYY-MM
  const [sort, setSort] = useState<string>("date"); // title/title_desc/author/... etc

  const [showScreenOptions, setShowScreenOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [data, setData] = useState<{
    posts: PostRow[];
    total: number;
    pages: number;
    counts: { all: number; mine: number; published: number; scheduled: number; drafts: number; private: number; trash: number };
    months: MonthsItem[];
  } | null>(null);

  const [cats, setCats] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [bulk, setBulk] = useState("");

  const selectedIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([k]) => Number(k)),
    [selected]
  );

  async function load() {
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("take", String(take));
    qs.set("sort", sort);

    if (s.trim()) qs.set("s", s.trim());
    if (categoryId) qs.set("categoryId", categoryId);
    if (month) qs.set("month", month);

    if (tab === "MINE") qs.set("mine", "1");
    else if (tab !== "ALL") qs.set("status", tab);

    const res = await fetch(`/api/admin/posts?${qs.toString()}`, { cache: "no-store" });
    const json = await res.json();
    setData(json);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, sort]);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j) => setCats(j.categories || []))
      .catch(() => setCats([]));
  }, []);

  const toggleAll = (checked: boolean) => {
    const next: Record<number, boolean> = {};
    (data?.posts || []).forEach((p: any) => (next[p.id] = checked));
    setSelected(next);
  };

  const runBulk = async () => {
    if (!bulk || !selectedIds.length) return;

    await fetch("/api/admin/posts/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: bulk, ids: selectedIds }),
    });

    setSelected({});
    setBulk("");
    load();
  };

  const counts = data?.counts || { all: 0, mine: 0, published: 0, scheduled: 0, drafts: 0, private: 0, trash: 0 };

  return (
    <div className="container-fluid py-3">
      {/* Top header like WP + Screen Options/Help */}
      <div className="d-flex align-items-center gap-3 mb-2">
        <h1 className="m-0" style={{ fontSize: 26, fontWeight: 400 }}>
          Posts
        </h1>

        <Link className="btn btn-outline-primary btn-sm" href="/admin/posts/new">
          Add Post
        </Link>

        <div className="ms-auto d-flex gap-2 align-items-center">
          <div className="position-relative">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => { setShowScreenOptions((v) => !v); setShowHelp(false); }}
            >
              Screen Options ▾
            </button>

            {showScreenOptions ? (
              <div className="position-absolute end-0 mt-2 bg-white border rounded p-3" style={{ width: 280, zIndex: 30 }}>
                <div className="fw-semibold mb-2">Screen Options</div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" defaultChecked />
                  <label className="form-check-label">Author</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" defaultChecked />
                  <label className="form-check-label">Categories</label>
                </div>
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" defaultChecked />
                  <label className="form-check-label">Tags</label>
                </div>
                <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                  (UI toggle demo. We can make it actually hide/show columns.)
                </div>
              </div>
            ) : null}
          </div>

          <div className="position-relative">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => { setShowHelp((v) => !v); setShowScreenOptions(false); }}
            >
              Help ▾
            </button>

            {showHelp ? (
              <div className="position-absolute end-0 mt-2 bg-white border rounded p-3" style={{ width: 320, zIndex: 30 }}>
                <div className="fw-semibold mb-2">Help</div>
                <ul className="m-0 ps-3 text-muted" style={{ fontSize: 13 }}>
                  <li>Use tabs to filter by post status.</li>
                  <li>Use bulk actions to manage multiple posts.</li>
                  <li>Click headers to sort columns.</li>
                </ul>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Search row (WP style) */}
      <div className="d-flex justify-content-end gap-2 mb-2">
        <input className="form-control" style={{ width: 280 }} placeholder="Search Posts" value={s} onChange={(e) => setS(e.target.value)} />
        <button className="btn btn-primary" onClick={() => { setPage(1); load(); }}>
          Search Posts
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-2" style={{ fontSize: 14 }}>
        <TabLink active={tab === "ALL"} onClick={() => { setPage(1); setTab("ALL"); }}>All <span className="text-muted">({counts.all})</span></TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "MINE"} onClick={() => { setPage(1); setTab("MINE"); }}>Mine <span className="text-muted">({counts.mine})</span></TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "PUBLISHED"} onClick={() => { setPage(1); setTab("PUBLISHED"); }}>Published <span className="text-muted">({counts.published})</span></TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "SCHEDULED"} onClick={() => { setPage(1); setTab("SCHEDULED"); }}>Scheduled <span className="text-muted">({counts.scheduled})</span></TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "DRAFT"} onClick={() => { setPage(1); setTab("DRAFT"); }}>Drafts <span className="text-muted">({counts.drafts})</span></TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "PRIVATE"} onClick={() => { setPage(1); setTab("PRIVATE"); }}>Private <span className="text-muted">({counts.private})</span></TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "TRASH"} onClick={() => { setPage(1); setTab("TRASH"); }}>Trash <span className="text-muted">({counts.trash})</span></TabLink>
      </div>

      {/* Filters row */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <select className="form-select" style={{ width: 200 }} value={bulk} onChange={(e) => setBulk(e.target.value)}>
          <option value="">Bulk actions</option>
          <option value="TRASH">Move to Trash</option>
          <option value="RESTORE">Restore</option>
          <option value="PUBLISH">Publish</option>
          <option value="DRAFT">Move to Draft</option>
          <option value="DELETE">Delete Permanently</option>
        </select>

        <button className="btn btn-outline-primary" onClick={runBulk} disabled={!bulk || !selectedIds.length}>
          Apply
        </button>

        <select className="form-select" style={{ width: 220 }} value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">All dates</option>
          {(data?.months || []).map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select className="form-select" style={{ width: 240 }} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">All Categories</option>
          {cats.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button className="btn btn-outline-primary" onClick={() => { setPage(1); load(); }}>
          Filter
        </button>

        {/* right pagination summary */}
        <div className="ms-auto d-flex align-items-center gap-2 text-muted">
          <span>{data?.total ?? 0} items</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>

          <div className="d-flex align-items-center gap-1">
            <input
              className="form-control form-control-sm"
              style={{ width: 60, textAlign: "center" }}
              value={page}
              onChange={(e) => setPage(Math.max(1, parseInt(e.target.value || "1", 10)))}
            />
            <span className="text-muted">of {data?.pages ?? 1}</span>
          </div>

          <button className="btn btn-sm btn-outline-secondary" disabled={data ? page >= data.pages : true} onClick={() => setPage((p) => p + 1)}>›</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded">
        <table className="table table-hover align-middle m-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: 40 }}>
                <input
                  type="checkbox"
                  onChange={(e) => toggleAll(e.target.checked)}
                  checked={(data?.posts || []).length > 0 && (data?.posts || []).every((p: any) => selected[p.id])}
                />
              </th>

              <ThSort label="Title" activeSort={sort} asc="title" desc="title_desc" setSort={setSort} />
              <ThSort label="Authors" activeSort={sort} asc="author" desc="author_desc" setSort={setSort} />
              <ThSort label="Categories" activeSort={sort} asc="category" desc="category_desc" setSort={setSort} />

              <th style={{ width: 220 }}>Tags</th>

              <ThSort label="Views" activeSort={sort} asc="views_asc" desc="views" setSort={setSort} />

              <ThSort label="Date" activeSort={sort} asc="date_asc" desc="date" setSort={setSort} />
            </tr>
          </thead>

          <tbody>
            {(data?.posts || []).map((p: any) => (
              <tr key={p.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={!!selected[p.id]}
                    onChange={(e) => setSelected((prev) => ({ ...prev, [p.id]: e.target.checked }))}
                  />
                </td>

                <td>
                  <Link href={`/admin/posts/${p.id}/edit`} className="fw-semibold text-decoration-none">
                    {p.title}
                  </Link>

                  <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                    <Link href={`/admin/posts/${p.id}/edit`} className="text-decoration-none">
                      Edit
                    </Link>
                    {" | "}
                    <a
                      href="#"
                      className="text-decoration-none"
                      onClick={async (e) => {
                        e.preventDefault();
                        await fetch("/api/admin/posts/bulk", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ action: "TRASH", ids: [p.id] }),
                        });
                        load();
                      }}
                    >
                      Trash
                    </a>
                  </div>
                </td>

                <td>{p.author?.username || "-"}</td>
                <td>{p.category?.name || "-"}</td>

                <td className="text-muted" style={{ fontSize: 12 }}>
                  {p.tags || "—"}
                </td>

                <td>{p.views ?? 0}</td>

                <td className="text-muted" style={{ fontSize: 12 }}>
                  <div>
                    {p.status === "PUBLISHED"
                      ? "Published"
                      : p.status === "SCHEDULED"
                      ? "Scheduled"
                      : p.status}
                  </div>
                  <div>
                    {p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}
                  </div>
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
    </div>
  );
}

function TabLink({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      style={{
        color: "#2271b1",
        fontWeight: active ? 600 : 400,
        textDecoration: "none",
      }}
    >
      {children}
    </a>
  );
}

function ThSort({
  label,
  activeSort,
  asc,
  desc,
  setSort,
}: {
  label: string;
  activeSort: string;
  asc: string;
  desc: string;
  setSort: (v: string) => void;
}) {
  const isAsc = activeSort === asc;
  const isDesc = activeSort === desc;
  const arrow = isAsc ? "▲" : isDesc ? "▼" : "⇅";

  return (
    <th style={{ cursor: "pointer", userSelect: "none" }} onClick={() => setSort(isAsc ? desc : asc)}>
      <span className="text-primary">{label}</span>{" "}
      <span className="text-muted" style={{ fontSize: 12 }}>{arrow}</span>
    </th>
  );
}
