import { NextResponse } from "next/server";

export const runtime = "edge";

type PaymentRecord = {
  girlCode: string;
  waiterCode: string;
  amount: number;
  createdAt: string;
};

let localRecords: PaymentRecord[] = [];

async function readRecords(): Promise<PaymentRecord[]> {
  const url = process.env.GOOGLE_SHEETS_READ_URL;
  if (!url) return localRecords;

  const token = process.env.GOOGLE_SHEETS_TOKEN;
  const res = await fetch(url, {
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
  const res = await fetch(url, {
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
      | { girlCode?: unknown; waiterCode?: unknown; amount?: unknown }
      | null;

    const girlCode = typeof body?.girlCode === "string" ? body.girlCode.trim() : "";
    const waiterCode = typeof body?.waiterCode === "string" ? body.waiterCode.trim() : "";
    const amount = typeof body?.amount === "number" ? body.amount : Number(body?.amount);

    if (!girlCode) return NextResponse.json({ error: "Missing girlCode" }, { status: 400 });
    if (!waiterCode) return NextResponse.json({ error: "Missing waiterCode" }, { status: 400 });
    if (!Number.isFinite(amount) || amount <= 0)
      return NextResponse.json({ error: "Amount must be > 0" }, { status: 400 });

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
