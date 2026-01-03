"use client";

import Link from "next/link";

export default function WaiterHome() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Waiter</h2>
      <p>Scan a girl’s static QR using your phone camera. It will open a URL like:</p>
      <code>/waiter/scan/&lt;girlCode&gt;</code>
      <p style={{ marginTop: 12 }}>
        Tip: add this site to home screen for faster use.
      </p>
      <Link href="/">Home</Link>
    </div>
  );
}
