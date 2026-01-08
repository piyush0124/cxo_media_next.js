"use client";

import { useEffect, useMemo, useState } from "react";

type Category = { id: number; name: string };

type Props = {
  mode: "create" | "edit";
  initial?: any; // post
  categories?: Category[];
};

function toInputLocal(dateIso?: string | null) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  // datetime-local expects local time string
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromInputLocal(v: string) {
  if (!v) return null;
  // Treat as local time → convert to ISO
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function PostEditor({ mode, initial, categories = [] }: Props) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const [id, setId] = useState<number | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [categoryId, setCategoryId] = useState<string>(initial?.categoryId ? String(initial.categoryId) : "");
  const [status, setStatus] = useState<string>(initial?.status ?? "DRAFT");
  const [publishedAtLocal, setPublishedAtLocal] = useState<string>(toInputLocal(initial?.publishedAt));

  // auto slug from title (only if slug empty on create)
  useEffect(() => {
    if (mode !== "create") return;
    if (slug.trim()) return;
    const s = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setSlug(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const isScheduled = status === "SCHEDULED";

  async function save() {
    setSaving(true);
    setMsg("");

    const payload = {
      id,
      title,
      slug,
      excerpt,
      content,
      thumbnail,
      tags,
      categoryId,
      status,
      publishedAt: isScheduled ? fromInputLocal(publishedAtLocal) : null,
    };

    const res = await fetch("/api/posts/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json().catch(() => null);
    setSaving(false);

    if (!res.ok || !json?.ok) {
      setMsg(json?.message || "Save failed");
      return;
    }

    setMsg("Saved ✅");

    // after create, redirect to edit (WP behavior)
    if (!id && json?.post?.id) {
      window.location.href = `/admin/posts/${json.post.id}/edit`;
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="m-0" style={{ fontSize: 26, fontWeight: 400 }}>
          {mode === "create" ? "Add New Post" : "Edit Post"}
        </h1>

        <div className="d-flex align-items-center gap-2">
          {msg ? <span className="text-success small">{msg}</span> : null}
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving..." : status === "PUBLISHED" ? "Update" : "Save"}
          </button>
        </div>
      </div>

      <div className="row g-3">
        {/* LEFT MAIN */}
        <div className="col-12 col-lg-8">
          <div className="bg-white border rounded p-3 mb-3">
            <div className="mb-3">
              <label className="form-label fw-semibold">Title</label>
              <input className="form-control form-control-lg" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Slug</label>
              <input className="form-control" value={slug} onChange={(e) => setSlug(e.target.value)} />
             {(() => {
  const iso =
    status === "SCHEDULED"
      ? fromInputLocal(publishedAtLocal)
      : (initial?.publishedAt || new Date().toISOString());

  const d = new Date(iso || new Date().toISOString());
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return (
    <div className="text-muted mt-1" style={{ fontSize: 12 }}>
      URL preview:{" "}
      <code>/{yyyy}/{mm}/{dd}/{slug || "your-slug"}/</code>
    </div>
  );
})()}

            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Excerpt</label>
              <textarea className="form-control" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            </div>

            <div>
              <label className="form-label fw-semibold">Content</label>
              <textarea className="form-control" rows={14} value={content} onChange={(e) => setContent(e.target.value)} />
              <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                (Later we can replace this with a WP-like rich editor.)
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR (WP Boxes) */}
        <div className="col-12 col-lg-4">
          {/* Publish box */}
          <div className="bg-white border rounded mb-3">
            <div className="border-bottom px-3 py-2 fw-semibold">Publish</div>
            <div className="p-3">
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </div>

              {isScheduled ? (
                <div className="mb-3">
                  <label className="form-label">Publish date/time</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={publishedAtLocal}
                    onChange={(e) => setPublishedAtLocal(e.target.value)}
                  />
                  <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                    Must be a future time.
                  </div>
                </div>
              ) : null}

              <button className="btn btn-primary w-100" onClick={save} disabled={saving}>
                {saving ? "Saving..." : status === "PUBLISHED" ? "Update" : status === "SCHEDULED" ? "Schedule" : "Save Draft"}
              </button>
            </div>
          </div>

          {/* Categories box */}
          <div className="bg-white border rounded mb-3">
            <div className="border-bottom px-3 py-2 fw-semibold">Categories</div>
            <div className="p-3">
              <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags box */}
          <div className="bg-white border rounded mb-3">
            <div className="border-bottom px-3 py-2 fw-semibold">Tags</div>
            <div className="p-3">
              <input className="form-control" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma,separated,tags" />
            </div>
          </div>

          {/* Featured image */}
          <div className="bg-white border rounded">
            <div className="border-bottom px-3 py-2 fw-semibold">Featured Image</div>
            <div className="p-3">
              <input className="form-control mb-2" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://..." />
              {thumbnail ? (
                <img src={thumbnail} alt="Featured" style={{ width: "100%", borderRadius: 8, border: "1px solid #eee" }} />
              ) : (
                <div className="text-muted" style={{ fontSize: 13 }}>
                  Add image URL to preview.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
