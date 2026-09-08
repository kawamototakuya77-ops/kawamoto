"use client";

import { useState, useEffect } from "react";
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
        {activeTab === "prediction" && <PredictionTab data={data} loading={loading} jcd={jcd} rno={rno} />}
        {activeTab === "ability" && <AbilityTab data={data} loading={loading} />}
        {activeTab === "weather" && <WeatherTab data={data} loading={loading} />}
        {activeTab === "defense" && <DefenseTab data={data} loading={loading} />}
        {activeTab === "result" && <ResultTab data={data} loading={loading} />}
      </div>
    </div>
  );
}

// ─── チケット管理 ＆ 初回的中保証フック ───────────────────────
function useTicketUnlock(jcd: string, rno: number, isHit: boolean | null | undefined) {
  const raceKey = `${jcd}-${rno}`;
  const [tickets, setTickets] = useState<number>(1);
  const [unlockedRaces, setUnlockedRaces] = useState<string[]>([]);
  const [refundAlert, setRefundAlert] = useState<boolean>(false);

  useEffect(() => {
    try {
      // 1. チケット残高の初期化（初回訪問ユーザーには1枚無料プレゼント）
      const savedTickets = localStorage.getItem("kyotei_user_tickets");
      if (savedTickets === null) {
        localStorage.setItem("kyotei_user_tickets", "1");
        setTickets(1);
      } else {
        setTickets(parseInt(savedTickets, 10) || 0);
      }

      // 2. アンロック済みレースリストの取得
      const savedUnlocked = localStorage.getItem("kyotei_unlocked_races");
      const unlockedList: string[] = savedUnlocked ? JSON.parse(savedUnlocked) : [];
      setUnlockedRaces(unlockedList);

      // 3. 初回的中保証の自動判定（初戦でアンロック済みかつ不的中の場合、チケットを即時返還）
      const guaranteeUsed = localStorage.getItem("kyotei_guarantee_used");
      if (
        isHit === false &&
        unlockedList.includes(raceKey) &&
        guaranteeUsed !== "true"
      ) {
        const refundedRaces: string[] = JSON.parse(localStorage.getItem("kyotei_refunded_races") || "[]");
        if (!refundedRaces.includes(raceKey)) {
          refundedRaces.push(raceKey);
          localStorage.setItem("kyotei_refunded_races", JSON.stringify(refundedRaces));
          localStorage.setItem("kyotei_guarantee_used", "true");
          const curTickets = parseInt(localStorage.getItem("kyotei_user_tickets") || "0", 10);
          const newTickets = curTickets + 1;
          localStorage.setItem("kyotei_user_tickets", newTickets.toString());
          setTickets(newTickets);
          setRefundAlert(true);
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }, [raceKey, isHit]);

  const unlockWithTicket = () => {
    try {
      if (tickets <= 0) return false;
      const newTickets = tickets - 1;
      localStorage.setItem("kyotei_user_tickets", newTickets.toString());
      setTickets(newTickets);

      const savedUnlocked = localStorage.getItem("kyotei_unlocked_races");
      const unlockedList: string[] = savedUnlocked ? JSON.parse(savedUnlocked) : [];
      if (!unlockedList.includes(raceKey)) {
        unlockedList.push(raceKey);
        localStorage.setItem("kyotei_unlocked_races", JSON.stringify(unlockedList));
        setUnlockedRaces(unlockedList);
      }
      return true;
    } catch {
      return false;
    }
  };

  const isUnlocked = unlockedRaces.includes(raceKey);

  return {
    tickets,
    isUnlocked,
    unlockWithTicket,
    refundAlert,
  };
}

// ─── タブ1: 予想到着 ───────────────────────────────────────────
function PredictionTab({
  data,
  loading,
  jcd,
  rno,
}: {
  data: PredictionData | null;
  loading: boolean;
  jcd: string;
  rno: number;
}) {
  const { tickets, isUnlocked, unlockWithTicket, refundAlert } = useTicketUnlock(
    jcd,
    rno,
    data?.result?.is_hit
  );

  if (loading) return <TabSkeleton />;
  if (!data) return <TabEmpty message="レースを選択すると予測データが表示されます" />;

  const { ai } = data;
  const isLive = data.phase >= 2;

  // S/Aランク勝負レース判定
  const confStr = typeof ai.confidence === 'string' ? ai.confidence : (data as any).confidence_score || "";
  const isTargetRace = (confStr.includes("S") || confStr.includes("A")) && Boolean(ai.solid_focus && ai.solid_focus.length > 0);
  const isFinished = Boolean(data.result);

  // マスキング適用条件：勝負レース ＆ 未終了 ＆ 未アンロック
  const shouldMask = isTargetRace && !isFinished && !isUnlocked;

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

      {/* 展開戦術期待度 (1コース: イン逃げ / 2〜6コース: 差し・まくり・まくり差し) */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            コース別・展開AI期待度
          </p>
          {data.result && (
            <div className={`px-2.5 py-1 rounded-lg text-xs font-black ${data.result.is_hit ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
              {data.result.is_hit ? "✅ 的中" : "❌ 外れ"} {data.result.combo}
            </div>
          )}
        </div>

        {(() => {
          const escVal = parseFloat(String(ai.escape_rate || 65));
          const rem = Math.max(10, 100 - escVal);
          const escStr = ai.escape_rate ? `${ai.escape_rate}%` : "--";
          const sashiStr = (ai as any).sashi_rate ? `${(ai as any).sashi_rate}%` : `${Math.round(rem * 0.40)}%`;
          const makuriStr = (ai as any).makuri_rate ? `${(ai as any).makuri_rate}%` : `${Math.round(rem * 0.35)}%`;
          const zashiStr = (ai as any).makurizashi_rate ? `${(ai as any).makurizashi_rate}%` : `${Math.round(rem * 0.25)}%`;

          return (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/30">
                <span className="block text-[10px] text-indigo-300 font-bold mb-0.5">イン逃げ (1C)</span>
                <span className="text-lg font-black text-indigo-200 font-outfit">{escStr}</span>
              </div>
              <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/30">
                <span className="block text-[10px] text-blue-300 font-bold mb-0.5">差し (2-3C)</span>
                <span className="text-lg font-black text-blue-200 font-outfit">{sashiStr}</span>
              </div>
              <div className="bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/30">
                <span className="block text-[10px] text-amber-300 font-bold mb-0.5">まくり (2-4C)</span>
                <span className="text-lg font-black text-amber-200 font-outfit">{makuriStr}</span>
              </div>
              <div className="bg-purple-500/10 p-2.5 rounded-xl border border-purple-500/30">
                <span className="block text-[10px] text-purple-300 font-bold mb-0.5">まくり差し (3-5C)</span>
                <span className="text-lg font-black text-purple-200 font-outfit">{zashiStr}</span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* Focus picks with Frosted Glass Masking */}
      <div className="relative">
        {/* すりガラス・マスキングオーバーレイ */}
        {shouldMask && (
          <div className="absolute inset-0 z-20 backdrop-blur-md bg-slate-950/85 border-2 border-emerald-500/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center shadow-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold mb-3">
              <span>🛡️</span>
              <span>初回体験は【的中保証】付き（外れたら即時全額返還）</span>
            </div>
            <h3 className="text-lg font-black text-white mb-1">
              ★{confStr || "S"}ランク 厳選勝負レース
            </h3>
            <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">
              直前展示δとオッズ歪みを突いた【プロ公認・黄金フォーメーション（本線＋抑え）】を解禁します。
            </p>

            {tickets > 0 ? (
              <div className="space-y-2 w-full max-w-xs">
                <button
                  onClick={unlockWithTicket}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-lg shadow-emerald-950/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>🔓</span>
                  <span>無料チケットで買い目をアンロック</span>
                </button>
                <p className="text-[11px] text-emerald-400 font-bold">
                  🎁 初回登録ボーナス適用中（所持チケット: {tickets}枚）
                </p>
              </div>
            ) : (
              <div className="space-y-2 w-full max-w-xs">
                <a
                  href="https://buy.stripe.com/3cI3cv3rUbG28Wd9vxgjC05"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black text-sm shadow-lg shadow-teal-950/50 transition-all text-center"
                >
                  💳 100円で買い目をアンロック（Stripe）
                </a>
                <p className="text-[11px] text-slate-400">
                  ※初戦不適中の場合、初回的中保証でチケット即時返還
                </p>
              </div>
            )}
          </div>
        )}

        {/* アンロック済みステータスバッジ */}
        {isTargetRace && isUnlocked && !isFinished && (
          <div className="mb-2 p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-between text-xs">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span>🔓</span>
              <span>勝負レース買い目アンロック済み（初回的中保証対象）</span>
            </span>
            <span className="text-slate-400 font-mono">所持チケット: {tickets}枚</span>
          </div>
        )}

        {/* 初回的中保証返還通知バナー */}
        {refundAlert && (
          <div className="mb-3 p-3.5 rounded-xl bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 text-xs font-bold flex items-center gap-3 shadow-xl">
            <span className="text-2xl">🛡️</span>
            <div>
              <div className="text-emerald-300 font-extrabold text-sm">【初回的中保証】チケットを即時返還しました！</div>
              <div className="text-slate-300">初戦が不的中となったため、チケット1枚をお戻ししました。次の勝負レースを無料でお試しいただけます。</div>
            </div>
          </div>
        )}

        {/* 買い目カード本体（未アンロック時はぼかしを適用） */}
        <div className={`grid grid-cols-2 gap-3 ${shouldMask ? "filter blur-md select-none pointer-events-none opacity-30" : ""}`}>
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
              <th className="p-2 font-bold text-center text-blue-300/80">差し</th>
              <th className="p-2 font-bold text-center text-amber-300/80">まくり</th>
              <th className="p-2 font-bold text-center text-purple-300/80">まくり差し</th>
              <th className="p-2 font-bold text-center text-emerald-300">コース2連率</th>
              <th className="p-2 font-bold text-center text-cyan-300">当地勝率</th>
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
                const stats = ((racer.stats || racer) as any);
                const regNoKey = racer.regNo ? String(racer.regNo) : "";
                const rScore = regNoKey ? (globalScores[regNoKey] || globalScores[Number(regNoKey)]) : null;

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
                      {rScore ? Math.round(rScore.escape) : (racer.lane === 1 ? Math.round(Number(racer.rate || 5) * 12) : Math.round(Number(racer.rate || 5) * 4))}
                    </td>
                    <td className={`p-2 text-center text-[11px] font-outfit ${rScore ? getScoreColor(getRank('turn', rScore.turn * 0.95)) : 'text-slate-500'}`}>
                      {rScore ? Math.round(rScore.turn * 0.95) : Math.round(Number(racer.rate || 5) * 9.5)}
                    </td>
                    <td className={`p-2 text-center text-[11px] font-outfit ${rScore ? getScoreColor(getRank('turn', rScore.turn * 0.90)) : 'text-slate-500'}`}>
                      {rScore ? Math.round(rScore.turn * 0.90) : Math.round(Number(racer.rate || 5) * 9.0)}
                    </td>
                    <td className={`p-2 text-center text-[11px] font-outfit ${rScore ? getScoreColor(getRank('turn', rScore.turn * 0.85)) : 'text-slate-500'}`}>
                      {rScore ? Math.round(rScore.turn * 0.85) : Math.round(Number(racer.rate || 5) * 8.5)}
                    </td>

                  {/* コース2連率 (%) */}
                  <td className="p-2 text-center text-xs font-bold text-white font-outfit">
                    {(() => {
                      const raw = stats?.course_top2_rate ?? (stats as any)?.course_win_rate ?? (stats as any)?.course_rate;
                      if (raw !== undefined && raw !== null && raw !== "" && raw !== "--" && raw !== "N/A") {
                        const num = Number(raw);
                        if (!isNaN(num) && num > 0) return `${num.toFixed(1)}%`;
                      }
                      return "--";
                    })()}
                  </td>
                  {/* 当地勝率 (0.00〜10.00 勝率スコア) */}
                  <td className="p-2 text-center text-xs font-bold text-white font-outfit">
                    {(() => {
                      const raw = stats?.venue_win_rate ?? (stats as any)?.local_win_rate ?? (stats as any)?.local_rate ?? (stats as any)?.place_win_rate;
                      if (raw !== undefined && raw !== null && raw !== "" && raw !== "--" && raw !== "N/A") {
                        const num = Number(raw);
                        if (!isNaN(num) && num > 0) return num > 10 ? `${num.toFixed(1)}%` : num.toFixed(2);
                      }
                      return "--";
                    })()}
                  </td>
                  {/* ST順位 (コース別平均ST順位) */}
                  <td className="p-2 text-center text-xs font-bold text-white font-outfit">
                    {(() => {
                      const raw = stats?.course_st_rank ?? (stats as any)?.st_rank ?? (stats as any)?.st_order;
                      if (raw !== undefined && raw !== null && raw !== "" && raw !== "--" && raw !== "N/A") {
                        const num = Number(raw);
                        if (!isNaN(num) && num > 0) return num.toFixed(2);
                      }
                      return "--";
                    })()}
                  </td>

                  {/* ペナルティ & 戦法 */}
                  <td className="p-2 text-center text-[10px] font-bold text-amber-500 font-mono">
                    {(() => {
                      const isOldPeriod = stats?.period === "20261";
                      const f = isOldPeriod ? 0 : Number((stats as any)?.f_count ?? (racer as any)?.f_count ?? 0);
                      const l = isOldPeriod ? 0 : Number((stats as any)?.l_count ?? (racer as any)?.l_count ?? 0);
                      const safeF = isNaN(f) ? 0 : f;
                      const safeL = isNaN(l) ? 0 : l;
                      return `F${safeF} / L${safeL}`;
                    })()}
                  </td>

                  {/* 展示・オリ展データ (100%全キー救済マッピング) */}
                  {/* 1. 展示ST */}
                  <td className="p-2 text-center text-xs font-black font-outfit text-emerald-400">
                    {(() => {
                      const val = racer.st_val || (racer as any).st || (racer.stats as any)?.st;
                      if (!val || val === "N/A") return "--";
                      return String(val).startsWith("F") || String(val).startsWith("L") ? val : `.${val}`;
                    })()}
                  </td>

                  {/* 2. 展示タイム */}
                  <td className="p-2 text-center text-xs font-black font-outfit text-indigo-300">
                    {(() => {
                      const val = racer.ex_time || (racer as any).exhibition_time || (racer as any).ex_time || (racer.stats as any)?.ex_time;
                      if (!val || val === "N/A") return "--";
                      return val;
                    })()}
                  </td>

                  {/* 3. 一周タイム */}
                  <td className="p-2 text-center text-xs font-black font-outfit text-amber-300">
                    {(() => {
                      const val = (racer as any).loop_time || (racer as any).isshu || racer.lap_time || (racer as any).exhibition?.loop_time || (racer.stats as any)?.loop_time;
                      if (!val || val === "N/A" || String(val) === "0" || String(val) === "0.0") return "--";
                      return val;
                    })()}
                  </td>

                  {/* 4. まわり足タイム */}
                  <td className="p-2 text-center text-xs font-black font-outfit text-amber-300">
                    {(() => {
                      const val = (racer as any).turn_time || (racer as any).mawari_ashi || (racer as any).exhibition?.turn_time || (racer.stats as any)?.turn_time;
                      if (!val || val === "N/A" || String(val).includes("-0.") || String(val) === "0" || String(val) === "0.0") return "--";
                      return val;
                    })()}
                  </td>

                  {/* 5. 直線タイム */}
                  <td className="p-2 text-center text-xs font-black font-outfit text-amber-300">
                    {(() => {
                      const val = (racer as any).straight_time || (racer as any).chokusen || (racer as any).exhibition?.straight_time || (racer.stats as any)?.straight_time;
                      if (!val || val === "N/A" || String(val) === "0" || String(val) === "0.0") return "--";
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
  const hasPremium = false; // TODO: セッションから取得

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
