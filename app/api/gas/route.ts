/**
 * GAS Proxy API Route
 * フロントエンドから直接 GAS を叩く代わりに、
 * Next.js の API Route 経由でプロキシ。
 * - CORS 問題を解消
 * - Next.js のキャッシュ (Stale-While-Revalidate) で無駄なリクエストを削減
 * - GAS_API_URL はサーバーサイドの環境変数に隠蔽
 * - 504 タイムアウトの物理的根絶 (get_initial_payload / get_race_cache 双方のインメモリ即応保証)
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

// レース別キャッシュ
const raceCacheMap = new Map<string, { data: any; time: number }>();

// 全レーサースコアキャッシュ（predictionsのracer_scoresから自動構築）
let cachedRacerScores: any = null;
let lastRacerScoresTime = 0;

/**
 * cachedInitialPayload の predictions.*.racer_scores から全レーサースコアを集約してキャッシュする
 * GASへの外部通信を完全に排除し、インメモリで即応（0ms）
 */
function buildRacerScoresFromPredictions(): Record<string, any> {
  const scores: Record<string, any> = {};
  if (!cachedInitialPayload?.predictions) return scores;
  for (const pred of Object.values(cachedInitialPayload.predictions) as any[]) {
    // racer_scores: オブジェクト形式 {regNo: {...}} または 配列形式 [{reg_no, score, components}]
    const rs = pred?.racer_scores;
    if (Array.isArray(rs)) {
      // 配列形式の場合: data配列と紐付けてregNoを取得
      const racerData = pred?.data;
      if (Array.isArray(racerData)) {
        for (const rsItem of rs) {
          const lane = rsItem?.lane || rsItem?.course_num;
          const racer = racerData.find((r: any) => Number(r?.lane) === Number(lane));
          const reg = String(racer?.regNo || racer?.toban || rsItem?.reg_no || "").trim();
          if (reg && !scores[reg] && racer) {
            const comps = rsItem?.components || {};
            const st = racer?.stats || {};
            scores[reg] = {
              name: racer?.name || "",
              cls: racer?.cls || "",
              win: Math.round((parseFloat(String(comps.rate || racer?.rate || "0")) || 0) * 10),
              start: Math.round((parseFloat(String(comps.smoothed_win_rate || "0")) || 0) * 100),
              escape: Math.round((parseFloat(String(comps.smoothed_3ren || "0")) || 0) * 100),
              turn: 0,
              maint: Math.round((parseFloat(String(comps.motor_rate || racer?.motor_rate || "0")) || 0) * 10),
              safety: Math.round((parseFloat(String(comps.venue_win_rate || "0")) || 0) * 10),
              clsSc: rsItem?.score || 0,
              period: st?.period || "",
            };
          }
        }
      }
    } else if (rs && typeof rs === "object") {
      // オブジェクト形式の場合: {regNo: {...}}
      for (const [regNo, val] of Object.entries(rs)) {
        if (regNo && !scores[regNo]) {
          scores[regNo] = val;
        }
      }
    }
    // data配列から基本情報を補完（まだscoresに登録されていない場合）
    const racers = pred?.data;
    if (Array.isArray(racers)) {
      for (const r of racers) {
        const reg = String(r?.regNo || r?.toban || "").trim();
        if (reg && !scores[reg]) {
          const st = r?.stats || {};
          scores[reg] = {
            name: r?.name || "",
            cls: r?.cls || "",
            win: Math.round((parseFloat(String(st.venue_win_rate || st.win_rate || r?.rate || "0")) || 0) * 10),
            start: 0,
            escape: 0,
            turn: 0,
            maint: Math.round((parseFloat(String(r?.motor_rate || "0")) || 0) * 10),
            safety: 0,
            clsSc: 0,
            period: st?.period || "",
          };
        }
      }
    }
  }
  return scores;
}


