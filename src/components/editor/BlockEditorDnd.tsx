"use client";

import { useMemo, useState } from "react";
import type { Block } from "./blocks";
import { uid } from "./blocks";

type Props = {
  value: Block[];
  onChange: (v: Block[]) => void;
};

export default function BlockEditorDnd({ value, onChange }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);

  const indexById = useMemo(() => {
    const m = new Map<string, number>();
    value.forEach((b, i) => m.set(b.id, i));
    return m;
  }, [value]);

  function update(id: string, patch: Partial<any>) {
    onChange(value.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  }

  function add(type: Block["type"]) {
    if (type === "paragraph") onChange([...value, { id: uid(), type, content: "" }]);
    if (type === "heading") onChange([...value, { id: uid(), type, level: 2, content: "" }]);
    if (type === "image") onChange([...value, { id: uid(), type, url: "", alt: "" }]);
  }

  function remove(id: string) {
    onChange(value.filter((b) => b.id !== id));
  }

  function move(fromId: string, toId: string) {
    const from = indexById.get(fromId);
    const to = indexById.get(toId);
    if (from == null || to == null || from === to) return;

    const copy = [...value];
    const [picked] = copy.splice(from, 1);
    copy.splice(to, 0, picked);
    onChange(copy);
  }

  return (
    <div>
      <div className="d-flex gap-2 mb-2 flex-wrap">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => add("paragraph")}>
          + Paragraph
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => add("heading")}>
          + Heading
        </button>
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => add("image")}>
          + Image
        </button>
      </div>

      {value.length === 0 ? (
        <div className="text-muted">No blocks yet. Add one above.</div>
      ) : null}

      {value.map((b) => (
        <div
          key={b.id}
          draggable
          onDragStart={() => setDragId(b.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => {
            if (dragId && dragId !== b.id) move(dragId, b.id);
            setDragId(null);
          }}
          className="border rounded p-2 mb-2 bg-white"
          style={{ cursor: "grab" }}
        >
          <div className="d-flex align-items-center justify-content-between mb-1">
            <div className="fw-semibold">{b.type}</div>
            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => remove(b.id)}>
              Remove
            </button>
          </div>

          {b.type === "paragraph" ? (
            <textarea
              className="form-control"
              rows={4}
              value={b.content}
              onChange={(e) => update(b.id, { content: e.target.value })}
              placeholder="Write paragraph..."
            />
          ) : null}

          {b.type === "heading" ? (
            <>
              <select
                className="form-select mb-2"
                value={b.level}
                onChange={(e) => update(b.id, { level: Number(e.target.value) })}
              >
                {[1, 2, 3, 4].map((l) => (
                  <option key={l} value={l}>
                    H{l}
                  </option>
                ))}
              </select>
              <input
                className="form-control"
                value={b.content}
                onChange={(e) => update(b.id, { content: e.target.value })}
                placeholder="Heading text..."
              />
            </>
          ) : null}

          {b.type === "image" ? (
            <>
              <label className="form-label">Image URL</label>
              <input
                className="form-control mb-2"
                value={b.url}
                onChange={(e) => update(b.id, { url: e.target.value })}
                placeholder="https://..."
              />
              <label className="form-label">Alt / caption</label>
              <input
                className="form-control"
                value={b.alt || ""}
                onChange={(e) => update(b.id, { alt: e.target.value })}
              />
            </>
          ) : null}

          <div className="text-muted mt-2" style={{ fontSize: 12 }}>
            Drag this block to reorder (WP-like).
          </div>
        </div>
      ))}
    </div>
  );
}
