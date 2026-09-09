"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    return res.json();
  });

/**
 * 全レーサーのAI能力評価スコアを取得
 * get_racer_score_cache（GASスプレッドシート全行スキャン）は20秒超タイムアウトするため、
 * サーバーサイドのインメモリキャッシュから即応（0ms）するように変更済み
 */
export function useRacerScores() {
  const { data, error, isLoading } = useSWR<{
    success: boolean;
    scores: Record<string, {
      name: string;
      cls: string;
      win: number;
      start: number;
      escape: number;
      turn: number;
      maint: number;
      safety: number;
      clsSc: number;
      period: string;
    }>;
    updated_at: string;
  }>(
    `/api/gas?action=get_racer_score_cache`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600_000, // 1時間キャッシュ
      onError: () => {}, // エラー時はサイレント（空のスコアで継続）
    }
  );

  return {
    scores: data?.success ? (data.scores || {}) : {},
    loading: isLoading && !error,
  };
}

/**
 * race_cache のデータから直接レーサースコアを構築するヘルパー
 * GASへの通信なしに即座に選手能力評価を提供する
 */
export function buildScoresFromRaceCache(cache: any): Record<string, any> {
  const scores: Record<string, any> = {};
  const racers = cache?.data;
  const racerScores = cache?.racer_scores;

  if (Array.isArray(racers)) {
    for (const r of racers) {
      const reg = String(r?.regNo || r?.toban || "").trim();
      if (!reg) continue;

      // racer_scores が配列の場合: lane で紐付けてスコアを取得
      let rsEntry: any = null;
      if (Array.isArray(racerScores)) {
        rsEntry = racerScores.find((rs: any) => Number(rs?.lane) === Number(r?.lane));
      }

      const comps = rsEntry?.components || {};
      const st = r?.stats || {};
      scores[reg] = {
        name: r?.name || "",
        cls: r?.cls || "",
        win: Math.round((parseFloat(String(comps.rate || r?.rate || "0")) || 0) * 10),
        start: Math.round((parseFloat(String(comps.smoothed_win_rate || "0")) || 0) * 100),
        escape: Math.round((parseFloat(String(comps.smoothed_3ren || "0")) || 0) * 100),
        turn: 0,
        maint: Math.round((parseFloat(String(comps.motor_rate || r?.motor_rate || "0")) || 0) * 10),
        safety: Math.round((parseFloat(String(comps.venue_win_rate || "0")) || 0) * 10),
        clsSc: rsEntry?.score || 0,
        period: st?.period || "",
      };
    }
  }
  return scores;
}