async function fetchInitialPayloadFromGAS(): Promise<any> {
  const url = `${GAS_API_URL}?action=get_initial_payload`;
  const res = await fetch(url, {
    headers: { "User-Agent": "KyoteiAI/2.0 Next.js" },
    cache: "no-store",
    signal: AbortSignal.timeout(35000), // GASは27秒かかるため余裕を持って35秒
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

  // predictions が空の場合はキャッシュに保存しない（フォールバックデータを誤キャッシュ防止）
  const predsCount = Object.keys(data.predictions || {}).length;
  if (predsCount > 0) {
    cachedInitialPayload = data;
    lastInitialPayloadTime = Date.now();
    // レーサースコアのキャッシュもリセット（本日データに基づき再構築させる）
    cachedRacerScores = null;
    lastRacerScoresTime = 0;
    raceCacheMap.clear();
  } else {
    console.warn("[GAS Proxy] Fetched data has empty predictions, NOT caching to avoid stale data");
  }
  return data;
}

/** 日付変わり検知: JSTの今日の日付と cachedInitialPayload の date を比較して古ければキャッシュ無効化 */
function invalidateCacheIfDateChanged(): void {
  if (!cachedInitialPayload) return;
  const nowJST = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const todayStr = nowJST.toISOString().slice(0, 10).replace(/-/g, "");
  const cachedDate = String(cachedInitialPayload.date || "");
  if (cachedDate && cachedDate !== todayStr) {
    console.log(`[GAS Proxy] Date changed: cache=${cachedDate}, today=${todayStr}. Clearing all caches.`);
    cachedInitialPayload = null;
    lastInitialPayloadTime = 0;
    cachedRacerScores = null;
    lastRacerScoresTime = 0;
    raceCacheMap.clear();
  }
}


/** レース締切予定時刻のタイムスタンプ（ミリ秒）を取得 */
function getRaceCutoffTimestamp(jcdPad: string, rno: number): number | null {
  try {
    const jcdNum = String(parseInt(jcdPad, 10)).padStart(2, "0");
    const cutoffMap = cachedInitialPayload?.cutoffTimes || buildCutoffMap();
    const timeStr = cutoffMap?.[jcdNum]?.[String(rno)] || cutoffMap?.[String(parseInt(jcdNum, 10))]?.[String(rno)];
    if (!timeStr) return null;

    const [hours, minutes] = timeStr.split(":").map((v: string) => parseInt(v, 10));
    if (isNaN(hours) || isNaN(minutes)) return null;

    const now = new Date();
    // JST現在時刻
    const jstNow = new Date(now.getTime() + (now.getTimezoneOffset() + 540) * 60000);
    const targetJST = new Date(jstNow);
    targetJST.setHours(hours, minutes, 0, 0);

    // JSTタイムスタンプをエポックミリ秒に換算
    return now.getTime() + (targetJST.getTime() - jstNow.getTime());
  } catch {
    return null;
  }
}

/**
 * 競艇データライフサイクルに応じた動的キャッシュTTL（ミリ秒）
 * - 終了・確定レース: 24時間（永久）
 * - 直前ゾーン (締切30分前〜締切後10分):
 *     - 展示前: 6秒 (展示航走確定を即検知)
 *     - 展示後: 15秒 (最新オッズ・EV・直前気象を追従)
 * - 待機レース (30分以上先): 300秒 (5分)
 */
function getDynamicTTL(raceCache: any, cutoffTs: number | null): number {
  if (raceCache?.result || raceCache?.review) {
    return 86400_000; // 結果確定後は24時間
  }
  if (!cutoffTs) return 60_000;

  const now = Date.now();
  const diffMinutes = (cutoffTs - now) / 60000;

  // 直前勝負ゾーン（締切30分前 〜 締切後10分）
  if (diffMinutes <= 30 && diffMinutes >= -10) {
    const isExCompleted = Boolean(
      raceCache?.exhibition_completed ||
      (raceCache?.second_prediction && Object.keys(raceCache.second_prediction).length > 0)
    );
    // 展示前は6秒ごとに監視、展示確定後は15秒でリアルタイム追従
    return isExCompleted ? 15_000 : 6_000;
  }

  // レース終了から10分以上経過し結果待ちの場合: 15秒
  if (diffMinutes < -10) {
    return 15_000;
  }

  // 30分以上先の待機レース: 5分
  return 300_000;
}

/**
 * メモリ上の静的データ（出走表・一次予想・能力評価）と、
 * GASからリアルタイム取得した動的データ（二次予想・気象・展示・オッズ）を安全マージ
 */
function mergeRaceData(basePred: any, liveCache: any): any {
  if (!liveCache) return basePred || {};
  if (!basePred) return liveCache;

  return {
    ...basePred,
    ...liveCache,
    // 出走表: 静的マスタ情報（選手名・級別・勝率等）を保持しつつ、展示タイム・チルト等を上書き
    data: Array.isArray(liveCache.data) && liveCache.data.length > 0
      ? liveCache.data.map((liveR: any) => {
          const baseR = Array.isArray(basePred.data)
            ? basePred.data.find((b: any) => Number(b.lane) === Number(liveR.lane))
            : null;
          return {
            ...(baseR || {}),
            ...liveR,
            stats: { ...(baseR?.stats || {}), ...(liveR?.stats || {}) },
          };
        })
      : basePred.data,
    // 気象データ: リアルタイムを最優先
    weather: liveCache.weather || basePred.weather || null,
    // 展示確定フラグ
    exhibition_completed: liveCache.exhibition_completed ?? basePred.exhibition_completed ?? false,
    // 一次予想（メモリベース保持）
    first_prediction: liveCache.first_prediction || basePred.first_prediction || null,
    // 二次予想（リアルタイム取得優先）
    second_prediction: liveCache.second_prediction || basePred.second_prediction || null,
    // 直前AI解析・買い目
    ai: liveCache.ai || basePred.ai || null,
    predictions: (Array.isArray(liveCache.predictions) && liveCache.predictions.length > 0)
      ? liveCache.predictions
      : basePred.predictions || [],
    // レース結果
    result: liveCache.result || liveCache.review || basePred.result || null,
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params = searchParams.toString();
  const action = searchParams.get("action");

  // 日付変わり自動検知: JST 0時をまたいだらキャッシュを全クリア（昨日データの汚染防止）
  invalidateCacheIfDateChanged();

  // ─── 1. get_race_cache のハイブリッド解決（一次予想=メモリ / 二次予想・気象=リアルタイム） ───
  if (action === "get_race_cache") {
    const rawJcd = searchParams.get("jcd") || "";
    const jcdNum = parseInt(rawJcd, 10) || 0;
    const jcdPad = String(jcdNum).padStart(2, "0");
    const rno = parseInt(searchParams.get("rno") || "0", 10);
    const raceKey = `${jcdPad}_${rno}`;

    // ① メモリの初期ペイロードから静的ベースデータ（出走表・一次予想）を取得
    let basePred: any = null;
    if (cachedInitialPayload?.predictions) {
      const preds = cachedInitialPayload.predictions;
      basePred =
        preds[`${jcdPad}_${rno}`] ||
        preds[`${jcdNum}_${rno}`] ||
        preds[`${jcdPad}-${rno}`] ||
        preds[`${jcdNum}-${rno}`] ||
        null;
    }

    // 締切時刻と現在時刻の差分を算出
    const cutoffTs = getRaceCutoffTimestamp(jcdPad, rno);
    const diffMinutes = cutoffTs ? (cutoffTs - Date.now()) / 60000 : 999;

    // ② キャッシュチェック（動的TTL判定）
    const cachedItem = raceCacheMap.get(raceKey);
    const currentData = cachedItem?.data?.cache || basePred;
    const ttl = getDynamicTTL(currentData, cutoffTs);

    if (cachedItem && Date.now() - cachedItem.time < ttl) {
      // キャッシュが有効期間内なら即返却
      return NextResponse.json(cachedItem.data, {
        headers: { "Cache-Control": `public, max-age=${Math.round(ttl / 1000)}` },
      });
    }

    // ③ 30分以上先の待機レース: 二次予想・気象はまだ出ないためメモリの一次予想を即返却 (GAS通信ゼロ)
    if (diffMinutes > 30 && basePred) {
      const hasPhase1 = !!(
        basePred.ai ||
        (basePred.predictions && basePred.predictions.length > 0) ||
        basePred.first_prediction
      );
      const resPayload = {
        success: true,
        cache: basePred,
        has_phase1: hasPhase1,
        has_phase2: false,
      };
      raceCacheMap.set(raceKey, { data: resPayload, time: Date.now() });
      return NextResponse.json(resPayload, {
        headers: { "Cache-Control": "public, max-age=60" },
      });
    }

    // ④ 直前勝負ゾーン（締切30分前〜）または 未取得レース: GASからリアルタイム（二次予想・気象・展示）を取得
    try {
      const url = `${GAS_API_URL}?${params}`;
      const res = await fetch(url, {
        headers: { "User-Agent": "KyoteiAI/2.0 Next.js" },
        cache: "no-store",
        signal: AbortSignal.timeout(8000), // 直前軽量フェッチ: 8秒
      });
      if (res.ok) {
        const gasJson = await res.json();
        if (gasJson?.success && gasJson.cache) {
          // メモリの静的ベースとGASのリアルタイム動的データをマージ
          const mergedCache = mergeRaceData(basePred, gasJson.cache);
          const hasPhase1 = !!(
            mergedCache.ai ||
            (mergedCache.predictions && mergedCache.predictions.length > 0) ||
            mergedCache.first_prediction
          );
          const hasValidSecond =
            mergedCache.second_prediction && Object.keys(mergedCache.second_prediction).length > 0;
          const hasPhase2 = !!(
            mergedCache.exhibition_completed === true ||
            mergedCache.live_predict === true ||
            hasValidSecond
          );

          const livePayload = {
            success: true,
            cache: mergedCache,
            has_phase1: hasPhase1,
            has_phase2: hasPhase2,
          };
          raceCacheMap.set(raceKey, { data: livePayload, time: Date.now() });
          return NextResponse.json(livePayload, {
            headers: {
              "Cache-Control": hasPhase2 ? "public, max-age=15" : "public, max-age=5",
            },
          });
        }
      }
    } catch (err: any) {
      console.warn(`[GAS Proxy get_race_cache] Real-time fetch timed out for ${raceKey}:`, err?.message);
    }

    // ⑤ GASが遅延・エラーの場合: メモリの静的データ＋一次予想で安全フォールバック（画面白落ち完全防止）
    if (basePred) {
      const hasPhase1 = !!(
        basePred.ai ||
        (basePred.predictions && basePred.predictions.length > 0) ||
        basePred.first_prediction
      );
      const fallbackPayload = {
        success: true,
        cache: basePred,
        has_phase1: hasPhase1,
        has_phase2: false,
      };
      // 直前ゾーンなら次回すぐに再試行できるようTTLを5秒に設定
      raceCacheMap.set(raceKey, { data: fallbackPayload, time: Date.now() - (ttl - 5000) });
      return NextResponse.json(fallbackPayload);
    }

    // ⑥ 完全にデータがない場合の最小限フォールバック
    const safeFallback = {
      success: true,
      cache: {
        success: true,
        data: [],
        predictions: [],
        ai: null,
        confidence: null,
        exhibition_completed: false,
      },
      has_phase1: false,
      has_phase2: false,
    };
    return NextResponse.json(safeFallback);
  }


  // ─── 2. get_racer_score_cache のインメモリ0ms即応 ───
  if (action === "get_racer_score_cache") {
    // ① 5分以内のキャッシュがあれば即座に返却
    if (cachedRacerScores && Date.now() - lastRacerScoresTime < 300_000) {
      return NextResponse.json(cachedRacerScores, {
        headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
      });
    }
    // ② predictionsから全レーサースコアを集約（GAS通信ゼロ）
    const scores = buildRacerScoresFromPredictions();
    const racerScoresPayload = {
      success: true,
      scores,
      updated_at: new Date().toISOString(),
    };
    cachedRacerScores = racerScoresPayload;
    lastRacerScoresTime = Date.now();
    return NextResponse.json(racerScoresPayload, {
      headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" },
    });
  }

  // ─── 3. get_initial_payload の高速・無停止処理 ───
  const isInitialPayload =
    action === "get_initial_payload" || params.includes("action=get_initial_payload");

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
      const fallbackData = buildDefaultInitialPayload();
      cachedInitialPayload = fallbackData;
      lastInitialPayloadTime = Date.now();
      return NextResponse.json(fallbackData);
    }
  }

  // ─── 3. その他のアクション ───
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
