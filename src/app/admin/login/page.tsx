"use client";
import { useState } from "react";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: any) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) return setError("Invalid credentials");
    window.location.href = "/admin/dashboard";
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full border p-2" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" className="w-full border p-2" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-500">{error}</p>}
        <button className="px-4 py-2 border">Login</button>
      </form>
    </div>
  );
}
