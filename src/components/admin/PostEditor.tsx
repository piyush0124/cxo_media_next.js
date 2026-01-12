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
  initial?: any; // id/wpId, title, slug, excerpt, content, tags, categoryId, status, publishedAt, featuredMediaId, featuredUrl, featuredTitle, featuredAlt, featuredCaption
  categories?: Category[];
};

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

export default function PostEditor({ mode, initial, categories = [] }: Props) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string>("");

  // ✅ WP post id
  const [wpId, setWpId] = useState<number | null>(
    initial?.id ?? initial?.wpId ?? null
  );

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

  // ✅ Featured image (attachment)
  const [featuredMediaId, setFeaturedMediaId] = useState<number | null>(
    initial?.featuredMediaId ?? null
  );
  const [featuredUrl, setFeaturedUrl] = useState<string>(
    initial?.featuredUrl ?? ""
  );

  // ✅ Featured meta
  const [featuredTitle, setFeaturedTitle] = useState<string>(
    initial?.featuredTitle ?? ""
  );
  const [featuredAlt, setFeaturedAlt] = useState<string>(
    initial?.featuredAlt ?? ""
  );
  const [featuredCaption, setFeaturedCaption] = useState<string>(
    initial?.featuredCaption ?? ""
  );

  // Media modal
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaQ, setMediaQ] = useState("");
  const [mediaPage, setMediaPage] = useState(1);
  const [mediaData, setMediaData] = useState<{
    media: MediaItem[];
    total: number;
    pages: number;
  } | null>(null);
  const [mediaLoading, setMediaLoading] = useState(false);

  // upload state
  const [uploading, setUploading] = useState(false);

  // auto slug from title (create)
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

  async function loadMedia() {
    setMediaLoading(true);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(mediaPage));
      qs.set("take", "30");
      if (mediaQ.trim()) qs.set("s", mediaQ.trim());

      const res = await fetch(`/api/admin/media?${qs.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });
      const json = await res.json();
      setMediaData(json);
    } catch {
      setMediaData({ media: [], total: 0, pages: 1 });
    } finally {
      setMediaLoading(false);
    }
  }

  useEffect(() => {
    if (!mediaOpen) return;
    loadMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaOpen, mediaPage]);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        alert(json?.message || "Upload failed");
        return;
      }

      // select uploaded image as featured
      const m = json.media;
      setFeaturedMediaId(Number(m.id));
      setFeaturedUrl(String(m.url));

      // prefill meta from upload
      setFeaturedTitle(String(m.title || ""));
      setFeaturedAlt("");
      setFeaturedCaption("");

      // refresh list
      setMediaPage(1);
      await loadMedia();
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setMsg("");

    const payload = {
      wpId,
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt?.trim() || "",
      content,
      tags: tags?.trim() || "",
      categoryId: categoryId ? Number(categoryId) : null,
      status,
      publishedAt: isScheduled ? fromInputLocal(publishedAtLocal) : null,

      // ✅ featured image + meta
      featuredMediaId: featuredMediaId ? Number(featuredMediaId) : null,
      featuredTitle: featuredTitle?.trim() || "",
      featuredAlt: featuredAlt?.trim() || "",
      featuredCaption: featuredCaption?.trim() || "",
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

    const newId = json.wpId ? Number(json.wpId) : null;
    if (!wpId && newId) {
      setWpId(newId);
      window.location.href = `/admin/posts/${newId}/edit`;
      return;
    }
  }

  const urlPreview = useMemo(() => {
    const iso =
      status === "SCHEDULED"
        ? fromInputLocal(publishedAtLocal)
        : initial?.publishedAt || new Date().toISOString();

    const d = new Date(iso || new Date().toISOString());
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `/${yyyy}/${mm}/${dd}/${slug || "your-slug"}/`;
  }, [status, publishedAtLocal, slug, initial?.publishedAt]);

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
              <input
                className="form-control form-control-lg"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Slug</label>
              <input
                className="form-control"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                URL preview: <code>{urlPreview}</code>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Excerpt</label>
              <textarea
                className="form-control"
                rows={3}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label fw-semibold">Content</label>
              <textarea
                className="form-control"
                rows={14}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                (Later we can replace this with a wp-like rich editor.)
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="col-12 col-lg-4">
          {/* Publish */}
          <div className="bg-white border rounded mb-3">
            <div className="border-bottom px-3 py-2 fw-semibold">Publish</div>
            <div className="p-3">
              <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
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

              <button
                className="btn btn-primary w-100"
                onClick={save}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : status === "PUBLISHED"
                  ? "Update"
                  : status === "SCHEDULED"
                  ? "Schedule"
                  : "Save Draft"}
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white border rounded mb-3">
            <div className="border-bottom px-3 py-2 fw-semibold">
              Categories
            </div>
            <div className="p-3">
              <select
                className="form-select"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white border rounded mb-3">
            <div className="border-bottom px-3 py-2 fw-semibold">Tags</div>
            <div className="p-3">
              <input
                className="form-control"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="comma,separated,tags"
              />
              <div className="text-muted mt-1" style={{ fontSize: 12 }}>
                DB-only: tags will be created/linked in WP tables on save.
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white border rounded">
            <div className="border-bottom px-3 py-2 fw-semibold">
              Featured Image
            </div>
            <div className="p-3">
              <div className="d-flex gap-2 mb-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    setMediaOpen(true);
                    setMediaPage(1);
                  }}
                >
                  Media Library
                </button>

                {featuredMediaId ? (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => {
                      setFeaturedMediaId(null);
                      setFeaturedUrl("");
                      setFeaturedTitle("");
                      setFeaturedAlt("");
                      setFeaturedCaption("");
                    }}
                  >
                    Remove
                  </button>
                ) : null}
              </div>

              {featuredUrl ? (
                <>
                  <div className="mb-2 text-muted" style={{ fontSize: 12 }}>
                    Attachment ID: <code>{featuredMediaId}</code>
                  </div>

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredUrl}
                    alt={featuredAlt || featuredTitle || "Featured"}
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #eee",
                    }}
                  />

                  <div className="mt-3">
                    <label className="form-label fw-semibold">Image Title</label>
                    <input
                      className="form-control"
                      value={featuredTitle}
                      onChange={(e) => setFeaturedTitle(e.target.value)}
                      placeholder="Attachment title"
                    />
                  </div>

                  <div className="mt-2">
                    <label className="form-label fw-semibold">Alt Text</label>
                    <input
                      className="form-control"
                      value={featuredAlt}
                      onChange={(e) => setFeaturedAlt(e.target.value)}
                      placeholder="Alt text (for SEO)"
                    />
                  </div>

                  <div className="mt-2">
                    <label className="form-label fw-semibold">Caption</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={featuredCaption}
                      onChange={(e) => setFeaturedCaption(e.target.value)}
                      placeholder="Caption"
                    />
                  </div>
                </>
              ) : (
                <div className="text-muted" style={{ fontSize: 13 }}>
                  Select or upload an image from Media Library.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MEDIA MODAL */}
      {mediaOpen ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,.5)", zIndex: 9999 }}
          onClick={() => setMediaOpen(false)}
        >
          <div
            className="bg-white rounded p-3"
            style={{
              width: "min(1000px, 94vw)",
              height: "min(720px, 90vh)",
              margin: "5vh auto",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center gap-2 mb-2">
              <div className="fw-semibold">Media Library</div>
              <div className="ms-auto">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => setMediaOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>

            {/* ✅ Upload from local */}
            <div className="d-flex align-items-center gap-2 mb-3">
              <input
                type="file"
                accept="image/*"
                className="form-control"
                disabled={uploading}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadFile(f);
                  e.currentTarget.value = "";
                }}
              />
              <div className="text-muted" style={{ fontSize: 12 }}>
                {uploading ? "Uploading..." : "Upload image"}
              </div>
            </div>

            <div className="d-flex gap-2 mb-3">
              <input
                className="form-control"
                placeholder="Search media..."
                value={mediaQ}
                onChange={(e) => setMediaQ(e.target.value)}
              />
              <button
                className="btn btn-primary"
                onClick={() => {
                  setMediaPage(1);
                  loadMedia();
                }}
              >
                Search
              </button>
            </div>

            {mediaLoading ? (
              <div className="text-muted">Loading...</div>
            ) : (
              <div className="row g-2">
                {(mediaData?.media || []).map((m) => (
                  <div key={m.id} className="col-6 col-md-3">
                    <button
                      type="button"
                      className="btn btn-light border w-100 text-start p-2"
                      onClick={() => {
                        setFeaturedMediaId(Number(m.id));
                        setFeaturedUrl(m.url);

                        // ✅ prefill meta if available
                        setFeaturedTitle(m.title || "");
                        setFeaturedAlt(m.alt || "");
                        setFeaturedCaption(m.caption || "");

                        setMediaOpen(false);
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={m.url}
                        alt={m.alt || m.title || ""}
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 6,
                        }}
                      />
                      <div className="mt-2" style={{ fontSize: 12 }}>
                        <div className="fw-semibold text-truncate">
                          {m.title || `#${m.id}`}
                        </div>
                        <div className="text-muted text-truncate">{m.mime}</div>
                      </div>
                    </button>
                  </div>
                ))}

                {!mediaData?.media?.length ? (
                  <div className="text-muted">No media found.</div>
                ) : null}
              </div>
            )}

            <div className="d-flex align-items-center justify-content-between mt-3">
              <div className="text-muted" style={{ fontSize: 12 }}>
                {mediaData?.total ?? 0} items
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={mediaPage <= 1}
                  onClick={() => setMediaPage((p) => p - 1)}
                >
                  ‹ Prev
                </button>
                <div className="text-muted" style={{ fontSize: 12 }}>
                  Page {mediaPage} / {mediaData?.pages ?? 1}
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  disabled={mediaData ? mediaPage >= mediaData.pages : true}
                  onClick={() => setMediaPage((p) => p + 1)}
                >
                  Next ›
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
