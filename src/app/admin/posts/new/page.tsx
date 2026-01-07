"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NewPostPage() {
  const router = useRouter();
  const [cats, setCats] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("DRAFT");
  const [featured, setFeatured] = useState(false);
  const [trending, setTrending] = useState(false);
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // if you don't have categories API yet, tell me; I’ll add it.
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((j) => setCats(j.categories || []))
      .catch(() => setCats([]));
  }, []);

  useEffect(() => {
    if (!slug) setSlug(slugify(title));
  }, [title]); // eslint-disable-line

  async function save() {
    setError("");
    if (!categoryId) return setError("Please select a category.");

    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        slug,
        excerpt,
        content,
        thumbnail,
        categoryId,
        status,
        featured,
        trending,
        tags,
      }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.message || "Failed to create post");
      return;
    }

    router.push("/admin/posts");
  }

  return (
    <div className="container py-4">
      <h1 className="mb-3">Add New Post</h1>

      {error ? <div className="alert alert-danger py-2">{error}</div> : null}

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="bg-white border rounded p-3">
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input className="form-control" value={title} onChange={(e) => { setTitle(e.target.value); setSlug(slugify(e.target.value)); }} />
            </div>

            <div className="mb-3">
              <label className="form-label">Slug</label>
              <input className="form-control" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} />
            </div>

            <div className="mb-3">
              <label className="form-label">Excerpt</label>
              <textarea className="form-control" rows={3} value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Content</label>
              <textarea className="form-control" rows={12} value={content} onChange={(e) => setContent(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="bg-white border rounded p-3 mb-3">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value as any)}>
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Publish</option>
            </select>

            <div className="form-check mt-3">
              <input className="form-check-input" type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
              <label className="form-check-label">Featured</label>
            </div>

            <div className="form-check mt-2">
              <input className="form-check-input" type="checkbox" checked={trending} onChange={(e) => setTrending(e.target.checked)} />
              <label className="form-check-label">Trending</label>
            </div>
          </div>

          <div className="bg-white border rounded p-3 mb-3">
            <label className="form-label">Category</label>
            <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))}>
              <option value="">Select…</option>
              {cats.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <label className="form-label mt-3">Tags</label>
            <input className="form-control" placeholder="Comma separated tags" value={tags} onChange={(e) => setTags(e.target.value)} />
          </div>

          <div className="bg-white border rounded p-3">
            <label className="form-label">Thumbnail URL</label>
            <input className="form-control" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} placeholder="https://..." />
            <button className="btn btn-dark w-100 mt-3" onClick={save}>
              Save Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
