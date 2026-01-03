"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"waiter" | "girl">("waiter");
  const [msg, setMsg] = useState<string | null>(null);

  const sendLink = async () => {
    setMsg(null);
    setMsg("Login is disabled in no-login mode.");
  };

  return (
    <div className="containerNarrow">
      <h1 className="pageTitle">Login</h1>
      <div className="card">
        <p className="muted">Login is currently disabled (no-login mode).</p>

        <label className="label">Role</label>
        <select
          className="select"
          value={role}
          onChange={(e) => setRole(e.target.value as "waiter" | "girl")}
        >
          <option value="waiter">waiter</option>
          <option value="girl">girl</option>
        </select>

        <label className="label">Email</label>
        <input
          className="input"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button className="btnPrimary" onClick={sendLink}>
          Disabled
        </button>

        {msg && <p className="muted" style={{ marginTop: 12 }}>{msg}</p>}

        <div style={{ marginTop: 14 }}>
          <Link className="btnGhost" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
