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

    // get_initial_payload で venues または cutoffTimes が空の場合の防御的自動補完
    if (params.includes("action=get_initial_payload") && data && (!data.venues || data.venues.length === 0)) {
      try {
        const now = new Date();
        const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        const y = jst.getUTCFullYear();
        const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
        const d = String(jst.getUTCDate()).padStart(2, "0");
        const dateStr = `${y}${m}${d}`;

        const predRes = await fetch(
          `${GAS_API_URL}?action=get_predictions_only&pass=BATCH_INTERNAL_ACCESS_2026&date=${dateStr}`,
          { cache: "no-store", signal: AbortSignal.timeout(4000) }
        );

        if (predRes.ok) {
          const predJson = await predRes.json();
          if (predJson && predJson.predictions) {
            const venueSet = new Map<string, string>();
            const cutoffMap: Record<string, Record<string, string>> = {};

            const VENUE_NAME_MAP: Record<string, string> = {
              "01": "桐生", "02": "戸田", "03": "江戸川", "04": "平和島", "05": "多摩川",
              "06": "浜名湖", "07": "蒲郡", "08": "常滑", "09": "津", "10": "三国",
              "11": "びわこ", "12": "住之江", "13": "尼崎", "14": "鳴門", "15": "丸亀",
              "16": "児島", "17": "宮島", "18": "徳山", "19": "下関", "20": "若松",
              "21": "芦屋", "22": "福岡", "23": "唐津", "24": "大村"
            };

            for (const [k, p] of Object.entries(predJson.predictions as Record<string, any>)) {
              const jcd = String(p.jcd || k.split("-")[0] || k.split("_")[0]).padStart(2, "0");
              const rno = String(p.rno || (k.includes("-") ? k.split("-")[1] : k.includes("_") ? k.split("_")[1] : "1"));
              const vname = p.venue_name || VENUE_NAME_MAP[jcd] || `場${jcd}`;
              venueSet.set(jcd, vname);

              if (!cutoffMap[jcd]) cutoffMap[jcd] = {};
              const cutoff = p.deadline || p.deadline_time || p.cutoff_str || "";
              if (cutoff) cutoffMap[jcd][rno] = cutoff;
            }

            data.venues = Array.from(venueSet.entries())
              .sort((a, b) => a[0].localeCompare(b[0]))
              .map(([jcd, name]) => ({ jcd, name }));

            data.cutoffTimes = cutoffMap;
            data.predictions = predJson.predictions;
          }
        }
      } catch (_) {}
    }

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
