"use client";

import { useState } from "react";

type Block =
  | { type: "paragraph"; content: string }
  | { type: "heading"; level: number; content: string }
  | { type: "image"; url: string };

type Props = {
  value: Block[];
  onChange: (v: Block[]) => void;
};

export default function BlockEditor({ value, onChange }: Props) {
  function update(i: number, patch: any) {
    onChange(value.map((b, idx) => (idx === i ? { ...b, ...patch } : b)));
  }

  function add(block: Block) {
    onChange([...value, block]);
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      {value.map((b, i) => (
        <div key={i} className="border rounded p-2 mb-2">
          <div className="d-flex justify-content-between mb-1">
            <strong>{b.type}</strong>
            <button className="btn btn-sm btn-danger" onClick={() => remove(i)}>
              ×
            </button>
          </div>

          {b.type === "paragraph" && (
            <textarea
              className="form-control"
              value={b.content}
              onChange={(e) => update(i, { content: e.target.value })}
            />
          )}

          {b.type === "heading" && (
            <>
              <select
                className="form-select mb-1"
                value={b.level}
                onChange={(e) => update(i, { level: Number(e.target.value) })}
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
                onChange={(e) => update(i, { content: e.target.value })}
              />
            </>
          )}

          {b.type === "image" && (
            <input
              className="form-control"
              value={b.url}
              onChange={(e) => update(i, { url: e.target.value })}
            />
          )}
        </div>
      ))}

      <div className="d-flex gap-2 mt-2">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => add({ type: "paragraph", content: "" })}
        >
          + Paragraph
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => add({ type: "heading", level: 2, content: "" })}
        >
          + Heading
        </button>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => add({ type: "image", url: "" })}
        >
          + Image
        </button>
      </div>
    </div>
  );
}
