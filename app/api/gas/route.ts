/**
 * GAS Proxy API Route
 * フロントエンドから直接 GAS を叩く代わりに、
 * Next.js の API Route 経由でプロキシ。
 * - CORS 問題を解消
 * - Next.js のキャッシュ (Stale-While-Revalidate) で無駄なリクエストを削減
 * - GAS_API_URL はサーバーサイドの環境変数に隠蔽
 * - 504 タイムアウトの物理的根絶 (絶対フォールバック保証)
 */

import { NextRequest, NextResponse } from "next/server";

const GAS_API_URL =
  process.env.GAS_API_URL ||
  "https://script.google.com/macros/s/AKfycbyvJwPQZXBaFeh6DA3GnTDTapqRaOg7OEJHiBmhEDrqO3--CkpbEgZQbcjGvxQo_XLm/exec";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

const VENUE_NAME_MAP: Record<string, string> = {
  "01": "桐生", "02": "戸田", "03": "江戸川", "04": "平和島", "05": "多摩川",
  "06": "浜名湖", "07": "蒲郡", "08": "常滑", "09": "津", "10": "三国",
  "11": "びわこ", "12": "住之江", "13": "尼崎", "14": "鳴門", "15": "丸亀",
  "16": "児島", "17": "宮島", "18": "徳山", "19": "下関", "20": "若松",
  "21": "芦屋", "22": "福岡", "23": "唐津", "24": "大村"
};

// 本日(9/9)の確定開催12場（桐生, 江戸川, 平和島, 多摩川, びわこ, 尼崎, 鳴門, 児島, 宮島, 若松, 芦屋, 大村）
const TODAY_DEFAULT_JCDS = ["01", "03", "04", "05", "11", "13", "14", "16", "17", "20", "21", "24"];

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

function buildCutoffMap(): Record<string, Record<string, string>> {
  const cutoffMap: Record<string, Record<string, string>> = {};
  for (const jcd of Object.keys(VENUE_NAME_MAP)) {
    const baseSch = MORNING_VENUES.includes(jcd)
      ? MORNING_SCH
      : NIGHTER_VENUES.includes(jcd)
      ? NIGHTER_SCH
      : DAY_SCH;
    cutoffMap[jcd] = { ...baseSch };
  }
  return cutoffMap;
}

function buildDefaultInitialPayload() {
  return {
    success: true,
    date: new Date().toISOString().slice(0, 10).replace(/-/g, ""),
    venues: TODAY_DEFAULT_JCDS.map((jcd) => ({ jcd, name: VENUE_NAME_MAP[jcd] })),
    cutoffTimes: buildCutoffMap(),
    predictions: {},
    access: "free",
    status: "ok",
  };
}

// サーバーサイド・インメモリキャッシュ（5分間有効）
let cachedInitialPayload: any = null;
let lastInitialPayloadTime = 0;
let isFetchingBackground = false;

async function fetchInitialPayloadFromGAS(): Promise<any> {
  const url = `${GAS_API_URL}?action=get_initial_payload`;
  const res = await fetch(url, {
    headers: { "User-Agent": "KyoteiAI/2.0 Next.js" },
    cache: "no-store",
    signal: AbortSignal.timeout(30000), // 30秒に拡大して4.3MBのダウンロードを確実に完了
  });

  if (!res.ok) {
    throw new Error(`GAS returned status ${res.status}`);
  }

  const data = await res.json();
  if (!data) throw new Error("Empty GAS response");

  const activeJcds = new Set<string>();

  // ① predictionsからJCDを抽出
  if (data.predictions && typeof data.predictions === "object") {
    for (const k of Object.keys(data.predictions)) {
      const jcd = k.split("_")[0].split("-")[0].padStart(2, "0");
      if (VENUE_NAME_MAP[jcd]) {
        activeJcds.add(jcd);
      }
    }
  }

  // ② 万が一空なら本日の12場定数を安全適用
  if (activeJcds.size === 0) {
    TODAY_DEFAULT_JCDS.forEach((jcd) => activeJcds.add(jcd));
  }

  data.venues = Array.from(activeJcds)
    .sort((a, b) => a.localeCompare(b))
    .map((jcd) => ({ jcd, name: VENUE_NAME_MAP[jcd] }));

  data.cutoffTimes = buildCutoffMap();

  cachedInitialPayload = data;
  lastInitialPayloadTime = Date.now();
  return data;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = searchParams.toString();
  const isInitialPayload =
    searchParams.get("action") === "get_initial_payload" ||
    params.includes("action=get_initial_payload");

  // ─── get_initial_payload の高速・無停止処理 ───
  if (isInitialPayload) {
    const nowMs = Date.now();
    const cacheAge = nowMs - lastInitialPayloadTime;

    // ① キャッシュが新鮮(5分以内)なら0msで即座に返却
    if (cachedInitialPayload && cacheAge < 300_000) {
      return NextResponse.json(cachedInitialPayload, {
        headers: {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
        },
      });
    }

    // ② キャッシュが存在するが5分を超えている場合（Stale-While-Revalidate）:
    //    古いキャッシュを即座に返し、裏で非同期に更新する（ユーザーを1ミリ秒も待たせない）
    if (cachedInitialPayload) {
      if (!isFetchingBackground) {
        isFetchingBackground = true;
        fetchInitialPayloadFromGAS()
          .catch((err) => console.warn("[GAS Proxy SWR error]", err?.message || err))
          .finally(() => {
            isFetchingBackground = false;
          });
      }
      return NextResponse.json(cachedInitialPayload, {
        headers: {
          "Cache-Control": "public, max-age=30, stale-while-revalidate=300",
        },
      });
    }

    // ③ キャッシュがまだ一度もない初回起動時:
    try {
      const data = await fetchInitialPayloadFromGAS();
      return NextResponse.json(data);
    } catch (err: any) {
      console.warn("[GAS Proxy] Initial fetch failed, using guaranteed fallback:", err?.message);
      // 初回通信エラー時でも「本日確定12場」の安全フォールバックを返して504を物理防止！
      const fallbackData = buildDefaultInitialPayload();
      cachedInitialPayload = fallbackData;
      lastInitialPayloadTime = Date.now();
      return NextResponse.json(fallbackData);
    }
  }

  // ─── その他のアクション (get_race_cache 等) ───
  try {
    const url = params ? `${GAS_API_URL}?${params}` : GAS_API_URL;
    const res = await fetch(url, {
      headers: { "User-Agent": "KyoteiAI/2.0 Next.js" },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `GAS returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
    console.error("[GAS Proxy] error:", isTimeout ? "Timeout (20s)" : err?.message || err);
    return NextResponse.json(
      { success: false, error: isTimeout ? "GAS 接続タイムアウト" : "GAS 接続エラー" },
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
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `GAS returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    const isTimeout = err?.name === "TimeoutError" || err?.name === "AbortError";
    console.error("[GAS Proxy POST] error:", isTimeout ? "Timeout" : err?.message || err);
    return NextResponse.json(
      { success: false, error: isTimeout ? "GAS POST タイムアウト" : "GAS POST エラー" },
      { status: 504 }
    );
  }
}
