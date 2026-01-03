"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);

    const res = await fetch("/api/payments", { cache: "no-store" });
    if (!res.ok) {
      const j = (await res.json().catch(() => null)) as { error?: string } | null;
      setErr(j?.error ?? "Failed to load");
      setLoading(false);
      return;
    }

    const j = (await res.json()) as { summary?: Summary };
    const s = j.summary;
    if (!s) {
      setErr("Missing summary");
      setLoading(false);
      return;
    }

    setGirls(s.perGirl.map((r) => ({ name: getGirlName(r.key), total: r.total })));
    setWaiters(s.perWaiter.map((r) => ({ name: getWaiterName(r.key), total: r.total })));
    setDays(s.perDay.map((r) => ({ name: r.key, total: r.total })));
    setLastUpdated(new Date().toLocaleString());
    setLoading(false);
  }, []);

  useEffect(() => {
    const t0 = setTimeout(() => {
      void load();
    }, 0);
    const t = setInterval(() => {
      void load();
    }, 5000);
    return () => {
      clearTimeout(t0);
      clearInterval(t);
    };
  }, [load]);

  const grandTotal = useMemo(() => girls.reduce((s, r) => s + r.total, 0), [girls]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="pageTitle">Admin Totals</h1>
          <p className="muted">
            Live updates every 5 seconds{lastUpdated ? ` · Last updated: ${lastUpdated}` : ""}
          </p>
        </div>
        <button className="btnGhost" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {err && <p className="alertError">{err}</p>}

      <div className="grid" style={{ marginTop: 14 }}>
        <div className="col6">
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Girl</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {girls.map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td className="right">{r.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col6">
          <div className="card">
            <table className="table">
              <thead>
                <tr>
                  <th>Waiter</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {waiters.map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td className="right">{r.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="col12">
          <div className="card">
            <p className="muted" style={{ marginBottom: 8 }}>
              Breakdown per day
            </p>
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {days.map((r) => (
                  <tr key={r.name}>
                    <td>{r.name}</td>
                    <td className="right">{r.total.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="strong">Grand Total</td>
                  <td className="right strong">{grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
