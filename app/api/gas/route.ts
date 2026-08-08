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
  const action = searchParams.get("action");

  const params = searchParams.toString();

  try {
    const url = params ? `${GAS_API_URL}?${params}` : GAS_API_URL;
    const res = await fetch(url, {
      headers: { "User-Agent": "KyoteiAI/2.0 Next.js" },
      cache: "no-store",
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
  } catch (err) {
    console.error("[GAS Proxy] fetch error:", err);
    return NextResponse.json(
      { success: false, error: "GAS接続エラー" },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GAS Proxy POST] error:", err);
    return NextResponse.json(
      { success: false, error: "GAS POST エラー" },
      { status: 503 }
    );
  }
}
