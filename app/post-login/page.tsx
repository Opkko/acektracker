"use client";

import Link from "next/link";

export default function PostLogin() {
  return (
    <div className="containerNarrow">
      <h1 className="pageTitle">Post Login</h1>
      <div className="card">
        <p className="muted">Login flow is disabled (no-login mode).</p>
        <div style={{ marginTop: 14 }}>
          <Link className="btnGhost" href="/">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
