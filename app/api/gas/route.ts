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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  // 【ユーザー指示】オリ展フロントエンド検証用テストデータ返却モード
  if (action === "get_race_cache" || searchParams.has("jcd")) {
    const testRacers = [
      { lane: 1, name: "毒島 誠", cls: "A1", regNo: 4238, st_val: "12", ex_time: "6.72", loop_time: "36.85", turn_time: "5.12", straight_time: "7.45", stats: { course_top2_rate: 82.5, venue_win_rate: 65.4, course_st_rank: 1.8 } },
      { lane: 2, name: "池田 浩二", cls: "A1", regNo: 3941, st_val: "14", ex_time: "6.75", loop_time: "36.92", turn_time: "5.18", straight_time: "7.48", stats: { course_top2_rate: 75.0, venue_win_rate: 58.2, course_st_rank: 2.1 } },
      { lane: 3, name: "峰 竜太", cls: "A1", regNo: 4320, st_val: "11", ex_time: "6.69", loop_time: "36.78", turn_time: "5.08", straight_time: "7.41", stats: { course_top2_rate: 88.0, venue_win_rate: 72.1, course_st_rank: 1.5 } },
      { lane: 4, name: "茅原 悠紀", cls: "A1", regNo: 4418, st_val: "15", ex_time: "6.78", loop_time: "37.01", turn_time: "5.22", straight_time: "7.52", stats: { course_top2_rate: 62.0, venue_win_rate: 51.0, course_st_rank: 2.8 } },
      { lane: 5, name: "馬場 貴也", cls: "A1", regNo: 4266, st_val: "13", ex_time: "6.71", loop_time: "36.88", turn_time: "5.10", straight_time: "7.43", stats: { course_top2_rate: 70.5, venue_win_rate: 60.3, course_st_rank: 2.0 } },
      { lane: 6, name: "白井 英治", cls: "A1", regNo: 3897, st_val: "16", ex_time: "6.80", loop_time: "37.08", turn_time: "5.25", straight_time: "7.55", stats: { course_top2_rate: 55.0, venue_win_rate: 48.9, course_st_rank: 3.2 } }
    ];

    return NextResponse.json({
      success: true,
      has_phase1: true,
      has_phase2: true,
      cache: {
        phase: 2,
        first_prediction: {
          ai: { confidence: "S", escape_rate: 78.5 },
          data: testRacers,
          racers: testRacers
        },
        second_prediction: {
          ai: { confidence: "S", escape_rate: 78.5 },
          data: testRacers,
          racers: testRacers
        },
        ai: { confidence: "S", escape_rate: 78.5 },
        data: testRacers,
        racers: testRacers
      }
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
      }
    });
  }

  const params = searchParams.toString();

  try {
    const url = params ? `${GAS_API_URL}?${params}` : GAS_API_URL;
    const res = await fetch(url, {
      headers: { "User-Agent": "KyoteiAI/2.0 Next.js" },
      // Next.js のデータキャッシュ: 30秒間は再フェッチしない
      next: { revalidate: 30 },
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
        // ブラウザキャッシュ: 20秒
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=30",
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
