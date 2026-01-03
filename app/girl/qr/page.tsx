"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { girls } from "@/lib/simpleConfig";

export default function GirlQRPage() {
  const [girlCode, setGirlCode] = useState(girls[0]?.code ?? "G01");
  const [baseUrl, setBaseUrl] = useState<string>(() =>
    typeof window !== "undefined" ? window.location.origin : ""
  );

  const url = useMemo(() => {
    const origin = baseUrl.trim().replace(/\/$/, "");
    if (!origin) return "";
    return `${origin}/waiter/scan/${encodeURIComponent(girlCode)}`;
  }, [baseUrl, girlCode]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Girl QR</h2>
      <p>This QR is static. Print it or save it on the phone.</p>

      <label style={{ display: "block", marginTop: 12 }}>Base URL</label>
      <input
        style={{ width: "100%", maxWidth: 520, padding: 10, marginTop: 6 }}
        value={baseUrl}
        onChange={(e) => setBaseUrl(e.target.value)}
        placeholder="https://your-domain.com"
      />

      <label style={{ display: "block", marginTop: 12 }}>Girl</label>
      <select
        style={{ width: "100%", maxWidth: 360, padding: 10, marginTop: 6 }}
        value={girlCode}
        onChange={(e) => setGirlCode(e.target.value)}
      >
        {girls.map((g) => (
          <option key={g.code} value={g.code}>
            {g.name} ({g.code})
          </option>
        ))}
      </select>

      {url ? (
        <div style={{ marginTop: 16 }}>
          <QRCode value={url} size={260} />
          <div style={{ marginTop: 12 }}>
            <code>{url}</code>
          </div>
        </div>
      ) : (
        <p style={{ marginTop: 16 }}>Loading...</p>
      )}
    </div>
  );
}
