"use client";

import Link from "next/link";

export default function WaiterHome() {
  return (
    <div className="containerNarrow">
      <h1 className="pageTitle">Waiter</h1>
      <div className="card">
        <p className="muted">
          Scan a girl’s static QR using your phone camera. It opens a URL like:
        </p>
        <div style={{ marginTop: 10 }}>
          <code>/waiter/scan/&lt;girlCode&gt;</code>
        </div>
        <p className="muted" style={{ marginTop: 12 }}>
          You’ll be asked for your waiter code + PIN + amount.
        </p>
        <p className="muted" style={{ marginTop: 10 }}>
          Tip: add this site to home screen for faster use.
        </p>

        <div style={{ marginTop: 14 }}>
          <Link className="btnGhost" href="/">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
