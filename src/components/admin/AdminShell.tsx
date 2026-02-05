"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";

type MenuItem =
  | { type: "title"; title: string }
  | { type: "link"; href: string; label: string };

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "/";

  const menu: MenuItem[] = useMemo(
    () => [
      { type: "link", href: "/admin/dashboard", label: "Dashboard" },

      { type: "title", title: "Content" },
      { type: "link", href: "/admin/posts", label: "Posts" },
      { type: "link", href: "/admin/posts/new", label: "Add New" },
      { type: "link", href: "/admin/categories", label: "Categories" },
      { type: "link", href: "/admin/media", label: "Media" },

      { type: "title", title: "Moderation" },
      { type: "link", href: "/admin/comments", label: "Comments" },

      { type: "title", title: "Users" },
      { type: "link", href: "/admin/users", label: "Users" },

      { type: "title", title: "Settings" },
      { type: "link", href: "/admin/settings", label: "Settings" },
      { type: "link", href: "/admin/menus", label: "Menus" },
    ],
    []
  );

  const getTitle = () => {
    const found = menu.find((m) => m.type === "link" && isActive(pathname, m.href)) as any;
    return found?.label || "Admin";
  };

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-title">CXO Media</div>
          <div className="admin-brand-sub">Admin</div>
        </div>

        <nav className="admin-menu" aria-label="Admin menu">
          {menu.map((item, idx) => {
            if (item.type === "title") {
              return (
                <div key={`t-${idx}`} className="admin-menu-title">
                  {item.title}
                </div>
              );
            }

            const active = isActive(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-menu-link ${active ? "is-active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-topbar-title">{getTitle()}</span>
          </div>

          <div className="admin-topbar-right">
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="btn btn-sm btn-outline-dark">
                Logout
              </button>
            </form>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

function normalizePath(p: string) {
  if (!p) return "/";
  const base = p.split("?")[0].split("#")[0];
  if (base !== "/" && base.endsWith("/")) return base.slice(0, -1);
  return base;
}

// WP-style active: exact match OR section match (e.g. /admin/posts/* active on /admin/posts)
function isActive(currentPath: string, href: string) {
  const cur = normalizePath(currentPath);
  const target = normalizePath(href);

  if (cur === target) return true;

  // keep section active (but avoid dashboard being active everywhere)
  if (target !== "/admin/dashboard" && cur.startsWith(target + "/")) return true;

  return false;
}
