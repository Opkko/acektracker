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
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Login</h2>
      <p>Login is currently disabled (no-login mode).</p>
      <label style={{ display: "block", marginTop: 12 }}>Role</label>
      <select
        style={{ width: "100%", padding: 10, marginTop: 6 }}
        value={role}
        onChange={(e) => setRole(e.target.value as "waiter" | "girl")}
      >
        <option value="waiter">waiter</option>
        <option value="girl">girl</option>
      </select>
      <input
        style={{ width: "100%", padding: 10 }}
        placeholder="email@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button style={{ marginTop: 12, padding: 10, width: "100%" }} onClick={sendLink}>
        Disabled
      </button>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      <div style={{ marginTop: 12 }}>
        <Link href="/">Back to home</Link>
      </div>
    </div>
  );
}
