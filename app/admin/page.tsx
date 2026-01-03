"use client";

import { useEffect, useMemo, useState } from "react";
import { getGirlName, getWaiterName } from "@/lib/simpleConfig";

type Row = {
  name: string;
  total: number;
};

type Summary = {
  perGirl: { key: string; total: number }[];
  perWaiter: { key: string; total: number }[];
  perDay: { key: string; total: number }[];
  grandTotal: number;
  count: number;
};

export default function AdminPage() {
  const [girls, setGirls] = useState<Row[]>([]);
  const [waiters, setWaiters] = useState<Row[]>([]);
  const [days, setDays] = useState<Row[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);

      const res = await fetch("/api/payments", { cache: "no-store" });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { error?: string } | null;
        setErr(j?.error ?? "Failed to load");
        return;
      }

      const j = (await res.json()) as { summary?: Summary };
      const s = j.summary;
      if (!s) {
        setErr("Missing summary");
        return;
      }

      setGirls(s.perGirl.map((r) => ({ name: getGirlName(r.key), total: r.total })));
      setWaiters(s.perWaiter.map((r) => ({ name: getWaiterName(r.key), total: r.total })));
      setDays(s.perDay.map((r) => ({ name: r.key, total: r.total })));
    })();
  }, []);

  const grandTotal = useMemo(() => girls.reduce((s, r) => s + r.total, 0), [girls]);

  return (
    <div style={{ padding: 24 }}>
      <h2>Admin Totals</h2>
      {err && <p style={{ color: "red" }}>{err}</p>}

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 420 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Girl</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ccc", padding: 8 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {girls.map((r) => (
              <tr key={r.name}>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{r.name}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee", textAlign: "right" }}>
                  {r.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 420 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Waiter</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ccc", padding: 8 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {waiters.map((r) => (
              <tr key={r.name}>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{r.name}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee", textAlign: "right" }}>
                  {r.total.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Breakdown per day</h3>
        <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 420 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ccc", padding: 8 }}>Day</th>
              <th style={{ textAlign: "right", borderBottom: "1px solid #ccc", padding: 8 }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {days.map((r) => (
              <tr key={r.name}>
                <td style={{ padding: 8, borderBottom: "1px solid #eee" }}>{r.name}</td>
                <td style={{ padding: 8, borderBottom: "1px solid #eee", textAlign: "right" }}>
                  {r.total.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: 8, fontWeight: 700 }}>Grand Total</td>
              <td style={{ padding: 8, textAlign: "right", fontWeight: 700 }}>
                {grandTotal.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
