"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="containerNarrow">
      <h1 className="pageTitle">Welcome</h1>
      <div className="card">
        <p className="muted">
          Flow: open Girl QR → print/share QR → waiter scans QR → enters waiter code + PIN + amount → admin
          watches totals.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
          <Link className="btnGhost" href="/girl/qr">
            Girl QR
          </Link>
          <Link className="btnGhost" href="/waiter">
            Waiter
          </Link>
          <Link className="btnGhost" href="/admin">
            Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
