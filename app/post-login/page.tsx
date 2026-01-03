"use client";

import Link from "next/link";

export default function PostLogin() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Post Login</h2>
      <p>Login flow is disabled (no-login mode).</p>
      <Link href="/">Back to home</Link>
    </div>
  );
}
