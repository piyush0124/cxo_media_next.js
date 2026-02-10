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

function WpMetaBox({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="wp-metabox">
      <div className="wp-metabox__head" onClick={() => setOpen((v) => !v)}>
        <div className="wp-metabox__title">{title}</div>
        <div className="wp-metabox__chev">{open ? "▾" : "▸"}</div>
      </div>
      {open ? <div className="wp-metabox__body">{children}</div> : null}
    </div>
  );
}

export default function PostEditorWp({ mode, initial, categories = [] }: Props) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  // core post
  const [id, setId] = useState<number | null>(initial?.id ?? null);
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
  const isScheduled = status === "SCHEDULED";

  // flags
  const [featured, setFeatured] = useState<boolean>(Boolean(initial?.featured));
  const [trending, setTrending] = useState<boolean>(Boolean(initial?.trending));

  // thumbnail (Featured Image in WP)
  const [thumbnail, setThumbnail] = useState<string>(initial?.thumbnail ?? "");

  // SEO
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.metaDescription ?? ""
  );
  const [ogImage, setOgImage] = useState(initial?.ogImage ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(initial?.canonicalUrl ?? "");
  const [noIndex, setNoIndex] = useState(Boolean(initial?.noIndex));

  // blocks editor (convert to HTML on save)
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

  // secondary authors
  const [users, setUsers] = useState<{ id: number; name: string }[]>([]);
  const [secondaryAuthors, setSecondaryAuthors] = useState<number[]>(
    Array.isArray(initial?.secondaryAuthors) ? initial.secondaryAuthors : []
  );

  // media modal
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
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

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

  // load users for secondary authors
  useEffect(() => {
    fetch("/api/admin/users/list", { credentials: "include" })
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => setUsers([]));
  }, []);

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

      const found =
        selectedMedia &&
        json?.media?.find((x: MediaItem) => x.id === selectedMedia.id);
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

      setMediaPage(1);
      await loadMedia();
      if (json?.media) setSelectedMedia(json.media);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setMsg("");

    const payload = {
      id,
      title: title.trim(),
      slug: slug.trim(),
      excerpt: excerpt?.trim() || "",
      content: blocksToHtml(blocks),

      // optional (if you store blocks JSON separately, keep it)
      blocks,

      tags: tags?.trim() || "",
      categoryId: categoryId ? Number(categoryId) : null,

      featured,
      trending,

      status,
      publishedAt: isScheduled ? fromInputLocal(publishedAtLocal) : null,

      thumbnail: thumbnail?.trim() || null,

      secondaryAuthors,

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

    const newId = json.id ? Number(json.id) : null;
    if (!id && newId) {
      setId(newId);
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
    <div className="wp-editor">
      <div className="wp-editor__tabs">
        <div className="fw-semibold">Add New Post</div>

        <div className="ms-auto d-flex align-items-center gap-2">
          {msg ? <span className="text-success small">{msg}</span> : null}
          <button
            className="btn btn-primary btn-sm"
            onClick={save}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      <div className="wp-editor__grid">
        {/* LEFT */}
        <div className="wp-editor__left">
          <input
            className="wp-title"
            placeholder="Add title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="wp-toolbar">
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                setMediaOpen(true);
                setMediaPage(1);
                setSelectedMedia(null);
              }}
            >
              + Add Media
            </button>

            <div className="wp-toolbar__hint text-muted">
              URL: <code>{urlPreview}</code>
            </div>

            <div className="ms-auto d-flex gap-2">
              <span className="wp-pill">Visual</span>
              <span className="wp-pill wp-pill--off">Text</span>
            </div>
          </div>

          <div className="wp-editorbox">
            <BlockEditorDnd value={blocks} onChange={setBlocks} />
          </div>

          <WpMetaBox title="Excerpt" defaultOpen={false}>
            <textarea
              className="form-control"
              rows={4}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </WpMetaBox>
        </div>

        {/* RIGHT */}
        <div className="wp-editor__right">
          <WpMetaBox title="Publish" defaultOpen>
            <div className="small text-muted mb-2">
              <div>
                Status: <b>{status}</b>
              </div>
              <div>
                Visibility: <b>Public</b>
              </div>
            </div>

            <label className="form-label small mb-1">Status</label>
            <select
              className="form-select form-select-sm mb-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="PRIVATE">Private</option>
            </select>

            {isScheduled ? (
              <>
                <label className="form-label small mb-1">Publish date/time</label>
                <input
                  type="datetime-local"
                  className="form-control form-control-sm mb-2"
                  value={publishedAtLocal}
                  onChange={(e) => setPublishedAtLocal(e.target.value)}
                />
              </>
            ) : null}

            <div className="form-check mb-2">
              <input
                id="featured"
                className="form-check-input"
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="featured">
                Featured
              </label>
            </div>

            <div className="form-check mb-3">
              <input
                id="trending"
                className="form-check-input"
                type="checkbox"
                checked={trending}
                onChange={(e) => setTrending(e.target.checked)}
              />
              <label className="form-check-label small" htmlFor="trending">
                Trending
              </label>
            </div>

            <button className="btn btn-primary w-100" onClick={save} disabled={saving}>
              {saving
                ? "Saving..."
                : status === "PUBLISHED"
                ? "Update"
                : status === "SCHEDULED"
                ? "Schedule"
                : "Publish"}
            </button>
          </WpMetaBox>

          <WpMetaBox title="Secondary Authors" defaultOpen={false}>
            <select
              multiple
              className="form-select form-select-sm"
              value={secondaryAuthors.map(String)}
              onChange={(e) => {
                const ids = Array.from(e.target.selectedOptions).map((o) =>
                  Number(o.value)
                );
                setSecondaryAuthors(ids);
              }}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <div className="text-muted small mt-1">
              Hold Ctrl / Cmd to select multiple authors.
            </div>
          </WpMetaBox>

          <WpMetaBox title="Categories" defaultOpen>
            <select
              className="form-select form-select-sm"
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
          </WpMetaBox>

          <WpMetaBox title="Tags" defaultOpen>
            <input
              className="form-control form-control-sm"
              placeholder="Separate tags with commas"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </WpMetaBox>

          <WpMetaBox title="Featured Image" defaultOpen>
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
                Set featured image
              </button>

              {thumbnail ? (
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => setThumbnail("")}
                >
                  Remove
                </button>
              ) : null}
            </div>

            {thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnail}
                alt="Featured"
                style={{
                  width: "100%",
                  borderRadius: 8,
                  border: "1px solid #e5e5e5",
                }}
              />
            ) : (
              <div className="text-muted small">No featured image set.</div>
            )}
          </WpMetaBox>

          <WpMetaBox title="SEO Settings" defaultOpen>
            <label className="form-label small mb-1">Meta Title</label>
            <input
              className="form-control form-control-sm mb-2"
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />

            <label className="form-label small mb-1">Meta Description</label>
            <textarea
              className="form-control form-control-sm mb-2"
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />

            <label className="form-label small mb-1">OG Image</label>
            <input
              className="form-control form-control-sm mb-2"
              value={ogImage}
              onChange={(e) => setOgImage(e.target.value)}
            />

            <label className="form-label small mb-1">Canonical URL</label>
            <input
              className="form-control form-control-sm mb-2"
              value={canonicalUrl}
              onChange={(e) => setCanonicalUrl(e.target.value)}
            />

            <div className="form-check mb-2">
              <input
                type="checkbox"
                className="form-check-input"
                checked={noIndex}
                onChange={(e) => setNoIndex(e.target.checked)}
                id="noindex"
              />
              <label htmlFor="noindex" className="form-check-label small">
                Noindex
              </label>
            </div>

            <SeoPreview
              title={title}
              slug={slug}
              metaTitle={metaTitle}
              metaDescription={metaDescription}
              siteName="APAC News Network"
              ogImage={ogImage || thumbnail}
            />
          </WpMetaBox>
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
                      </div>

                      <button
                        className="btn btn-primary btn-sm w-100 mt-2"
                        onClick={() => {
                          setThumbnail(selectedMedia.url);
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
              Tip: select an image → “Set as Featured Image”.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
