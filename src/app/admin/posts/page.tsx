"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type PostRow = any;
type MonthsItem = { value: string; label: string };

export default function AdminPostsPage() {
  const [tab, setTab] = useState<
    "ALL" | "MINE" | "PUBLISHED" | "SCHEDULED" | "DRAFT" | "PRIVATE" | "TRASH"
  >("ALL");

  const [s, setS] = useState("");
  const [page, setPage] = useState(1);
  const take = 20;

  const [categoryId, setCategoryId] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [sort, setSort] = useState<string>("date");

  const [showScreenOptions, setShowScreenOptions] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const [data, setData] = useState<{
    posts: PostRow[];
    total: number;
    pages: number;
    counts: {
      all: number;
      mine: number;
      published: number;
      scheduled: number;
      drafts: number;
      private: number;
      trash: number;
    };
    months: MonthsItem[];
  } | null>(null);

  const [cats, setCats] = useState<any[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [bulk, setBulk] = useState("");
  const [error, setError] = useState<string>("");

  const selectedIds = useMemo(
    () =>
      Object.entries(selected)
        .filter(([, v]) => v)
        .map(([k]) => Number(k)),
    [selected]
  );

  const allChecked = useMemo(() => {
    const rows = data?.posts || [];
    if (!rows.length) return false;
    return rows.every((p: any) => !!selected[p.id]);
  }, [data?.posts, selected]);

  async function load(nextPage?: number) {
    setError("");

    const qs = new URLSearchParams();
    qs.set("page", String(nextPage ?? page));
    qs.set("take", String(take));
    qs.set("sort", sort);

    if (s.trim()) qs.set("s", s.trim());
    if (categoryId) qs.set("categoryId", categoryId);
    if (month) qs.set("month", month);

    if (tab === "MINE") qs.set("mine", "1");
    else if (tab !== "ALL") qs.set("status", tab);

    const res = await fetch(`/api/admin/posts?${qs.toString()}`, {
      cache: "no-store",
      credentials: "include",
    });

    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }

    const json = await res.json().catch(() => null);

    if (!res.ok || !json) {
      console.error("Admin posts API failed:", res.status, json);
      setError(json?.message || `Failed to load posts (${res.status})`);
      setData({
        posts: [],
        total: 0,
        pages: 1,
        counts: {
          all: 0,
          mine: 0,
          published: 0,
          scheduled: 0,
          drafts: 0,
          private: 0,
          trash: 0,
        },
        months: [],
      });
      return;
    }

    setData(json);
    setSelected({});
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, page, sort]);

  useEffect(() => {
    fetch("/api/admin/categories", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) window.location.href = "/admin/login";
        return r.json();
      })
      .then((j) => setCats(j.categories || []))
      .catch(() => setCats([]));
  }, []);

  const toggleAll = (checked: boolean) => {
    const next: Record<number, boolean> = {};
    (data?.posts || []).forEach((p: any) => (next[p.id] = checked));
    setSelected(next);
  };

  async function callBulk(action: string, ids: number[]) {
    setError("");

    const res = await fetch("/api/admin/posts/bulk", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ids }),
    });

    if (res.status === 401) {
      window.location.href = "/admin/login";
      return false;
    }

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.ok) {
      setError(json?.message || `Action failed (${res.status})`);
      return false;
    }

    return true;
  }

  // ✅ Optimistic UI remove + fix pagination
  function removeRowsFromUI(ids: number[], action: "TRASH" | "RESTORE" | "DELETE") {
    setData((prev) => {
      if (!prev) return prev;

      const idSet = new Set(ids);
      const removedRows = prev.posts.filter((p: any) => idSet.has(Number(p.id)));
      const nextPosts = prev.posts.filter((p: any) => !idSet.has(Number(p.id)));

      const removedCount = removedRows.length;

      const nextTotal = Math.max(0, (prev.total || 0) - removedCount);
      const nextPages = Math.max(1, Math.ceil(nextTotal / take));

      const nextCounts = { ...prev.counts };

      // Best-effort counts update (final truth comes from load())
      if (action === "TRASH") {
        if (tab !== "TRASH") {
          nextCounts.trash = Math.max(0, nextCounts.trash + removedCount);
        } else {
          // if you're already in trash tab, trash action wouldn't happen normally
        }
      }

      if (action === "RESTORE") {
        if (tab === "TRASH") {
          nextCounts.trash = Math.max(0, nextCounts.trash - removedCount);
        }
      }

      if (action === "DELETE") {
        if (tab === "TRASH") {
          nextCounts.trash = Math.max(0, nextCounts.trash - removedCount);
        }
      }

      // "all" count in your UI represents non-trash (like WP "All")
      // We adjust only when leaving non-trash list
      if (action === "TRASH" && tab !== "TRASH") {
        nextCounts.all = Math.max(0, nextCounts.all - removedCount);
      }

      return {
        ...prev,
        posts: nextPosts,
        total: nextTotal,
        pages: nextPages,
        counts: nextCounts,
      };
    });

    // clear selection for those ids
    setSelected((prev) => {
      const next = { ...prev };
      ids.forEach((id) => delete next[id]);
      return next;
    });
  }

  // ✅ Bulk apply with optimistic UI
  const runBulk = async () => {
    if (!bulk || !selectedIds.length) return;

    const ids = [...selectedIds];
    const action = bulk as any;

    const ok = await callBulk(action, ids);
    if (!ok) return;

    if (action === "TRASH" || action === "RESTORE" || action === "DELETE") {
      removeRowsFromUI(ids, action);
    }

    setBulk("");
    setSelected({});

    // if page became empty, go back one page
    setTimeout(() => {
      setData((prev) => {
        if (!prev) return prev;
        if ((prev.posts?.length || 0) === 0 && page > 1) {
          setPage(page - 1);
          load(page - 1);
        } else {
          load();
        }
        return prev;
      });
    }, 0);
  };

  const counts = data?.counts || {
    all: 0,
    mine: 0,
    published: 0,
    scheduled: 0,
    drafts: 0,
    private: 0,
    trash: 0,
  };

  const bulkOptions =
    tab === "TRASH"
      ? [
          { value: "", label: "Bulk actions" },
          { value: "RESTORE", label: "Restore" },
          { value: "DELETE", label: "Delete Permanently" },
        ]
      : [
          { value: "", label: "Bulk actions" },
          { value: "TRASH", label: "Move to Trash" },
          { value: "PUBLISH", label: "Publish" },
          { value: "DRAFT", label: "Move to Draft" },
        ];

  return (
    <div className="container-fluid py-3">
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
              onClick={() => {
                setShowScreenOptions((v) => !v);
                setShowHelp(false);
              }}
            >
              Screen Options ▾
            </button>

            {showScreenOptions ? (
              <div
                className="position-absolute end-0 mt-2 bg-white border rounded p-3"
                style={{ width: 280, zIndex: 30 }}
              >
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
              onClick={() => {
                setShowHelp((v) => !v);
                setShowScreenOptions(false);
              }}
            >
              Help ▾
            </button>

            {showHelp ? (
              <div
                className="position-absolute end-0 mt-2 bg-white border rounded p-3"
                style={{ width: 320, zIndex: 30 }}
              >
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

      {error ? <div className="alert alert-danger py-2 mb-2">{error}</div> : null}

      <div className="d-flex justify-content-end gap-2 mb-2">
        <input
          className="form-control"
          style={{ width: 280 }}
          placeholder="Search Posts"
          value={s}
          onChange={(e) => setS(e.target.value)}
        />
        <button
          className="btn btn-primary"
          onClick={() => {
            setPage(1);
            load(1);
          }}
        >
          Search Posts
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-2" style={{ fontSize: 14 }}>
        <TabLink active={tab === "ALL"} onClick={() => { setPage(1); setTab("ALL"); }}>
          All <span className="text-muted">({counts.all})</span>
        </TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "MINE"} onClick={() => { setPage(1); setTab("MINE"); }}>
          Mine <span className="text-muted">({counts.mine})</span>
        </TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "PUBLISHED"} onClick={() => { setPage(1); setTab("PUBLISHED"); }}>
          Published <span className="text-muted">({counts.published})</span>
        </TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "SCHEDULED"} onClick={() => { setPage(1); setTab("SCHEDULED"); }}>
          Scheduled <span className="text-muted">({counts.scheduled})</span>
        </TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "DRAFT"} onClick={() => { setPage(1); setTab("DRAFT"); }}>
          Drafts <span className="text-muted">({counts.drafts})</span>
        </TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "PRIVATE"} onClick={() => { setPage(1); setTab("PRIVATE"); }}>
          Private <span className="text-muted">({counts.private})</span>
        </TabLink>
        <span className="text-muted"> | </span>

        <TabLink active={tab === "TRASH"} onClick={() => { setPage(1); setTab("TRASH"); }}>
          Trash <span className="text-muted">({counts.trash})</span>
        </TabLink>
      </div>

      {/* Filters */}
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <select className="form-select" style={{ width: 200 }} value={bulk} onChange={(e) => setBulk(e.target.value)}>
          {bulkOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
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

        <button
          className="btn btn-outline-primary"
          onClick={() => {
            setPage(1);
            load(1);
          }}
        >
          Filter
        </button>

        <div className="ms-auto d-flex align-items-center gap-2 text-muted">
          <span>{data?.total ?? 0} items</span>
          <button className="btn btn-sm btn-outline-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ‹
          </button>

          <div className="d-flex align-items-center gap-1">
            <input
              className="form-control form-control-sm"
              style={{ width: 60, textAlign: "center" }}
              value={page}
              onChange={(e) => setPage(Math.max(1, parseInt(e.target.value || "1", 10)))}
            />
            <span className="text-muted">of {data?.pages ?? 1}</span>
          </div>

          <button className="btn btn-sm btn-outline-secondary" disabled={data ? page >= data.pages : true} onClick={() => setPage((p) => p + 1)}>
            ›
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded">
        <table className="table table-hover align-middle m-0">
          <thead className="table-light">
            <tr>
              <th style={{ width: 40 }}>
                <input type="checkbox" onChange={(e) => toggleAll(e.target.checked)} checked={allChecked} />
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
                    {tab !== "TRASH" ? (
                      <>
                        <Link href={`/admin/posts/${p.id}/edit`} className="text-decoration-none">
                          Edit
                        </Link>
                        {" | "}
                        <a
                          href="#"
                          className="text-decoration-none"
                          onClick={async (e) => {
                            e.preventDefault();
                            const id = Number(p.id);

                            const ok = await callBulk("TRASH", [id]);
                            if (!ok) return;

                            removeRowsFromUI([id], "TRASH");

                            // if current page becomes empty, go back
                            setTimeout(() => {
                              setData((prev) => {
                                if (!prev) return prev;
                                if ((prev.posts?.length || 0) === 0 && page > 1) {
                                  setPage(page - 1);
                                  load(page - 1);
                                } else {
                                  load();
                                }
                                return prev;
                              });
                            }, 0);
                          }}
                        >
                          Trash
                        </a>
                      </>
                    ) : (
                      <>
                        <a
                          href="#"
                          className="text-decoration-none"
                          onClick={async (e) => {
                            e.preventDefault();
                            const id = Number(p.id);

                            const ok = await callBulk("RESTORE", [id]);
                            if (!ok) return;

                            removeRowsFromUI([id], "RESTORE");
                            load();
                          }}
                        >
                          Restore
                        </a>
                        {" | "}
                        <a
                          href="#"
                          className="text-decoration-none text-danger"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (!confirm("Delete permanently? This cannot be undone.")) return;

                            const id = Number(p.id);
                            const ok = await callBulk("DELETE", [id]);
                            if (!ok) return;

                            removeRowsFromUI([id], "DELETE");

                            setTimeout(() => {
                              setData((prev) => {
                                if (!prev) return prev;
                                if ((prev.posts?.length || 0) === 0 && page > 1) {
                                  setPage(page - 1);
                                  load(page - 1);
                                } else {
                                  load();
                                }
                                return prev;
                              });
                            }, 0);
                          }}
                        >
                          Delete Permanently
                        </a>
                      </>
                    )}
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
                  <div>{p.createdAt ? new Date(p.createdAt).toLocaleString() : ""}</div>
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

function TabLink({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
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
      <span className="text-muted" style={{ fontSize: 12 }}>
        {arrow}
      </span>
    </th>
  );
}
