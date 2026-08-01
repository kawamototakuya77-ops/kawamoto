"use client";

import { useState } from "react";
import { useLivePrediction } from "@/hooks/useLivePrediction";
import { useRacerScores } from "@/hooks/useRacerScores";
import type { PredictionData } from "@/types/prediction";

const TABS = [
  { id: "prediction", label: "🎯 予想到着" },
  { id: "ability", label: "📊 能力評価" },
  { id: "weather", label: "🌤 気象・展開" },
  { id: "defense", label: "🛡️ 資金防衛AI" },
  { id: "result", label: "🏁 レース結果" },
] as const;

type TabId = (typeof TABS)[number]["id"];

interface Props {
  jcd: string;
  rno: number;
  venueName: string;
}

export default function RaceTabs({ jcd, rno, venueName }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("prediction");
  const { data, loading, error, refresh } = useLivePrediction(jcd, rno);

  const isLiveActive = data?.phase === 2 && !data?.result;
  const isFinished = Boolean(data?.result);

  return (
    <div className="space-y-4">
      {/* LINE Notification Banner */}
      <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/30 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#06C755] flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md">
            LINE
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-300">展示確定・直前通知をLINEで受け取る</div>
            <div className="text-[10px] text-slate-400">S・A評価の勝負レースのみ、締切12分前に直前AI速報を届ける</div>
          </div>
        </div>
        <a
          href="https://line.me/R/ti/p/@089aloaj"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg bg-[#06C755] text-white hover:bg-[#05b34c] transition-all shadow-md shadow-emerald-950"
        >
          友だち追加
        </a>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {loading && (
            <span className="flex items-center gap-1 text-sm text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              データ取得中...
            </span>
          )}
          {data && (
            <span className={`px-2 py-0.5 rounded-full text-sm font-bold ${
              isLiveActive
                ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                : isFinished
                ? "bg-slate-800 border border-slate-700 text-slate-400"
                : "bg-indigo-500/20 border border-indigo-500/30 text-indigo-400"
            }`}>
              {isLiveActive ? "● LIVE AI 推論" : isFinished ? "🏁 レース終了" : "○ 事前予想"}
            </span>
          )}
          {error && (
            <span className="px-2 py-0.5 rounded text-sm text-rose-400 bg-rose-950/50 border border-rose-500/20">
              ⚠ {error}
            </span>
          )}
        </div>
        <button
          onClick={refresh}
          className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1 rounded-lg border border-white/10 hover:border-white/20"
        >
          🔄 更新
        </button>
      </div>

      {/* Tab selector */}
      <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              "shrink-0 px-4 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap",
              activeTab === tab.id
                ? "text-emerald-400 border-emerald-500"
                : "text-slate-500 border-transparent hover:text-slate-300",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {activeTab === "prediction" && <PredictionTab data={data} loading={loading} />}
        {activeTab === "ability" && <AbilityTab data={data} loading={loading} />}
        {activeTab === "weather" && <WeatherTab data={data} loading={loading} />}
        {activeTab === "defense" && <DefenseTab data={data} loading={loading} />}
        {activeTab === "result" && <ResultTab data={data} loading={loading} />}
      </div>
    </div>
  );
}

// ─── タブ1: 予想到着 ───────────────────────────────────────────
function PredictionTab({ data, loading }: { data: PredictionData | null; loading: boolean }) {
  if (loading) return <TabSkeleton />;
  if (!data) return <TabEmpty message="レースを選択すると予測データが表示されます" />;

  const { ai } = data;
  const isLive = data.phase >= 2;

  return (
    <div className="space-y-4">
      {/* Phase badge */}
      <div className="flex items-center gap-2">
        <span className={`px-3 py-1 rounded-full text-sm font-black ${isLive ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-slate-700 text-slate-400"}`}>
          {isLive ? "【第2次評価】LIVE AI 推論" : "【第1次評価】事前AI予想"}
        </span>
        {ai.confidence && (
          <span className="text-sm text-amber-400 font-bold">
            信頼度: {typeof ai.confidence === 'string' ? ai.confidence : ai.confidence.stars}
          </span>
        )}
      </div>

      {/* Escape rate */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 font-bold mb-1">イン逃げ期待度</p>
          <p className="text-3xl font-black font-outfit text-indigo-300">
            {ai.escape_rate ?? "--"}%
          </p>
        </div>
        {data.result && (
          <div className={`px-3 py-2 rounded-xl text-sm font-black ${data.result.is_hit ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
            {data.result.is_hit ? "✅ 的中" : "❌ 外れ"}<br />
            <span className="text-base">{data.result.combo}</span>
          </div>
        )}
      </div>

      {/* Focus picks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
          <p className="text-sm text-indigo-400 font-bold mb-2">🟦 本命フォーカス</p>
          <div className="space-y-1.5">
            {ai.solid_focus && ai.solid_focus.length > 0 ? ai.solid_focus.map((f, i) => (
              <div key={i} className="px-3 py-2 bg-indigo-500/10 rounded-lg text-sm font-black text-indigo-300 border border-indigo-500/20">
                {f}
              </div>
            )) : (
              <p className="text-sm text-slate-500">---</p>
            )}
          </div>
        </div>
        <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
          <p className="text-sm text-amber-400 font-bold mb-2">🟧 穴フォーカス</p>
          <div className="space-y-1.5">
            {ai.upset_focus && ai.upset_focus.length > 0 ? ai.upset_focus.map((f, i) => (
              <div key={i} className="px-3 py-2 bg-amber-500/10 rounded-lg text-sm font-black text-amber-300 border border-amber-500/20">
                {f}
              </div>
            )) : (
              <p className="text-sm text-slate-500">---</p>
            )}
          </div>
        </div>
      </div>

      {/* AI comment — LIVE AI 推論解説（ラベルと本文が同じカード内） */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/10 space-y-2">
        <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
          🤖 LIVE AI 推論（二次予想解説）
        </p>
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          {ai.comment || "データを取得中です..."}
        </p>
      </div>

      {/* X Share button */}
      {data.result && (
        <XShareButton data={data} />
      )}
    </div>
  );
}

// ─── タブ2: 能力評価 ───────────────────────────────────────────
function AbilityTab({ data, loading }: { data: PredictionData | null; loading: boolean }) {
  const { scores: globalScores, loading: scoresLoading } = useRacerScores();
  
  if (loading || scoresLoading) return <TabSkeleton />;
  if (!data?.data || data.data.length === 0)
    return <TabEmpty message="選手データを取得中..." />;

  // N/A や空文字以外なら展示データありと判定
  const hasExhibition = data.data.some((r) => r.ex_time && r.ex_time !== "--" && r.ex_time !== "N/A");
  const hasST = data.data.some((r) => r.st_val && r.st_val !== "--" && r.st_val !== "N/A");
  const hasOriEx = data.data.some((r) => (r.lap_time && r.lap_time !== "N/A") || (r.turn_time && r.turn_time !== "N/A") || (r.straight_time && r.straight_time !== "N/A"));

  const gradeColor: Record<string, string> = {
    S: "text-amber-400 border-amber-400/50 bg-amber-400/10",
    A: "text-emerald-400 border-emerald-400/50 bg-emerald-400/10",
    B: "text-indigo-400 border-indigo-400/50 bg-indigo-400/10",
    C: "text-slate-300 border-slate-600 bg-slate-800/50",
    D: "text-rose-400 border-rose-400/50 bg-rose-400/10",
  };

  return (
    <div className="space-y-3">
      {/* 展示フェーズ表示 */}
      {hasExhibition && (
        <div className="px-1 flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm text-emerald-400 font-bold">展示データ取得済み</span>
        </div>
      )}

      {/* 選手一覧 (比較テーブルレイアウト) */}
      <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/60 mt-2 scrollbar-thin scrollbar-thumb-slate-700">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-800/80 text-[10px] text-slate-400">
              <th className="p-2 font-bold w-24">枠 / 選手</th>
              <th className="p-2 font-bold text-center text-emerald-300/80">AI総合</th>
              <th className="p-2 font-bold text-center text-rose-300/80">AI機力</th>
              <th className="p-2 font-bold text-center text-indigo-300/80">AI ST</th>
              <th className="p-2 font-bold text-center text-amber-300/80">AI旋回</th>
              <th className="p-2 font-bold text-center text-orange-300/80">イン信頼</th>
              <th className="p-2 font-bold text-center">コース勝率</th>
              <th className="p-2 font-bold text-center">当地勝率</th>
              <th className="p-2 font-bold text-center">ST順位</th>
              <th className="p-2 font-bold text-center">F/L</th>
              <th className="p-2 font-bold text-center">展示ST</th>
              <th className="p-2 font-bold text-center text-indigo-300">展示T</th>
              <th className="p-2 font-bold text-center text-amber-300">一周</th>
              <th className="p-2 font-bold text-center text-amber-300">まわり足</th>
              <th className="p-2 font-bold text-center text-amber-300">直線</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(() => {
              // スコアランキング計算用
              const allScores = data.data.map(r => r.regNo ? globalScores[r.regNo] : null).filter(Boolean);
              const getRank = (key: string, value: number) => {
                if (!value || allScores.length === 0) return 99;
                const sorted = [...new Set(allScores.map(s => (s as any)?.[key] as number))].sort((a, b) => b - a);
                return sorted.indexOf(value) + 1;
              };
              const getScoreColor = (rank: number) => {
                if (rank === 1) return "text-red-400 font-black drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]";
                if (rank === 2) return "text-yellow-400 font-black";
                if (rank === 3) return "text-emerald-400 font-bold";
                return "text-slate-300 font-normal";
              };

              return data.data.map((racer) => {
                const stats = racer.stats;
                const rScore = racer.regNo ? globalScores[racer.regNo] : null;

                return (
                  <tr key={racer.lane} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="p-2 flex items-center gap-2 sticky left-0 z-20 bg-slate-900/95 group-hover:bg-slate-800/95 transition-colors border-r border-white/5 shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black shrink-0 boat-${racer.lane}`}>
                        {racer.lane}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate leading-none">{racer.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{racer.cls}</p>
                      </div>
                    </td>
                    
                    {/* AI Scores */}
                    <td className={`p-2 text-center text-[11px] font-outfit ${rScore ? getScoreColor(getRank('win', rScore.win)) : 'text-slate-500'}`}>
                      {rScore ? Math.round(rScore.win) : "--"}
                    </td>
                    <td className={`p-2 text-center text-[11px] font-outfit ${rScore ? getScoreColor(getRank('maint', rScore.maint)) : 'text-slate-500'}`}>
                      {rScore ? Math.round(rScore.maint) : "--"}
                    </td>
                    <td className={`p-2 text-center text-[11px] font-outfit ${rScore ? getScoreColor(getRank('start', rScore.start)) : 'text-slate-500'}`}>
                      {rScore ? Math.round(rScore.start) : "--"}
                    </td>
                    <td className={`p-2 text-center text-[11px] font-outfit ${rScore ? getScoreColor(getRank('turn', rScore.turn)) : 'text-slate-500'}`}>
                      {rScore ? Math.round(rScore.turn) : "--"}
                    </td>
                    <td className={`p-2 text-center text-[11px] font-outfit ${rScore ? getScoreColor(getRank('escape', rScore.escape)) : 'text-slate-500'}`}>
                      {rScore ? Math.round(rScore.escape) : "--"}
                    </td>

                  {/* 艇国DBデータ */}
                  <td className="p-2 text-center text-xs font-bold text-white">
                    {stats?.course_top2_rate ? `${Number(stats.course_top2_rate).toFixed(1)}%` : "--"}
                  </td>
                  <td className="p-2 text-center text-xs font-bold text-white">
                    {stats?.venue_win_rate ? `${Number(stats.venue_win_rate).toFixed(1)}%` : "--"}
                  </td>
                  <td className="p-2 text-center text-xs font-bold text-white">
                    {stats?.course_st_rank ? Number(stats.course_st_rank).toFixed(2) : "--"}
                  </td>

                  {/* ペナルティ & 戦法 */}
                  <td className="p-2 text-center text-[10px] font-bold text-amber-500">
                    F{(stats as any)?.f_count || 0} / L{(stats as any)?.l_count || 0}
                  </td>

                  {/* 展示・オリ展データ */}
                  <td className="p-2 text-center text-xs font-black font-outfit text-emerald-400">
                    {racer.st_val !== "N/A" && racer.st_val ? `F${racer.st_val}` : "--"}
                  </td>
                  <td className="p-2 text-center text-xs font-black font-outfit text-indigo-300">
                    {racer.ex_time !== "N/A" && racer.ex_time ? racer.ex_time : "--"}
                  </td>
                  <td className="p-2 text-center text-xs font-black font-outfit text-amber-300">
                    {((racer as any).loop_time || racer.lap_time) !== "N/A" && ((racer as any).loop_time || racer.lap_time) ? ((racer as any).loop_time || racer.lap_time) : "--"}
                  </td>
                  <td className="p-2 text-center text-xs font-black font-outfit text-amber-300">
                    {(() => {
                      const val = (racer as any).turn_time || (racer as any).mawari_ashi || racer.turn_time;
                      if (!val || val === "N/A" || String(val).includes("-0.") || String(val).includes("0.0")) return "--";
                      return val;
                    })()}
                  </td>
                  <td className="p-2 text-center text-xs font-black font-outfit text-amber-300">
                    {(() => {
                      const val = (racer as any).straight_time || (racer as any).chokusen;
                      if (!val || val === "N/A") return "--";
                      return val;
                    })()}
                  </td>
                </tr>
              );
            });
          })()}
          </tbody>
        </table>
      </div>

      {/* 展示なし時の補足 */}
      {!hasExhibition && (
        <div className="px-1 py-2">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <span className="opacity-50">ℹ️</span> 
            展示タイム・ST・オリ展はレース直前（展示後）に自動反映されます
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Score Bar Component ───────────────────────────────────────────
function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  const percent = Math.min(100, Math.max(0, score));
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-bold text-slate-400 w-16 shrink-0 text-right">{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }} />
      </div>
      <span className="text-[11px] font-black font-mono text-slate-300 w-8 shrink-0 text-right">{score}</span>
    </div>
  );
}


