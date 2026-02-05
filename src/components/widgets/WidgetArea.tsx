import { PrismaClient } from "@prisma/client";
import React from "react";

const prisma = new PrismaClient();

type Widget =
  | { type: "html"; title?: string; html: string }
  | { type: "recent_posts"; title?: string; limit?: number }
  | { type: "categories"; title?: string };

export default async function WidgetArea({ areaKey }: { areaKey: string }) {
  const area = await prisma.widgetArea.findUnique({ where: { areaKey } });
  const widgets: Widget[] = area?.config ? JSON.parse(area.config) : [];

  return (
    <div className="widget-area">
      {widgets.map((w, idx) => (
        <WidgetItem key={idx} widget={w} />
      ))}
    </div>
  );
}

async function WidgetItem({ widget }: { widget: any }) {
  const title = widget.title ? <h4 className="widget-title">{widget.title}</h4> : null;

  if (widget.type === "html") {
    return (
      <div className="widget">
        {title}
        <div dangerouslySetInnerHTML={{ __html: widget.html || "" }} />
      </div>
    );
  }

  if (widget.type === "recent_posts") {
    const prisma = new PrismaClient();
    const posts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      take: Number(widget.limit || 5),
      select: { title: true, slug: true },
    });

    return (
      <div className="widget">
        {title || <h4 className="widget-title">Recent Posts</h4>}
        <ul>
          {posts.map((p) => (
            <li key={p.slug}>{p.title}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (widget.type === "categories") {
    const prisma = new PrismaClient();
    const cats = await prisma.category.findMany({ select: { name: true, slug: true }, orderBy: { name: "asc" } });

    return (
      <div className="widget">
        {title || <h4 className="widget-title">Categories</h4>}
        <ul>
          {cats.map((c) => (
            <li key={c.slug}>{c.name}</li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
}
