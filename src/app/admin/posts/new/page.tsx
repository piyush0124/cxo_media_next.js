"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { slugify } from "@/src/lib/utils";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function NewPost() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [thumbnail, setThumbnail] = useState("");

  async function uploadImage(file: File) {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: data });
    const json = await res.json();
    setThumbnail(json.url);
  }

  async function submit() {
    const body = {
      title,
      slug: slug || slugify(title),
      content,
      excerpt,
      thumbnail,
      status: "PUBLISHED",
      authorId: 1,
      categoryId: 1
    };
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    window.location.href = "/admin/dashboard";
  }

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold">Create Post</h1>
      <input className="w-full border p-2" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
      <input className="w-full border p-2" placeholder="Slug" value={slug} onChange={e=>setSlug(e.target.value)} />
      <textarea className="w-full border p-2" placeholder="Excerpt" value={excerpt} onChange={e=>setExcerpt(e.target.value)} />
      <ReactQuill value={content} onChange={setContent} />
      <input type="file" onChange={e=>e.target.files && uploadImage(e.target.files[0])} />
      {thumbnail && <img src={thumbnail} className="max-w-sm" />}
      <button onClick={submit} className="px-4 py-2 border">Publish</button>
    </div>
  );
}
