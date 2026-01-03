"use client";

import { useMemo, useState } from "react";
import { getGirlName, waiters } from "@/lib/simpleConfig";

export default function ScanPage({ params }: { params: { token: string } }) {
  const girlCode = decodeURIComponent(params.token);
  const girlName = useMemo(() => getGirlName(girlCode), [girlCode]);

  const [stage, setStage] = useState<"form" | "done">("form");
  const [waiterCode, setWaiterCode] = useState<string>(waiters[0]?.code ?? "W01");
  const [amount, setAmount] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setErr("Amount must be > 0");
      return;
    }

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ girlCode, waiterCode, amount: n }),
    });

    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as { error?: string } | null;
      setErr(j?.error ?? "Failed to record");
      return;
    }

    setStage("done");
  };

  return (
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h2>Record Payment</h2>

      {err && <p style={{ color: "red" }}>{err}</p>}

      {stage === "form" && (
        <>
          <p>
            Girl: <b>{girlName}</b>
          </p>

          <label style={{ display: "block", marginTop: 12 }}>Waiter Code</label>
          <select
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            value={waiterCode}
            onChange={(e) => setWaiterCode(e.target.value)}
          >
            {waiters.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>

          <label>Amount</label>
          <input
            style={{ width: "100%", padding: 10, marginTop: 6 }}
            inputMode="decimal"
            placeholder="e.g. 180"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button style={{ width: "100%", padding: 12, marginTop: 14 }} onClick={submit}>
            Submit
          </button>
        </>
      )}

      {stage === "done" && (
        <>
          <p>✅ Recorded successfully.</p>
          <p>Scan next girl QR to continue.</p>
        </>
      )}
    </div>
  );
}
