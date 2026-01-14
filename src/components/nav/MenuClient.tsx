"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type MenuNode = {
  id: number;
  title: string;
  href: string;
  children?: MenuNode[];
};

export default function MenuClient({ tree = [] }: { tree?: MenuNode[] }) {
  const pathname = usePathname() || "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const [openParent, setOpenParent] = useState<number | null>(null);

  const isActiveHref = (href: string) => {
    // highlight internal routes properly
    if (!href || href === "#") return false;
    // exact match or "startsWith" for category
    if (href.startsWith("/category/")) return pathname.startsWith(href);
    return pathname === href;
  };

  return (
    <div className="site-nav">
      <div className="container">
        <div className="site-nav__inner">
          

          <button
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="menu-toggle__bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <nav className={`mainmenu ${menuOpen ? "mainmenu--open" : ""}`} aria-label="Main">
            <ul className="mainmenu__list">
              {Array.isArray(tree) &&
                tree.map((item) => {
                  const hasChildren = (item.children?.length || 0) > 0;
                  const childActive = item.children?.some((c) => isActiveHref(c.href)) || false;
                  const active = isActiveHref(item.href) || childActive;
                  const open = openParent === item.id;

                  return (
                    <li key={item.id} className={`mainmenu__item ${open ? "is-open" : ""}`}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <Link
                          href={item.href}
                          className={`mainmenu__link ${active ? "is-active" : ""}`}
                          aria-current={isActiveHref(item.href) ? "page" : undefined}
                          onClick={() => {
                            setMenuOpen(false);
                            setOpenParent(null);
                          }}
                          style={{ flex: 1 }}
                        >
                          {item.title}
                        </Link>

                        {hasChildren ? (
                          <button
                            type="button"
                            className="mainmenu__toggle"
                            aria-label={`Toggle ${item.title} submenu`}
                            aria-expanded={open}
                            onClick={() => setOpenParent((p) => (p === item.id ? null : item.id))}
                          >
                            <span className="mainmenu__chev">▾</span>
                          </button>
                        ) : null}
                      </div>

                      {hasChildren ? (
                        <ul className="mainmenu__submenu" aria-label={`${item.title} submenu`}>
                          {item.children!.map((sub) => (
                            <li key={sub.id}>
                              <Link
                                href={sub.href}
                                className={`mainmenu__sublink ${isActiveHref(sub.href) ? "is-active" : ""}`}
                                aria-current={isActiveHref(sub.href) ? "page" : undefined}
                                onClick={() => {
                                  setMenuOpen(false);
                                  setOpenParent(null);
                                }}
                              >
                                {sub.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
