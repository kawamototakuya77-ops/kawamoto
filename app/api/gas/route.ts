/**
 * GAS Proxy API Route
 * フロントエンドから直接 GAS を叩く代わりに、
 * Next.js の API Route 経由でプロキシ。
 * - CORS 問題を解消
 * - Next.js のキャッシュ (revalidate) で無駄なリクエストを削減
 * - GAS_API_URL はサーバーサイドの環境変数に隠蔽
 */

import { NextRequest, NextResponse } from "next/server";

const GAS_API_URL =
  process.env.GAS_API_URL ||
  "https://script.google.com/macros/s/AKfycbyvJwPQZXBaFeh6DA3GnTDTapqRaOg7OEJHiBmhEDrqO3--CkpbEgZQbcjGvxQo_XLm/exec";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = searchParams.toString();

  try {
    const url = params ? `${GAS_API_URL}?${params}` : GAS_API_URL;
    const res = await fetch(url, {
      headers: { "User-Agent": "KyoteiAI/2.0 Next.js" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `GAS returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (err: any) {
    const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
    console.error("[GAS Proxy] fetch error:", isTimeout ? "Timeout (10s)" : err?.message || err);
    return NextResponse.json(
      { success: false, error: isTimeout ? "GAS 接続タイムアウト (10秒)" : "GAS 接続エラー" },
      { status: 504 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let body = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const res = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `GAS returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    // Ensure data schema defensive defaults
    if (data && data.racers) {
      data.racers = data.racers.map((r: any, idx: number) => ({
        lane: r.lane || idx + 1,
        racer_name: r.racer_name || r.name || `選手${idx + 1}`,
        st_val: r.st_val || r.st || "--",
        ex_time: r.ex_time || r.ex || "--",
        score: r.score ?? 50,
        eval_rank: r.eval_rank || r.grade || "B",
        ev_score: r.ev_score || r.ev || 1.0,
        comment: r.comment || "",
        ...r
      }));
    }
    return NextResponse.json(data);
  } catch (err: any) {
    const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
    console.error("[GAS Proxy POST] error:", isTimeout ? "Timeout (10s)" : err?.message || err);
    return NextResponse.json(
      { success: false, error: isTimeout ? "GAS POST タイムアウト (10秒)" : "GAS POST エラー" },
      { status: 504 }
    );
  }
}
