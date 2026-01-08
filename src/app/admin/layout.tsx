import "bootstrap/dist/css/bootstrap.min.css";
import "./admin.css";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-brand-title">CXO Media</div>
          <div className="admin-brand-sub">Admin</div>
        </div>

        <nav className="admin-menu">
          <MenuLink href="/admin/dashboard" label="Dashboard" />
          <MenuTitle title="Content" />
          <MenuLink href="/admin/posts" label="Posts" />
          <MenuLink href="/admin/posts/new" label="Add New" />
          <MenuLink href="/admin/categories" label="Categories" />
          <MenuLink href="/admin/media" label="Media" />

          <MenuTitle title="Moderation" />
          <MenuLink href="/admin/comments" label="Comments" />

          <MenuTitle title="Users" />
          <MenuLink href="/admin/users" label="Users" />

          <MenuTitle title="Settings" />
          <MenuLink href="/admin/settings" label="Settings" />
        </nav>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <span className="admin-topbar-title">Dashboard</span>
          </div>

          <div className="admin-topbar-right">
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-sm btn-outline-dark">Logout</button>
            </form>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

function MenuTitle({ title }: { title: string }) {
  return <div className="admin-menu-title">{title}</div>;
}

function MenuLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="admin-menu-link">
      {label}
    </Link>
  );
}
