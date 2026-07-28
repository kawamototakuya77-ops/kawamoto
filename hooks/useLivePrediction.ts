"use client";

import useSWR from "swr";
import type { PredictionData } from "@/types/prediction";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("GAS fetch failed");
    return res.json();
  });

interface UseLivePredictionResult {
  data: PredictionData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

/**
 * GAS + SWR によるリアルタイム予測データ取得フック
 * - GAS ポーリング処理を排除し、SWR のキャッシュ戦略に置き換え
 * - refreshInterval: 30秒（旧GASポーリング60秒から改善）
 * - キャッシュヒット時は再フェッチしない（通信量削減）
 * - ページがバックグラウンドに移動したら自動停止
 */
export function useLivePrediction(
  jcd: string,
  rno: number
): UseLivePredictionResult {
  const key =
    jcd && rno
      ? `/api/gas?action=getPrediction&jcd=${jcd.padStart(2, "0")}&rno=${rno}`
      : null;

  const { data: raw, error, isLoading, mutate } = useSWR<{
    success: boolean;
    prediction?: PredictionData;
    error?: string;
  }>(key, fetcher, {
    refreshInterval: 30_000,       // 30秒ごとに差分取得
    revalidateOnFocus: true,        // フォーカス復帰時に再取得
    revalidateIfStale: true,
    dedupingInterval: 10_000,       // 10秒以内の重複リクエストを抑制
  });

  return {
    data: raw?.success && raw.prediction ? raw.prediction : null,
    loading: isLoading,
    error: error ? "データ取得に失敗しました" : null,
    refresh: () => mutate(),
  };
}

/**
 * 本日の全予測一覧を取得するフック（ダッシュボード用）
 */
export function useAllPredictions() {
  const { data: raw, error, isLoading, mutate } = useSWR<{
    success: boolean;
    predictions?: Record<string, PredictionData>;
    activeVenues?: string[];
  }>("/api/gas?action=getAll", fetcher, {
    refreshInterval: 60_000,
    revalidateOnFocus: true,
    dedupingInterval: 20_000,
  });

  return {
    predictions: raw?.predictions ?? {},
    activeVenues: raw?.activeVenues ?? [],
    loading: isLoading,
    error: error ? "全予測データの取得に失敗しました" : null,
    refresh: () => mutate(),
  };
}