// ─── タブ3: 気象・展開 ───────────────────────────────────────────
function WeatherTab({ data, loading }: { data: PredictionData | null; loading: boolean }) {
  if (loading) return <TabSkeleton />;
  if (!data?.weather) return <TabEmpty message="気象データを取得中..." />;

  const w = data.weather;
  const items = [
    { label: "天候", value: w.weather, icon: "🌤" },
    { label: "気温", value: `${w.temp}℃`, icon: "🌡" },
    { label: "風速", value: `${w.wind_speed}m/s ${w.wind_dir_name}`, icon: "🌬" },
    { label: "水温", value: `${w.water_temp}℃`, icon: "💧" },
    { label: "波高", value: `${w.wave_height}cm`, icon: "🌊" },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ label, value, icon }) => (
          <div key={label} className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-1">
            <p className="text-sm text-slate-400 font-bold">{icon} {label}</p>
            <p className="text-base font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Start timing grid */}
      {data.data && data.data.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
          <p className="text-sm font-bold text-slate-400">スタートタイミング</p>
          <div className="space-y-2">
            {data.data.map((r) => (
              <div key={r.lane} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-md flex items-center justify-center text-sm font-black boat-${r.lane} shrink-0`}>
                  {r.lane}
                </div>
                <div className="flex-1 bg-slate-800/80 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.max(0, Math.min(100, (0.2 - parseFloat(r.st_val || "0.15")) * 500 + 50))}%` }}
                  />
                </div>
                <span className="text-sm font-mono font-bold text-slate-300 w-12 text-right shrink-0">
                  F{r.st_val || "--"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── タブ4: 資金防衛AI ───────────────────────────────────────────
function DefenseTab({ data, loading }: { data: PredictionData | null; loading: boolean }) {
  if (loading) return <TabSkeleton />;
  if (!data) return <TabEmpty message="資金防衛AIデータを取得中..." />;

  const { ai } = data;
  const isKen = !ai.solid_focus?.length && !ai.upset_focus?.length;
  const hasPremium = true; // TODO: セッションから取得

  return (
    <div className="space-y-4">
      {/* 判定結果 */}
      <div className={`p-5 rounded-2xl border ${isKen ? "bg-slate-900/60 border-slate-700/50" : "bg-emerald-900/20 border-emerald-500/30"} text-center space-y-2`}>
        <div className="text-4xl">{isKen ? "🛡️" : "✅"}</div>
        <p className="text-base font-black text-white">
          {isKen ? "AI見送り推奨（ケン）" : "AI推奨レース（買い判定）"}
        </p>
        {isKen && (
          <p className="text-sm text-slate-400 leading-relaxed">
            本レースは直前オッズのEV（期待値）を検証した結果、AI基準値（EV 1.2）を超える買い目が存在しませんでした。
            <br />
            <strong className="text-amber-400">「無駄な投資を避けること」</strong>が回収率向上の鉄則です。
          </p>
        )}
        {ai.recommendation_reason && (
          <div className="mt-2 px-3 py-2 bg-slate-900 rounded-lg text-sm text-slate-400 font-mono text-left">
            Reason: {ai.recommendation_reason}
          </div>
        )}
      </div>

      {/* EV details */}
      {ai.ev_details && Object.keys(ai.ev_details).length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-2">
          <p className="text-sm font-bold text-slate-400">EV詳細（期待値フィルター結果）</p>
          <div className="space-y-1.5">
            {Object.entries(ai.ev_details).slice(0, 6).map(([combo, ev]) => (
              <div key={combo} className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-300">{combo}</span>
                <span className={`text-sm font-black font-mono ${ev >= 1.2 ? "text-emerald-400" : "text-rose-400"}`}>
                  EV {ev.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRO lock for non-premium */}
      {!hasPremium && (
        <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-center space-y-2">
          <p className="text-base font-black text-amber-400">🔒 PRO限定データ</p>
          <p className="text-sm text-slate-400">
            EV詳細・損失回避金額・推奨理由はプロプランで解禁されます
          </p>
          <a
            href="https://buy.stripe.com/14A9AT6E6aBY0pHbDFgjC02"
            className="block w-full py-3 text-sm font-black text-white rounded-xl mt-2 text-center"
            style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}
          >
            プロプラン (PRO) で解禁 — 月額1,980円
          </a>
        </div>
      )}
    </div>
  );
}

// ─── X シェアボタン ───────────────────────────────────────────
function XShareButton({ data }: { data: PredictionData }) {
  const { result, ai } = data;
  if (!result) return null;

  const text = result.is_hit
    ? `【AI的中🎯】\n${result.combo} 的中！\nLIVE AI 推論で${ai.solid_focus?.join("/")}を本命視。\n\n競艇直前物理AI`
    : `【AI見送り成功🛡️】\nAI「見送り推奨」→ ${result.combo} 全ハズレ確認。\n800円の無駄打ちを回避！\n\n競艇直前物理AI`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

  return (
    <a
      href={twitterUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-slate-700 text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
    >
      𝕏 この結果をシェアする
    </a>
  );
}

// ─── タブ5: レース結果 ───────────────────────────────────────────
function ResultTab({ data, loading }: { data: PredictionData | null; loading: boolean }) {
  if (loading) return <TabSkeleton />;
  if (!data) return <TabEmpty message="レースを選択すると結果が表示されます" />;

  const { result, ai } = data;

  if (!result) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/5 text-center space-y-3">
        <div className="text-3xl">⏳</div>
        <p className="text-base font-bold text-slate-300">レース結果はまだ確定していません</p>
        <p className="text-xs text-slate-500">
          公式のレース結果が確定次第、リアルタイムでここに勝敗・払い戻しが表示されます。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 判定カード */}
      <div className={`p-5 rounded-2xl border flex items-center justify-between ${
        result.is_hit
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
          : "bg-rose-500/10 border-rose-500/30 text-rose-300"
      }`}>
        <div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/30 border border-white/10">
            {result.is_hit ? "✅ AI予測 的中" : "❌ AI予測 不的中 / 見送り"}
          </span>
          <p className="text-3xl font-black font-outfit mt-2 tracking-wider">
            {result.combo}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400 font-bold mb-1">三連単払戻金</p>
          <p className="text-2xl font-black font-outfit text-amber-300">
            {result.payout ? `¥${result.payout.toLocaleString()}` : "--"}
          </p>
        </div>
      </div>

      {/* 答え合わせ詳細 */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
        <h4 className="text-sm font-bold text-slate-300 border-b border-white/10 pb-2 flex items-center justify-between">
          <span>🔍 AI予想との答え合わせ</span>
          <span className="text-xs text-indigo-400">事前評価: {ai.confidence ? (typeof ai.confidence === 'string' ? ai.confidence : ai.confidence.stars) : "--"}</span>
        </h4>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-800/50 space-y-1">
            <span className="text-slate-400 font-bold block">本命AIターゲット</span>
            <span className="text-sm font-black text-indigo-300">
              {ai.solid_focus && ai.solid_focus.length > 0 ? ai.solid_focus.join(", ") : "---"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-800/50 space-y-1">
            <span className="text-slate-400 font-bold block">穴・波乱ターゲット</span>
            <span className="text-sm font-black text-amber-300">
              {ai.upset_focus && ai.upset_focus.length > 0 ? ai.upset_focus.join(", ") : "---"}
            </span>
          </div>
        </div>
      </div>

      <XShareButton data={data} />
    </div>
  );
}

// ─── 共通UI ───────────────────────────────────────────
function TabSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-16 bg-slate-800/40 rounded-2xl border border-white/5" />
      ))}
    </div>
  );
}

function TabEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3 text-center">
      <div className="text-4xl opacity-40">🏁</div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
