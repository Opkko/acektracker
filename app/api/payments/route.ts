export const runtime = 'edge';

import { NextResponse } from "next/server";

type PaymentRecord = {
  girlCode: string;
  waiterCode: string;
  amount: number;
  createdAt: string;
};

type WaiterPins = Record<string, string>;

let localRecords: PaymentRecord[] = [];

let waiterPinsCache: WaiterPins | null = null;

function parseWaiterPins(raw: string): WaiterPins {
  const trimmed = raw.trim();
  if (!trimmed) return {};

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const v = JSON.parse(trimmed) as unknown;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const out: WaiterPins = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        if (typeof val === "string" && k.trim() && val.trim()) out[k.trim()] = val.trim();
      }
      return out;
    }
  }

  const out: WaiterPins = {};
  for (const part of trimmed.split(/[;,]/g)) {
    const p = part.trim();
    if (!p) continue;
    const idx = p.indexOf("=") >= 0 ? p.indexOf("=") : p.indexOf(":");
    if (idx <= 0) continue;
    const code = p.slice(0, idx).trim();
    const pin = p.slice(idx + 1).trim();
    if (code && pin) out[code] = pin;
  }
  return out;
}

function getWaiterPins(): WaiterPins {
  if (waiterPinsCache) return waiterPinsCache;
  const raw = process.env.WAITER_PINS ?? "";
  waiterPinsCache = parseWaiterPins(raw);
  return waiterPinsCache;
}

function withToken(url: string, token: string | undefined) {
  if (!token) return url;
  try {
    const u = new URL(url);
    if (!u.searchParams.get("token")) u.searchParams.set("token", token);
    return u.toString();
  } catch {
    return url;
  }
}

async function readRecords(): Promise<PaymentRecord[]> {
  const url = process.env.GOOGLE_SHEETS_READ_URL;
  if (!url) return localRecords;

  const token = process.env.GOOGLE_SHEETS_TOKEN;
  const res = await fetch(withToken(url, token), {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Read failed (${res.status})`);
  const data = (await res.json()) as unknown;
  if (!Array.isArray(data)) throw new Error("Read payload must be an array");
  return data as PaymentRecord[];
}

async function appendRecord(rec: PaymentRecord) {
  const url = process.env.GOOGLE_SHEETS_APPEND_URL;
  if (!url) {
    localRecords = [rec, ...localRecords].slice(0, 5000);
    return;
  }

  const token = process.env.GOOGLE_SHEETS_TOKEN;
  const res = await fetch(withToken(url, token), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(rec),
  });
  if (!res.ok) throw new Error(`Append failed (${res.status})`);
}

function summarize(records: PaymentRecord[]) {
  const perGirl = new Map<string, number>();
  const perWaiter = new Map<string, number>();
  const perDay = new Map<string, number>();

  for (const r of records) {
    const amt = Number(r.amount ?? 0);
    perGirl.set(r.girlCode, (perGirl.get(r.girlCode) ?? 0) + amt);
    perWaiter.set(r.waiterCode, (perWaiter.get(r.waiterCode) ?? 0) + amt);
    const day = (r.createdAt ?? "").slice(0, 10);
    if (day) perDay.set(day, (perDay.get(day) ?? 0) + amt);
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

export async function GET() {
  try {
    const records = await readRecords();
    return NextResponse.json({ records, summary: summarize(records) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as
      | { girlCode?: unknown; waiterCode?: unknown; waiterPin?: unknown; amount?: unknown }
      | null;

    const girlCode = typeof body?.girlCode === "string" ? body.girlCode.trim() : "";
    const waiterCode = typeof body?.waiterCode === "string" ? body.waiterCode.trim() : "";
    const waiterPin = typeof body?.waiterPin === "string" ? body.waiterPin.trim() : "";
    const amount = typeof body?.amount === "number" ? body.amount : Number(body?.amount);

    if (!girlCode) return NextResponse.json({ error: "Missing girlCode" }, { status: 400 });
    if (!waiterCode) return NextResponse.json({ error: "Missing waiterCode" }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0)
      return NextResponse.json({ error: "Amount must be > 0" }, { status: 400 });

    const pins = getWaiterPins();
    if (Object.keys(pins).length > 0) {
      const expected = pins[waiterCode];
      if (!expected) return NextResponse.json({ error: "Invalid waiter code" }, { status: 403 });
      if (!waiterPin) return NextResponse.json({ error: "Missing waiter PIN" }, { status: 403 });
      if (waiterPin !== expected)
        return NextResponse.json({ error: "Incorrect waiter PIN" }, { status: 403 });
    }

    const rec: PaymentRecord = {
      girlCode,
      waiterCode,
      amount,
      createdAt: new Date().toISOString(),
    };

    await appendRecord(rec);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
