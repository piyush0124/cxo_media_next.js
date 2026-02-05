"use client";

import { useEffect, useMemo, useState } from "react";

type Category = { id: number; name: string };

type MediaItem = {
  id: number;
  title: string;
  url: string;
  mime: string;
  date: string;
  alt?: string | null;
  caption?: string | null;
};

type Props = {
  mode: "create" | "edit";
  initial?: any;
  categories?: Category[];
};

/* ---------- helpers ---------- */
function toInputLocal(dateIso?: string | null) {
  if (!dateIso) return "";
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function fromInputLocal(v: string) {
  if (!v) return null;
  const d = new Date(v);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

/* ---------- component ---------- */
export default function PostEditor({ mode, initial, categories = [] }: Props) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  /* ---------- core post ---------- */
  const [wpId, setWpId] = useState<number | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    initial?.categoryId ? String(initial.categoryId) : ""
  );

  const [status, setStatus] = useState<string>(initial?.status ?? "DRAFT");
  const [publishedAtLocal, setPublishedAtLocal] = useState<string>(
    toInputLocal(initial?.publishedAt)
  );

  /* ---------- featured image ---------- */
  const [featuredMediaId, setFeaturedMediaId] = useState<number | null>(
    initial?.featuredMediaId ?? null
  );
  const [featuredUrl, setFeaturedUrl] = useState<string>(
    initial?.featuredUrl ?? ""
  );
  const [featuredTitle, setFeaturedTitle] = useState(
    initial?.featuredTitle ?? ""
  );
  const [featuredAlt, setFeaturedAlt] = useState(
    initial?.featuredAlt ?? ""
  );
  const [featuredCaption, setFeaturedCaption] = useState(
    initial?.featuredCaption ?? ""
  );

  /* ---------- SEO (NEW) ---------- */
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.metaDescription ?? ""
  );
  const [ogImage, setOgImage] = useState(initial?.ogImage ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(
    initial?.canonicalUrl ?? ""
  );
  const [noIndex, setNoIndex] = useState(Boolean(initial?.noIndex));

  /* ---------- media modal ---------- */
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaData, setMediaData] = useState<{
    media: MediaItem[];
    pages: number;
  } | null>(null);
  const [mediaPage, setMediaPage] = useState(1);
  const [mediaLoading, setMediaLoading] = useState(false);

  const isScheduled = status === "SCHEDULED";

  /* ---------- auto slug ---------- */
  useEffect(() => {
    if (mode !== "create") return;
    if (slug.trim()) return;
    const s = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
    setSlug(s);
  }, [title]);

  /* ---------- save ---------- */
  async function save() {
    setSaving(true);
    setMsg("");

    const payload = {
      wpId,
      title: title.trim(),
      slug: slug.trim(),
      excerpt,
      content,
      tags,
      categoryId: categoryId ? Number(categoryId) : null,
      status,
      publishedAt: isScheduled ? fromInputLocal(publishedAtLocal) : null,

      featuredMediaId,
      featuredTitle,
      featuredAlt,
      featuredCaption,

      /* SEO */
      metaTitle,
      metaDescription,
      ogImage,
      canonicalUrl,
      noIndex,
    };

    const res = await fetch("/api/posts/save", {
      method: "POST",
      credentials: "include",
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

    if (!wpId && json.wpId) {
      window.location.href = `/admin/posts/${json.wpId}/edit`;
    }
  }

  /* ---------- URL preview ---------- */
  const urlPreview = useMemo(() => {
    const d = new Date();
    return `/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(d.getDate()).padStart(2, "0")}/${slug || "your-slug"}/`;
  }, [slug]);

  /* ---------- render ---------- */
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4">
          {mode === "create" ? "Add New Post" : "Edit Post"}
        </h1>
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="row g-3">
        {/* LEFT */}
        <div className="col-lg-8">
          <div className="card p-3 mb-3">
            <label className="fw-semibold">Title</label>
            <input
              className="form-control mb-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label className="fw-semibold">Slug</label>
            <input
              className="form-control mb-1"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <small className="text-muted">URL: {urlPreview}</small>

            <label className="fw-semibold mt-3">Excerpt</label>
            <textarea
              className="form-control"
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />

            <label className="fw-semibold mt-3">Content</label>
            <textarea
              className="form-control"
              rows={14}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="col-lg-4">
          {/* Publish */}
          <div className="card mb-3">
            <div className="card-header">Publish</div>
            <div className="card-body">
              <select
                className="form-select mb-2"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="SCHEDULED">Scheduled</option>
              </select>

              {isScheduled && (
                <input
                  type="datetime-local"
                  className="form-control"
                  value={publishedAtLocal}
                  onChange={(e) => setPublishedAtLocal(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="card mb-3">
            <div className="card-header">Category</div>
            <div className="card-body">
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SEO PANEL */}
          <div className="card mb-3">
            <div className="card-header">SEO</div>
            <div className="card-body">
              <label className="fw-semibold">Meta Title</label>
              <input
                className="form-control mb-2"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
              />

              <label className="fw-semibold">Meta Description</label>
              <textarea
                className="form-control mb-2"
                rows={3}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
              />

              <label className="fw-semibold">OG Image URL</label>
              <input
                className="form-control mb-2"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
              />

              <label className="fw-semibold">Canonical URL</label>
              <input
                className="form-control mb-2"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
              />

              <div className="form-check">
                <input
                  type="checkbox"
                  className="form-check-input"
                  checked={noIndex}
                  onChange={(e) => setNoIndex(e.target.checked)}
                  id="noindex"
                />
                <label htmlFor="noindex" className="form-check-label">
                  Noindex
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {msg && <div className="mt-2 text-success">{msg}</div>}
    </div>
  );
}
