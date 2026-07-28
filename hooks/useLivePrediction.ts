"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    return res.json();
  });

/**
 * GAS action=get_race_cache を呼び出してレース予測データを取得
 * - jcd: 場コード (01-24)
 * - rno: レース番号 (1-12)
 */
export function useLivePrediction(jcd: string, rno: number) {
  const key =
    jcd && rno
      ? `/api/gas?action=get_race_cache&jcd=${jcd.padStart(2, "0")}&rno=${rno}`
      : null;

  const { data: raw, error, isLoading, mutate } = useSWR<{
    success: boolean;
    cache?: Record<string, unknown>;
    has_phase1?: boolean;
    has_phase2?: boolean;
  }>(key, fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
    dedupingInterval: 10_000,
  });

  // GAS の cache フィールドを PredictionData 形式に変換
  const data = raw?.success && raw.cache ? mapGasCache(raw.cache, raw) : null;

  return {
    data,
    loading: isLoading,
    error: error ? "データ取得に失敗しました" : null,
    refresh: () => mutate(),
  };
}

/**
 * GAS action=get_initial_payload でダッシュボード初期データを取得
 * email + licenseKey をクエリに付けてアクセス権も確認
 */
export function useAllPredictions(email?: string, licenseKey?: string) {
  const authParams = email && licenseKey
    ? `&email=${encodeURIComponent(email)}&pass=${encodeURIComponent(licenseKey)}`
    : "";

  const { data: raw, error, isLoading, mutate } = useSWR<{
    success?: boolean;
    access?: string;
    schedules?: Record<string, unknown>[];
    active_jcds?: string[];
    today_predictions?: Record<string, unknown>;
  }>(
    `/api/gas?action=get_initial_payload${authParams}`,
    fetcher,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: true,
      dedupingInterval: 20_000,
    }
  );

  // active な場コードを抽出
  const activeVenues: string[] = raw?.active_jcds ?? [];

  // 予測データマップ: { "14_1": { phase: 1 or 2 }, ... }
  const predictions: Record<string, { phase: number }> = {};
  if (raw?.today_predictions) {
    Object.entries(raw.today_predictions).forEach(([key, val]) => {
      const v = val as Record<string, unknown>;
      const hasPhase2 = !!(v.second_prediction || v.exhibition_completed || v.live_predict);
      predictions[key] = { phase: hasPhase2 ? 2 : v.ai || v.first_prediction ? 1 : 0 };
    });
  }

  return {
    predictions,
    activeVenues,
    loading: isLoading,
    error: error ? null : null, // GAS エラーはサイレント（全場グレー表示）
    refresh: () => mutate(),
  };
}

// ─── GAS キャッシュを表示用データに変換 ─────────────────
function mapGasCache(
  cache: Record<string, unknown>,
  meta: { has_phase1?: boolean; has_phase2?: boolean }
) {
  const phase = meta.has_phase2 ? 2 : meta.has_phase1 ? 1 : 0;
  const fp = (cache.first_prediction || cache.ai || {}) as Record<string, unknown>;
  const sp = (cache.second_prediction || {}) as Record<string, unknown>;
  const active = meta.has_phase2 ? sp : fp;

  // 選手データ
  const racers = Array.isArray(cache.racers)
    ? (cache.racers as Record<string, unknown>[])
    : [];

  return {
    phase,
    ai: {
      escape_rate: (active.escape_rate ?? fp.escape_rate ?? null) as string | null,
      confidence: (active.confidence ?? fp.confidence ?? null) as string | null,
      solid_focus: (active.solid_focus ?? fp.solid_focus ?? []) as string[],
      upset_focus: (active.upset_focus ?? fp.upset_focus ?? []) as string[],
      comment: (active.comment ?? active.ai_comment ?? fp.comment ?? "") as string,
      recommendation_reason: (active.recommendation_reason ?? "") as string,
      ev_details: (active.ev_details ?? {}) as Record<string, number>,
    },
    data: racers.map((r) => ({
      lane: r.lane as number,
      name: r.name as string,
      cls: r.cls as string,
      rate: r.rate as string,
      motor_rate: r.motor_rate as string,
      ex_time: r.ex_time as string,
      st_val: r.st_val as string,
      score_grade: (r.score_grade as "S" | "A" | "B" | "C" | "D" | undefined),
    })),
    weather: (cache.weather ?? null) as {
      weather: string; temp: string; wind_speed: string;
      wind_dir_name: string; water_temp: string; wave_height: string;
    } | null,
    result: (cache.result ?? null) as {
      is_hit: boolean; combo: string;
    } | null,
  };
}
