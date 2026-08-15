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
    refreshInterval: 10_000,
    revalidateOnFocus: true,
    dedupingInterval: 2_000,
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
    venues?: { jcd: string; name: string }[];
    cutoffTimes?: Record<string, Record<string, string>>;
    predictions?: Record<string, Record<string, unknown>>;
  }>(
    `/api/gas?action=get_initial_payload${authParams}`,
    fetcher,
    {
      refreshInterval: 60_000,
      revalidateOnFocus: true,
      dedupingInterval: 20_000,
    }
  );

  // GAS が返す venues: [{ jcd: "14", name: "鳴門" }] → jcd 配列に変換
  const activeVenues: string[] = (raw?.venues ?? []).map((v) => v.jcd);

  // GAS が返す predictions: { "14_1": {...} } → phase 情報に変換
  const predictions: Record<string, { phase: number }> = {};
  if (raw?.predictions) {
    Object.entries(raw.predictions).forEach(([key, val]) => {
      const v = val as Record<string, unknown>;
      const hasPhase2 = !!(v.exhibition_completed || v.second_prediction);
      const hasPhase1 = !!(v.first_prediction || v.ai || v.predictions);
      predictions[key] = { phase: hasPhase2 ? 2 : hasPhase1 ? 1 : 0 };
    });
  }

  const cutoffTimes = raw?.cutoffTimes ?? {};

  return {
    predictions,
    activeVenues,
    cutoffTimes,
    loading: isLoading,
    error: error ? null : null,
    refresh: () => mutate(),
  };
}

// ─── GAS キャッシュを表示用データに変換 ─────────────────
function mapGasCache(
  cache: Record<string, unknown>,
  meta: { has_phase1?: boolean; has_phase2?: boolean }
) {
  const phase = meta.has_phase2 ? 2 : meta.has_phase1 ? 1 : 0;

  // GAS は first_prediction / second_prediction の中に ai が入っている
  const fp = (cache.first_prediction ?? {}) as Record<string, unknown>;
  const sp = (cache.second_prediction ?? {}) as Record<string, unknown>;
  const active = meta.has_phase2 ? sp : fp;
  // ai はトップレベルか active の中
  const ai = (cache.ai ?? active.ai ?? fp.ai ?? {}) as Record<string, unknown>;

  // 選手データ: GAS は cache.data または cache.racers
  const racerArray = Array.isArray(cache.data)
    ? (cache.data as Record<string, unknown>[])
    : Array.isArray(cache.racers)
    ? (cache.racers as Record<string, unknown>[])
    : [];

  const beforeRacers = ((cache.before_data as any)?.racers ?? {}) as Record<string, any>;

  return {
    phase,
    ai: {
      escape_rate: (ai.escape_rate ?? active.escape_rate ?? fp.escape_rate ?? null) as string | null,
      confidence: (active.confidence ?? ai.confidence ?? null) as string | null,
      solid_focus: ((ai.solid_focus ?? active.solid_focus ?? ai.focus ?? []) as string[]),
      upset_focus: ((ai.upset_focus ?? active.upset_focus ?? []) as string[]),
      comment: (active.comment ?? ai.comment ?? active.ai_comment ?? "") as string,
      recommendation_reason: ((active.recommendation_reason ?? ai.recommendation_reason ?? "") as string),
      ev_details: ((active.ev_details ?? ai.ev_details ?? {}) as Record<string, number>),
    },
    data: racerArray.map((r) => {
      const laneNum = r.lane as number;
      const bEx = beforeRacers[laneNum] || beforeRacers[String(laneNum)] || {};
      const loopTime = (r.loop_time ?? r.lap_time ?? r.lap ?? bEx.loop_time ?? "N/A") as string;
      const turnTime = (r.turn_time ?? r.turn ?? bEx.turn_time ?? "N/A") as string;
      const straightTime = (r.straight_time ?? r.straight ?? bEx.straight_time ?? "N/A") as string;

      return {
        lane: laneNum,
        name: r.name as string,
        regNo: String(r.regNo ?? r.toban ?? r.id ?? ""),
        cls: r.cls as string,
        rate: r.rate as string,
        motor_rate: r.motor_rate as string,
        f_count: r.f_count ?? (r.stats as any)?.f_count ?? 0,
        l_count: r.l_count ?? (r.stats as any)?.l_count ?? 0,
        avg_st: r.avg_st ?? (r.stats as any)?.avg_st ?? "",
        ex_time: (r.ex_time ?? r.exhibition_time ?? bEx.ex_time ?? "") as string,
        st_val: (r.st_val ?? r.st ?? "") as string,
        tilt: (r.tilt ?? bEx.tilt ?? "") as string,
        score_grade: (r.score_grade as "S" | "A" | "B" | "C" | "D" | undefined),
        lap_time: loopTime,
        loop_time: loopTime,
        turn_time: turnTime,
        straight_time: straightTime,
        stats: (r.stats as Record<string, unknown> | undefined) ?? {
          course_top2_rate: r.course_top2_rate ?? r.course_win_rate ?? r.course_rate,
          venue_win_rate: r.venue_win_rate ?? r.local_win_rate ?? r.local_rate,
          course_st_rank: r.course_st_rank ?? r.st_rank ?? r.st_order,
        },
      };
    }),
    weather: (cache.weather ?? null) as {
      weather: string; temp: string; wind_speed: string;
      wind_dir_name: string; water_temp: string; wave_height: string;
    } | null,
    result: (cache.result ?? null) as {
      is_hit: boolean; combo: string;
    } | null,
  };
}
