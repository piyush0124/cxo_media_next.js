"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

type MenuNode = {
  id: number;
  title: string;
  href: string;
  children?: MenuNode[];
};

function normalizePath(p: string) {
  if (!p) return "/";
  // strip query/hash + trailing slash (except root)
  const pathOnly = p.split("?")[0].split("#")[0];
  if (pathOnly !== "/" && pathOnly.endsWith("/")) return pathOnly.slice(0, -1);
  return pathOnly;
}

function isExternal(href: string) {
  return /^https?:\/\//i.test(href) || /^mailto:/i.test(href) || /^tel:/i.test(href);
}

export default function MenuClient({ tree = [] }: { tree?: MenuNode[] }) {
  const pathnameRaw = usePathname() || "/";
  const pathname = useMemo(() => normalizePath(pathnameRaw), [pathnameRaw]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [openParent, setOpenParent] = useState<number | null>(null);

  const safeTree = Array.isArray(tree) ? tree : [];

  const isActiveHref = (href: string) => {
    if (!href || href === "#") return false;
    if (isExternal(href)) return false;

    const target = normalizePath(href);

    // WP-like: category stays active for sub routes
    if (target.startsWith("/category/")) return pathname.startsWith(target);

    return pathname === target;
  };

  // Auto-open the parent if any child is active (WordPress-ish)
  useEffect(() => {
    const activeParent = safeTree.find((item) => item.children?.some((c) => isActiveHref(c.href)));
    if (activeParent) setOpenParent(activeParent.id);
  }, [pathname, safeTree]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const renderLink = (href: string, title: React.ReactNode, className?: string, onClick?: () => void, ariaCurrent?: "page") => {
    if (!href || href === "#") {
      return (
        <a
          href="#"
          className={className}
          onClick={(e) => {
            e.preventDefault();
            onClick?.();
          }}
        >
          {title}
        </a>
      );
    }

    if (isExternal(href)) {
      return (
        <a
          href={href}
          className={className}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClick}
        >
          {title}
        </a>
      );
    }

    return (
      <Link href={href} className={className} aria-current={ariaCurrent} onClick={onClick}>
        {title}
      </Link>
    );
  };

  return (
    <div className="site-nav">
      <div className="container">
        <div className="site-nav__inner">
          <button
            type="button"
            className="menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            aria-controls="mainmenu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="menu-toggle__bars" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>

          <nav
            id="mainmenu"
            className={`mainmenu ${menuOpen ? "mainmenu--open" : ""}`}
            aria-label="Main"
          >
            <ul className="mainmenu__list">
              {safeTree.map((item) => {
                const hasChildren = (item.children?.length || 0) > 0;
                const childActive = item.children?.some((c) => isActiveHref(c.href)) || false;
                const selfActive = isActiveHref(item.href);
                const active = selfActive || childActive;
                const open = openParent === item.id;

                return (
                  <li
                    key={item.id}
                    className={`mainmenu__item ${open ? "is-open" : ""} ${active ? "is-active" : ""}`}
                  >
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {renderLink(
                        item.href,
                        item.title,
                        `mainmenu__link ${active ? "is-active" : ""}`,
                        () => {
                          setMenuOpen(false);
                          setOpenParent(null);
                        },
                        selfActive ? "page" : undefined
                      )}

                      {hasChildren ? (
                        <button
                          type="button"
                          className="mainmenu__toggle"
                          aria-label={`Toggle ${item.title} submenu`}
                          aria-expanded={open}
                          onClick={() => setOpenParent((p) => (p === item.id ? null : item.id))}
                        >
                          <span className="mainmenu__chev" aria-hidden="true">▾</span>
                        </button>
                      ) : null}
                    </div>

                    {hasChildren ? (
                      <ul className="mainmenu__submenu" aria-label={`${item.title} submenu`}>
                        {item.children!.map((sub) => {
                          const subActive = isActiveHref(sub.href);

                          return (
                            <li key={sub.id}>
                              {renderLink(
                                sub.href,
                                sub.title,
                                `mainmenu__sublink ${subActive ? "is-active" : ""}`,
                                () => {
                                  setMenuOpen(false);
                                  setOpenParent(null);
                                },
                                subActive ? "page" : undefined
                              )}
                            </li>
                          );
                        })}
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
