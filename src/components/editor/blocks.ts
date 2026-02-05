export type Block =
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "heading"; level: number; content: string }
  | { id: string; type: "image"; url: string; alt?: string };

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function esc(s: string) {
  return (s || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function blocksToHtml(blocks: Block[]) {
  return (blocks || [])
    .map((b) => {
      if (b.type === "paragraph") return `<p>${esc(b.content).replaceAll("\n", "<br/>")}</p>`;
      if (b.type === "heading") {
        const lvl = Math.min(4, Math.max(1, Number(b.level || 2)));
        return `<h${lvl}>${esc(b.content)}</h${lvl}>`;
      }
      if (b.type === "image") {
        const alt = esc(b.alt || "");
        const url = esc(b.url || "");
        if (!url) return "";
        return `<figure><img src="${url}" alt="${alt}" /><figcaption>${alt}</figcaption></figure>`;
      }
      return "";
    })
    .join("\n");
}
