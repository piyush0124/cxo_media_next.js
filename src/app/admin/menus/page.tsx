"use client";

import { useEffect, useMemo, useState } from "react";

type Option = { label: string; value: string };

type MenuItem = {
  id: string;
  label: string;
  type: "category" | "page" | "custom";
  value: string; // category slug OR page slug OR custom url
  children: MenuItem[];
};

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

function deepClone<T>(x: T): T {
  // @ts-ignore
  if (typeof structuredClone !== "undefined") return structuredClone(x);
  return JSON.parse(JSON.stringify(x));
}

/**
 * Find the array + index that directly contains targetId
 * returns { arr, idx }
 */
function findContainer(arr: MenuItem[], targetId: string): { arr: MenuItem[]; idx: number } | null {
  for (let i = 0; i < arr.length; i++) {
    const it = arr[i];
    if (it.id === targetId) return { arr, idx: i };
    const inside = findContainer(it.children || [], targetId);
    if (inside) return inside;
  }
  return null;
}

export default function AdminMenusPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const [categories, setCategories] = useState<Option[]>([]);
  const [pages, setPages] = useState<Option[]>([]);

  const [menu, setMenu] = useState<MenuItem[]>([]);

  // add item controls
  const [catSlug, setCatSlug] = useState("");
  const [pageSlug, setPageSlug] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [customUrl, setCustomUrl] = useState("");

  // selected item id for move/indent/outdent
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setMsg("");

      // ---------- load options (from WP DB) ----------
      const optRes = await fetch("/api/admin/menus/options", {
        cache: "no-store",
        credentials: "include",
      });

      const optJson = await optRes.json().catch(() => null);

      if (!optRes.ok || !optJson?.ok) {
        setMsg(optJson?.message || "Failed to load categories/pages");
      } else {
        setCategories(optJson.categories || []);
        setPages(optJson.pages || []);
      }

      // ---------- load saved menu ----------
      const res = await fetch("/api/admin/menus?key=primary", {
        cache: "no-store",
        credentials: "include",
      });

      const json = await res.json().catch(() => null);

      if (!res.ok || !json?.ok) {
        setMsg(json?.message || "Failed to load menu");
        setMenu([]);
      } else {
        setMenu(json.items || []);
      }

      setLoading(false);
    })();
  }, []);

  const flat = useMemo(() => {
    const out: { item: MenuItem; depth: number; parentArr: MenuItem[]; index: number }[] = [];
    const walk = (arr: MenuItem[], depth: number) => {
      arr.forEach((it, i) => {
        out.push({ item: it, depth, parentArr: arr, index: i });
        walk(it.children || [], depth + 1);
      });
    };
    walk(menu, 0);
    return out;
  }, [menu]);

  const selectedInfo = useMemo(() => {
    if (!selectedId) return null;
    return flat.find((x) => x.item.id === selectedId) || null;
  }, [selectedId, flat]);

  function addCategory() {
    if (!catSlug) return;
    const label = categories.find((c) => c.value === catSlug)?.label || catSlug;
    setMenu((m) => [...m, { id: uid(), label, type: "category", value: catSlug, children: [] }]);
    setCatSlug("");
  }

  function addPage() {
    if (!pageSlug) return;
    const label = pages.find((p) => p.value === pageSlug)?.label || pageSlug;
    setMenu((m) => [...m, { id: uid(), label, type: "page", value: pageSlug, children: [] }]);
    setPageSlug("");
  }

  function addCustom() {
    const l = customLabel.trim();
    const u = customUrl.trim();
    if (!l || !u) return;
    setMenu((m) => [...m, { id: uid(), label: l, type: "custom", value: u, children: [] }]);
    setCustomLabel("");
    setCustomUrl("");
  }

  function removeSelected() {
    if (!selectedId) return;
    const removeFrom = (arr: MenuItem[]): MenuItem[] =>
      arr
        .filter((x) => x.id !== selectedId)
        .map((x) => ({ ...x, children: removeFrom(x.children || []) }));

    setMenu((m) => removeFrom(m));
    setSelectedId(null);
  }

  // ✅ FIXED: Move Up/Down now actually updates menu tree
  function moveUpDown(dir: "up" | "down") {
    if (!selectedId) return;

    setMenu((prev) => {
      const next = deepClone(prev);
      const loc = findContainer(next, selectedId);
      if (!loc) return prev;

      const { arr, idx } = loc;
      const swapWith = dir === "up" ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= arr.length) return prev;

      [arr[idx], arr[swapWith]] = [arr[swapWith], arr[idx]];
      return next;
    });
  }

  function indent() {
    if (!selectedInfo) return;

    setMenu((prev) => {
      const next = deepClone(prev);
      const loc = findContainer(next, selectedInfo.item.id);
      if (!loc) return prev;

      const { arr, idx } = loc;
      if (idx <= 0) return prev;

      const prevSibling = arr[idx - 1];
      const curr = arr[idx];

      // remove from current level
      arr.splice(idx, 1);

      // add into previous sibling children
      prevSibling.children = prevSibling.children || [];
      prevSibling.children.push(curr);

      return next;
    });
  }

  function outdent() {
    if (!selectedId) return;

    const locateWithParent = (
      arr: MenuItem[],
      parent: MenuItem | null
    ): { parent: MenuItem | null; arr: MenuItem[]; idx: number } | null => {
      for (let i = 0; i < arr.length; i++) {
        const it = arr[i];
        if (it.id === selectedId) return { parent, arr, idx: i };
        const inside = locateWithParent(it.children || [], it);
        if (inside) return inside;
      }
      return null;
    };

    setMenu((prev) => {
      const next = deepClone(prev);
      const info = locateWithParent(next, null);
      if (!info || !info.parent) return prev; // already top-level

      const parent = info.parent;
      const fromArr = info.arr;
      const item = fromArr[info.idx];

      // remove from current child list
      fromArr.splice(info.idx, 1);

      // insert after the parent in its container
      const parentLoc = findContainer(next, parent.id);
      if (!parentLoc) return prev;

      parentLoc.arr.splice(parentLoc.idx + 1, 0, item);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMsg("");

    const res = await fetch("/api/admin/menus?key=primary", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ items: menu }),
    });

    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.ok) setMsg(json?.message || "Save failed");
    else setMsg("✅ Menu saved");

    setSaving(false);
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h1 className="m-0" style={{ fontSize: 26, fontWeight: 400 }}>
          Menus
        </h1>
        <button className="btn btn-dark" onClick={save} disabled={saving}>
          {saving ? "Saving..." : "Save Menu"}
        </button>
      </div>

      {msg ? <div className="alert alert-info py-2">{msg}</div> : null}

      <div className="row g-3">
        {/* Left: Add items */}
        <div className="col-12 col-lg-4">
          <div className="card">
            <div className="card-header fw-bold">Add Menu Items</div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Category</label>
                <div className="d-flex gap-2">
                  <select className="form-select" value={catSlug} onChange={(e) => setCatSlug(e.target.value)}>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn-outline-dark" type="button" onClick={addCategory}>
                    Add
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Page</label>
                <div className="d-flex gap-2">
                  <select className="form-select" value={pageSlug} onChange={(e) => setPageSlug(e.target.value)}>
                    <option value="">Select page</option>
                    {pages.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn-outline-dark" type="button" onClick={addPage}>
                    Add
                  </button>
                </div>
              </div>

              <div className="mb-2">
                <label className="form-label fw-bold">Custom Link</label>
                <input
                  className="form-control mb-2"
                  placeholder="Label"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                />
                <input
                  className="form-control mb-2"
                  placeholder="https://example.com"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
                <button className="btn btn-outline-dark w-100" type="button" onClick={addCustom}>
                  Add Custom Link
                </button>
              </div>

              <div className="text-muted mt-3" style={{ fontSize: 12 }}>
                Tip: Add items, then select an item on the right and use Move / Indent / Outdent like WordPress.
              </div>
            </div>
          </div>
        </div>

        {/* Right: Menu structure */}
        <div className="col-12 col-lg-8">
          <div className="card">
            <div className="card-header d-flex align-items-center justify-content-between">
              <div className="fw-bold">Menu Structure (Primary)</div>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-dark" onClick={() => moveUpDown("up")} disabled={!selectedInfo}>
                  ↑
                </button>
                <button className="btn btn-sm btn-outline-dark" onClick={() => moveUpDown("down")} disabled={!selectedInfo}>
                  ↓
                </button>
                <button className="btn btn-sm btn-outline-dark" onClick={indent} disabled={!selectedInfo}>
                  Indent
                </button>
                <button className="btn btn-sm btn-outline-dark" onClick={outdent} disabled={!selectedInfo}>
                  Outdent
                </button>
                <button className="btn btn-sm btn-outline-danger" onClick={removeSelected} disabled={!selectedInfo}>
                  Remove
                </button>
              </div>
            </div>

            <div className="card-body">
              {loading ? <div className="text-muted">Loading...</div> : null}

              {!menu.length && !loading ? <div className="text-muted">No menu items. Add from the left panel.</div> : null}

              <div className="menu-structure">
                {flat.map(({ item, depth }) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`menu-row ${selectedId === item.id ? "active" : ""}`}
                    onClick={() => setSelectedId(item.id)}
                    style={{ paddingLeft: 12 + depth * 22 }}
                  >
                    <span className="menu-row__label">{item.label}</span>
                    <span className="menu-row__type">{item.type}</span>
                  </button>
                ))}
              </div>

              <div className="text-muted mt-2" style={{ fontSize: 12 }}>
                Selected item: {selectedId || "none"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
