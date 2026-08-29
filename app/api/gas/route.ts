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

    // get_initial_payload で venues または cutoffTimes を確実に合成して返す
    const isInitialPayload = searchParams.get("action") === "get_initial_payload" || params.includes("action=get_initial_payload");
    if (isInitialPayload && data) {
      try {
        const VENUE_NAME_MAP: Record<string, string> = {
          "01": "桐生", "02": "戸田", "03": "江戸川", "04": "平和島", "05": "多摩川",
          "06": "浜名湖", "07": "蒲郡", "08": "常滑", "09": "津", "10": "三国",
          "11": "びわこ", "12": "住之江", "13": "尼崎", "14": "鳴門", "15": "丸亀",
          "16": "児島", "17": "宮島", "18": "徳山", "19": "下関", "20": "若松",
          "21": "芦屋", "22": "福岡", "23": "唐津", "24": "大村"
        };

        const MORNING_VENUES = ["10", "14", "18", "21", "23"];
        const NIGHTER_VENUES = ["01", "07", "12", "15", "19", "20", "24"];
        const MORNING_SCH: Record<string, string> = {
          "1": "08:35", "2": "09:00", "3": "09:25", "4": "09:50", "5": "10:18", "6": "10:50",
          "7": "11:20", "8": "11:52", "9": "12:27", "10": "13:00", "11": "13:35", "12": "14:15"
        };
        const DAY_SCH: Record<string, string> = {
          "1": "10:45", "2": "11:10", "3": "11:35", "4": "12:05", "5": "12:35", "6": "13:05",
          "7": "13:40", "8": "14:15", "9": "14:50", "10": "15:25", "11": "16:05", "12": "16:45"
        };
        const NIGHTER_SCH: Record<string, string> = {
          "1": "15:15", "2": "15:40", "3": "16:05", "4": "16:30", "5": "17:00", "6": "17:30",
          "7": "18:00", "8": "18:30", "9": "19:00", "10": "19:35", "11": "20:10", "12": "20:45"
        };

        const now = new Date();
        const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
        const y = jst.getUTCFullYear();
        const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
        const d = String(jst.getUTCDate()).padStart(2, "0");
        const dateStr = `${y}${m}${d}`;

        const predRes = await fetch(
          `${GAS_API_URL}?action=get_predictions_only&pass=BATCH_INTERNAL_ACCESS_2026&date=${dateStr}`,
          { cache: "no-store", signal: AbortSignal.timeout(5000) }
        );

        const activeJcds = new Set<string>();
        if (predRes.ok) {
          const predJson = await predRes.json();
          if (predJson && predJson.predictions) {
            data.predictions = predJson.predictions;
            for (const k of Object.keys(predJson.predictions)) {
              const jcd = k.split("_")[0].split("-")[0].padStart(2, "0");
              if (VENUE_NAME_MAP[jcd]) {
                activeJcds.add(jcd);
              }
            }
          }
        }

        // 開催場リストの作成
        data.venues = Array.from(activeJcds)
          .sort((a, b) => a.localeCompare(b))
          .map((jcd) => ({ jcd, name: VENUE_NAME_MAP[jcd] }));

        // 全24場の種別別締切時間マップを構築
        const cutoffMap: Record<string, Record<string, string>> = {};
        for (const jcd of Object.keys(VENUE_NAME_MAP)) {
          const baseSch = MORNING_VENUES.includes(jcd)
            ? MORNING_SCH
            : NIGHTER_VENUES.includes(jcd)
            ? NIGHTER_SCH
            : DAY_SCH;
          cutoffMap[jcd] = { ...baseSch };
        }
        data.cutoffTimes = cutoffMap;
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
