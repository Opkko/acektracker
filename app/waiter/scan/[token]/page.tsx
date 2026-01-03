"use client";

import { useMemo, useState } from "react";
import { getGirlName } from "@/lib/simpleConfig";

export default function ScanPage({ params }: { params: { token: string } }) {
  const girlCode = decodeURIComponent(params.token);
  const girlName = useMemo(() => getGirlName(girlCode), [girlCode]);

  const [stage, setStage] = useState<"form" | "done">("form");
  const [waiterCode, setWaiterCode] = useState<string>("");
  const [waiterPin, setWaiterPin] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    setErr(null);
    const n = Number(amount);
    if (!Number.isFinite(n) || n <= 0) {
      setErr("Amount must be > 0");
      return;
    }

    if (!waiterCode.trim()) {
      setErr("Waiter code is required");
      return;
    }

    if (!waiterPin.trim()) {
      setErr("Waiter PIN is required");
      return;
    }

    const res = await fetch("/api/payments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ girlCode, waiterCode, waiterPin, amount: n }),
    });

    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as { error?: string } | null;
      setErr(j?.error ?? "Failed to record");
      return;
    }

    setStage("done");
  };

  return (
    <div className="containerNarrow">
      <h1 className="pageTitle">Record Payment</h1>

      {err && <p className="alertError">{err}</p>}

      {stage === "form" && (
        <>
          <div className="card">
            <p className="muted">
              Girl: <span className="strong">{girlName}</span>
            </p>

            <label className="label">Waiter Code</label>
            <input
              className="input"
              placeholder="e.g. W01"
              value={waiterCode}
              onChange={(e) => setWaiterCode(e.target.value)}
              autoCapitalize="characters"
              autoCorrect="off"
              inputMode="text"
            />

            <label className="label">Waiter PIN</label>
            <input
              className="input"
              placeholder="PIN"
              type="password"
              value={waiterPin}
              onChange={(e) => setWaiterPin(e.target.value)}
              inputMode="numeric"
            />

            <label className="label">Amount</label>
            <input
              className="input"
              inputMode="decimal"
              placeholder="e.g. 180"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <button className="btnPrimary" onClick={submit}>
              Submit
            </button>
          </div>
        </>
      )}

      {stage === "done" && (
        <>
          <div className="card">
            <p className="success">Recorded successfully.</p>
            <p className="muted">Scan next girl QR to continue.</p>
          </div>
        </>
      )}
    </div>
  );
}
