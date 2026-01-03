"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Acek Tracker</h2>
      <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
        <Link href="/girl/qr">Girl QR</Link>
        <Link href="/waiter">Waiter</Link>
        <Link href="/admin">Admin</Link>
      </div>
      <p style={{ marginTop: 12 }}>
        No login mode: scan static girl QR, enter waiter code + amount, submit.
      </p>
    </div>
  );
}
