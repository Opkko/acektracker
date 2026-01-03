"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getGirlName, getWaiterName, girls as girlsConfig } from "@/lib/simpleConfig";

type PaymentRecord = {
  girlCode: string;
  waiterCode: string;
  amount: number;
  createdAt: string;
};

type Summary = {
  perGirl: { key: string; total: number }[];
  perWaiter: { key: string; total: number }[];
  perDay: { key: string; total: number }[];
  grandTotal: number;
  count: number;
};

function computeSummary(records: PaymentRecord[]): Summary {
  const perGirl = new Map<string, number>();
  const perWaiter = new Map<string, number>();
  const perDay = new Map<string, number>();

  for (const r of records) {
    const girlCode = typeof r.girlCode === "string" ? r.girlCode : "";
    const waiterCode = typeof r.waiterCode === "string" ? r.waiterCode : "";
    const amount = Number(r.amount ?? 0);
    if (!Number.isFinite(amount)) continue;

    if (girlCode) perGirl.set(girlCode, (perGirl.get(girlCode) ?? 0) + amount);
    if (waiterCode) perWaiter.set(waiterCode, (perWaiter.get(waiterCode) ?? 0) + amount);

    const day = typeof r.createdAt === "string" ? r.createdAt.slice(0, 10) : "";
    if (day) perDay.set(day, (perDay.get(day) ?? 0) + amount);
  }

  const toRows = (m: Map<string, number>) =>
    Array.from(m.entries())
      .map(([key, total]) => ({ key, total }))
      .sort((a, b) => b.total - a.total);

  return {
    perGirl: toRows(perGirl),
    perWaiter: toRows(perWaiter),
    perDay: toRows(perDay).sort((a, b) => (a.key < b.key ? 1 : -1)),
    grandTotal: records.reduce((s, r) => s + Number(r.amount ?? 0), 0),
    count: records.length,
  };
}

export default function AdminPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedGirlCode, setSelectedGirlCode] = useState<string>("ALL");

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

    const j = (await res.json()) as { records?: unknown };
    const nextRecords = Array.isArray(j.records) ? (j.records as PaymentRecord[]) : [];
    setRecords(nextRecords);
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

  const allSummary = useMemo(() => computeSummary(records), [records]);

  const filteredRecords = useMemo(() => {
    if (selectedGirlCode === "ALL") return records;
    return records.filter((r) => r.girlCode === selectedGirlCode);
  }, [records, selectedGirlCode]);

  const summary = useMemo(() => computeSummary(filteredRecords), [filteredRecords]);

  const girlOptions = useMemo(() => {
    const codes = new Set<string>();
    for (const g of girlsConfig) codes.add(g.code);
    for (const row of allSummary.perGirl) if (row.key) codes.add(row.key);
    return [
      { code: "ALL", name: "All girls" },
      ...Array.from(codes)
        .sort((a, b) => a.localeCompare(b))
        .map((code) => ({ code, name: getGirlName(code) })),
    ];
  }, [allSummary.perGirl]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <h1 className="pageTitle">Admin Totals</h1>
          <p className="muted">
            Live updates every 5 seconds{lastUpdated ? ` · Last updated: ${lastUpdated}` : ""}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="select"
            style={{ width: 220 }}
            value={selectedGirlCode}
            onChange={(e) => setSelectedGirlCode(e.target.value)}
          >
            {girlOptions.map((g) => (
              <option key={g.code} value={g.code}>
                {g.name} {g.code !== "ALL" ? `(${g.code})` : ""}
              </option>
            ))}
          </select>
          <button className="btnGhost" onClick={load} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      {err && <p className="alertError">{err}</p>}

      <div className="grid" style={{ marginTop: 14 }}>
        {selectedGirlCode !== "ALL" && (
          <div className="col12">
            <div className="card" style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <p className="muted">Selected girl</p>
                <p className="strong" style={{ fontSize: 18 }}>
                  {getGirlName(selectedGirlCode)} ({selectedGirlCode})
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p className="muted">Total received</p>
                <p className="strong" style={{ fontSize: 18 }}>
                  {summary.grandTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

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
                {summary.perGirl.map((r) => (
                  <tr key={r.key}>
                    <td>{getGirlName(r.key)}</td>
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
                {summary.perWaiter.map((r) => (
                  <tr key={r.key}>
                    <td>{getWaiterName(r.key)}</td>
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
                {summary.perDay.map((r) => (
                  <tr key={r.key}>
                    <td>{r.key}</td>
                    <td className="right">{r.total.toFixed(2)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="strong">Total</td>
                  <td className="right strong">{summary.grandTotal.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
