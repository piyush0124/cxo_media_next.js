"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Role = "ADMIN" | "EDITOR" | "AUTHOR" | "CONTRIBUTOR" | "SUBSCRIBER";
type UserRow = { id: number; username: string; name: string; email?: string | null; role: Role };

const ROLES: Role[] = ["ADMIN", "EDITOR", "AUTHOR", "CONTRIBUTOR", "SUBSCRIBER"];

export default function UsersListPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (res.status === 401) return (window.location.href = "/admin/login");
    if (res.status === 403) return (window.location.href = "/admin/dashboard");

    setUsers(Array.isArray(data.users) ? data.users : []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function del(id: number) {
    if (!confirm("Delete user?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return alert(data.error || "Delete failed");
    load();
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h4 m-0">Users</h1>
        <Link href="/admin/users/new" className="btn btn-primary btn-sm">Add New</Link>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th style={{ width: 160 }}>Role</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-4 text-center text-muted">Loading…</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-muted">No users</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <Link href={`/admin/users/${u.id}/edit`} className="text-decoration-none">
                        <strong>{u.username}</strong>
                      </Link>
                    </td>
                    <td>{u.name}</td>
                    <td className="text-muted">{u.email || "—"}</td>
                    <td>
                      <span className="badge text-bg-light border">{u.role}</span>
                    </td>
                    <td className="d-flex gap-2">
                      <Link href={`/admin/users/${u.id}/edit`} className="btn btn-sm btn-outline-primary">Edit</Link>
                      <button onClick={() => del(u.id)} className="btn btn-sm btn-outline-danger">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
