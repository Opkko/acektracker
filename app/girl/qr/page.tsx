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
    <div className="containerNarrow">
      <h1 className="pageTitle">Girl QR</h1>
      <div className="card">
        <p className="muted">This QR is static. Print it or save it on the phone.</p>

        <label className="label">Base URL</label>
        <input
          className="input"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          placeholder="https://your-domain.com"
        />

        <label className="label">Girl</label>
        <select
          className="select"
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
          <div style={{ marginTop: 16, display: "grid", placeItems: "center", gap: 12 }}>
            <div style={{ background: "#fff", padding: 12, borderRadius: 14 }}>
              <QRCode value={url} size={260} />
            </div>
            <code style={{ wordBreak: "break-all" }}>{url}</code>
          </div>
        ) : (
          <p className="muted" style={{ marginTop: 16 }}>
            Loading...
          </p>
        )}
      </div>
    </div>
  );
}
