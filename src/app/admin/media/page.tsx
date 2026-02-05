"use client";

import { useEffect, useRef, useState } from "react";

type MediaItem = {
  id: number;
  title: string;
  url: string;
  mime?: string;
  alt?: string;
  caption?: string;
  createdAt?: string;
};

export default function AdminMediaPage() {
  const [s, setS] = useState("");
  const [page, setPage] = useState(1);
  const take = 30;

  const [data, setData] = useState<{ media: MediaItem[]; total: number; pages: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);

  async function load(nextPage?: number) {
    setErr("");
    setLoading(true);

    try {
      const qs = new URLSearchParams();
      qs.set("page", String(nextPage ?? page));
      qs.set("take", String(take));
      if (s.trim()) qs.set("s", s.trim());

      const res = await fetch(`/api/admin/media?${qs.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const json = await res.json().catch(() => null);

      if (!res.ok || !json) {
        setErr(json?.error || `Failed to load media (${res.status})`);
        setData({ media: [], total: 0, pages: 1 });
        return;
      }

      setData(json);
    } catch (e) {
      console.error(e);
      setErr("Failed to load media");
      setData({ media: [], total: 0, pages: 1 });
    } finally {
      setLoading(false);
    }
  }

  async function upload(file: File) {
    setErr("");
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: fd,
        credentials: "include",
      });

      if (res.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setErr(json?.error || `Upload failed (${res.status})`);
        return;
      }

      // refresh list (go to page 1 so newest appears)
      setPage(1);
      await load(1);
    } catch (e) {
      console.error(e);
      setErr("Upload failed");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="admin-content">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ margin: 0 }}>Media</h1>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input
            placeholder="Search media..."
            value={s}
            onChange={(e) => setS(e.target.value)}
            style={{
              padding: "8px 10px",
              border: "1px solid #dcdcde",
              borderRadius: 8,
              minWidth: 240,
            }}
          />
          <button
            onClick={() => {
              setPage(1);
              load(1);
            }}
            style={{
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #2271b1",
              background: "#2271b1",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Search
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) upload(f);
            }}
          />
        </div>
      </div>

      {err ? (
        <div style={{ marginTop: 12, color: "#b91c1c", fontWeight: 600 }}>{err}</div>
      ) : null}

      <div style={{ marginTop: 12, color: "#475569" }}>
        {data ? `${data.total} items` : "—"}
      </div>

      <div
        style={{
          marginTop: 14,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 12,
        }}
      >
        {loading ? (
          <div style={{ gridColumn: "1 / -1", color: "#475569" }}>Loading…</div>
        ) : (data?.media || []).length ? (
          data!.media.map((m) => (
            <div
              key={m.id}
              style={{
                border: "1px solid #dcdcde",
                background: "#fff",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div style={{ aspectRatio: "1 / 1", background: "#f1f5f9" }}>
                {/* stored URL should be /uploads/xxx */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.url}
                  alt={m.title || "media"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div style={{ padding: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                  {m.title || "Untitled"}
                </div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
                  #{m.id}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", color: "#475569" }}>No media found.</div>
        )}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #dcdcde",
            background: page <= 1 ? "#f1f5f9" : "#fff",
            cursor: page <= 1 ? "not-allowed" : "pointer",
          }}
        >
          Prev
        </button>

        <div style={{ color: "#475569", fontWeight: 600 }}>
          Page {page} / {data?.pages ?? 1}
        </div>

        <button
          onClick={() => setPage((p) => Math.min((data?.pages ?? 1), p + 1))}
          disabled={data ? page >= data.pages : true}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #dcdcde",
            background: data && page >= data.pages ? "#f1f5f9" : "#fff",
            cursor: data && page >= data.pages ? "not-allowed" : "pointer",
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
