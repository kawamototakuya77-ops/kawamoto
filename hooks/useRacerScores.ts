"use client";

import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`fetch failed: ${res.status}`);
    return res.json();
  });

/**
 * 全レーサーのAI能力評価スコアを取得
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
    }
  );

  return {
    scores: data?.success ? data.scores : {},
    loading: isLoading,
  };
}
