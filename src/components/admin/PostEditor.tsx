"use client";

import { useEffect, useMemo, useState } from "react";
import SeoPreview from "@/components/admin/SeoPreview";
import BlockEditorDnd from "@/components/editor/BlockEditorDnd";
import type { Block } from "@/components/editor/blocks";
import { blocksToHtml, uid } from "@/components/editor/blocks";

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
  const [msg, setMsg] = useState("");

  // core
  const [wpId, setWpId] = useState<number | null>(initial?.id ?? null);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [tags, setTags] = useState(initial?.tags ?? "");
  const [categoryId, setCategoryId] = useState<string>(
    initial?.categoryId ? String(initial.categoryId) : ""
  );
  const [status, setStatus] = useState<string>(initial?.status ?? "DRAFT");
  const [publishedAtLocal, setPublishedAtLocal] = useState<string>(
    toInputLocal(initial?.publishedAt)
  );

  // ✅ Featured Image
  const [featuredMediaId, setFeaturedMediaId] = useState<number | null>(
    initial?.featuredMediaId ?? null
  );
  const [featuredUrl, setFeaturedUrl] = useState<string>(
    initial?.featuredUrl ?? ""
  );
  const [featuredTitle, setFeaturedTitle] = useState<string>(
    initial?.featuredTitle ?? ""
  );
  const [featuredAlt, setFeaturedAlt] = useState<string>(
    initial?.featuredAlt ?? ""
  );
  const [featuredCaption, setFeaturedCaption] = useState<string>(
    initial?.featuredCaption ?? ""
  );

  // ✅ SEO
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.metaDescription ?? ""
  );
  const [ogImage, setOgImage] = useState(initial?.ogImage ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl ?? "");
  const [noIndex, setNoIndex] = useState(Boolean(initial?.noIndex));

  // ✅ Gutenberg blocks (convert to HTML on save)
  const [blocks, setBlocks] = useState<Block[]>(
    Array.isArray(initial?.blocks)
      ? initial.blocks
      : [
          {
            id: uid(),
            type: "paragraph",
            content: initial?.content ? String(initial.content) : "",
          },
        ]
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
  const [uploading, setUploading] = useState(false);

  // ✅ selected item inside modal (WP-like)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const isScheduled = status === "SCHEDULED";

  // auto slug (create)
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

      // keep selection if still in list, otherwise clear
      const found =
        selectedMedia && json?.media?.find((x: MediaItem) => x.id === selectedMedia.id);
      if (!found) setSelectedMedia(null);
    } catch {
      setMediaData({ media: [], total: 0, pages: 1 });
      setSelectedMedia(null);
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

      // After upload, refresh library and select newly uploaded item
      setMediaPage(1);
      await loadMedia();

      if (json?.media) {
        setSelectedMedia(json.media);
      }
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

      content: blocksToHtml(blocks),
      blocks, // optional meta

      tags: tags?.trim() || "",
      categoryId: categoryId ? Number(categoryId) : null,
      status,
      publishedAt: isScheduled ? fromInputLocal(publishedAtLocal) : null,

      featuredMediaId: featuredMediaId ? Number(featuredMediaId) : null,
      featuredTitle: featuredTitle?.trim() || "",
      featuredAlt: featuredAlt?.trim() || "",
      featuredCaption: featuredCaption?.trim() || "",

      metaTitle: metaTitle?.trim() || "",
      metaDescription: metaDescription?.trim() || "",
      ogImage: ogImage?.trim() || "",
      canonicalUrl: canonicalUrl?.trim() || "",
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

    const newId = json.wpId ? Number(json.wpId) : null;
    if (!wpId && newId) {
      setWpId(newId);
      window.location.href = `/admin/posts/${newId}/edit`;
    }
  }

  const urlPreview = useMemo(() => {
    const d = new Date();
    return `/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(d.getDate()).padStart(2, "0")}/${slug || "your-slug"}/`;
  }, [slug]);

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4">{mode === "create" ? "Add New Post" : "Edit Post"}</h1>

        <div className="d-flex align-items-center gap-2">
          {msg ? <span className="text-success small">{msg}</span> : null}
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving..." : status === "PUBLISHED" ? "Update" : "Save"}
          </button>
        </div>
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
            <BlockEditorDnd value={blocks} onChange={setBlocks} />
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
                <option value="PRIVATE">Private</option>
              </select>

              {isScheduled ? (
                <input
                  type="datetime-local"
                  className="form-control"
                  value={publishedAtLocal}
                  onChange={(e) => setPublishedAtLocal(e.target.value)}
                />
              ) : null}
            </div>
          </div>

          {/* Category */}
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

          {/* Featured Image */}
          <div className="card mb-3">
            <div className="card-header">Featured Image</div>
            <div className="card-body">
              <div className="d-flex gap-2 mb-2">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => {
                    setMediaOpen(true);
                    setMediaPage(1);
                    setSelectedMedia(null);
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
                    />
                  </div>

                  <div className="mt-2">
                    <label className="form-label fw-semibold">Alt Text</label>
                    <input
                      className="form-control"
                      value={featuredAlt}
                      onChange={(e) => setFeaturedAlt(e.target.value)}
                    />
                  </div>

                  <div className="mt-2">
                    <label className="form-label fw-semibold">Caption</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      value={featuredCaption}
                      onChange={(e) => setFeaturedCaption(e.target.value)}
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

          {/* SEO */}
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

              <div className="form-check mb-3">
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

              <SeoPreview
                title={title}
                slug={slug}
                metaTitle={metaTitle}
                metaDescription={metaDescription}
                siteName="CXO Media"
                ogImage={ogImage || featuredUrl}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MEDIA MODAL (WP-like) */}
      {mediaOpen ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{ background: "rgba(0,0,0,.5)", zIndex: 9999 }}
          onClick={() => setMediaOpen(false)}
        >
          <div
            className="bg-white rounded p-3"
            style={{
              width: "min(1100px, 96vw)",
              height: "min(760px, 92vh)",
              margin: "4vh auto",
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

            {/* Upload */}
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

            {/* Search */}
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

            {/* Grid + details */}
            <div className="row g-3">
              <div className="col-md-8">
                {mediaLoading ? (
                  <div className="text-muted">Loading...</div>
                ) : (
                  <div className="row g-2">
                    {(mediaData?.media || []).map((m) => {
                      const selected = selectedMedia?.id === m.id;
                      return (
                        <div key={m.id} className="col-6 col-md-3">
                          <button
                            type="button"
                            className={`btn w-100 text-start p-2 border ${
                              selected ? "btn-primary text-white" : "btn-light"
                            }`}
                            onClick={() => setSelectedMedia(m)}
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
                                border: "1px solid rgba(0,0,0,.1)",
                              }}
                            />
                            <div className="mt-2" style={{ fontSize: 12 }}>
                              <div className="fw-semibold text-truncate">
                                {m.title || `#${m.id}`}
                              </div>
                              <div className="text-muted text-truncate">
                                {m.mime}
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}

                    {!mediaData?.media?.length ? (
                      <div className="text-muted">No media found.</div>
                    ) : null}
                  </div>
                )}

                {/* ✅ Pagination controls */}
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

              {/* ✅ Right side details panel */}
              <div className="col-md-4">
                <div className="border rounded p-2">
                  <div className="fw-semibold mb-2">Attachment details</div>

                  {selectedMedia ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.alt || selectedMedia.title || ""}
                        style={{
                          width: "100%",
                          height: 180,
                          objectFit: "cover",
                          borderRadius: 6,
                          border: "1px solid rgba(0,0,0,.12)",
                        }}
                      />

                      <div className="mt-2" style={{ fontSize: 12 }}>
                        <div>
                          <b>Title:</b>{" "}
                          {selectedMedia.title || `#${selectedMedia.id}`}
                        </div>
                        <div>
                          <b>Type:</b> {selectedMedia.mime}
                        </div>
                        <div className="text-muted">
                          <b>ID:</b> {selectedMedia.id}
                        </div>
                      </div>

                      <button
                        className="btn btn-primary btn-sm w-100 mt-2"
                        onClick={() => {
                          setFeaturedMediaId(Number(selectedMedia.id));
                          setFeaturedUrl(selectedMedia.url);
                          setFeaturedTitle(selectedMedia.title || "");
                          setFeaturedAlt(selectedMedia.alt || "");
                          setFeaturedCaption(selectedMedia.caption || "");
                          setMediaOpen(false);
                        }}
                      >
                        Set as Featured Image
                      </button>
                    </>
                  ) : (
                    <div className="text-muted" style={{ fontSize: 13 }}>
                      Select an item to see details.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="text-muted mt-2" style={{ fontSize: 12 }}>
              Tip: click an image to select, then click “Set as Featured Image”.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
