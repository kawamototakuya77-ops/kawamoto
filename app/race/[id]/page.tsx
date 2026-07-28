import Link from "next/link";
import RaceTabs from "@/components/race/RaceTabs";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

const VENUE_MAP: Record<string, { name: string; jcd: string }> = {
  kiryu: { name: "桐生", jcd: "01" }, toda: { name: "戸田", jcd: "02" },
  edogawa: { name: "江戸川", jcd: "03" }, heiwajima: { name: "平和島", jcd: "04" },
  tamagawa: { name: "多摩川", jcd: "05" }, hamanako: { name: "浜名湖", jcd: "06" },
  gamagori: { name: "蒲郡", jcd: "07" }, tokoname: { name: "常滑", jcd: "08" },
  tsu: { name: "津", jcd: "09" }, mikuni: { name: "三国", jcd: "10" },
  biwako: { name: "びわこ", jcd: "11" }, suminoe: { name: "住之江", jcd: "12" },
  amagasaki: { name: "尼崎", jcd: "13" }, naruto: { name: "鳴門", jcd: "14" },
  marugame: { name: "丸亀", jcd: "15" }, kojima: { name: "児島", jcd: "16" },
  miyajima: { name: "宮島", jcd: "17" }, tokuyama: { name: "徳山", jcd: "18" },
  shimonoseki: { name: "下関", jcd: "19" }, wakamatsu: { name: "若松", jcd: "20" },
  ashiya: { name: "芦屋", jcd: "21" }, fukuoka: { name: "福岡", jcd: "22" },
  karatsu: { name: "唐津", jcd: "23" }, omura: { name: "大村", jcd: "24" },
};

function parseRaceId(id: string): { venueSlug: string; rno: number; venueName: string; jcd: string } {
  const parts = id.split("-");
  const rnoStr = parts[parts.length - 1];
  const rno = parseInt(rnoStr?.replace(/r$/i, "") || "1", 10);
  const venueSlug = parts.slice(0, -1).join("-");
  const venue = VENUE_MAP[venueSlug];
  return {
    venueSlug,
    rno,
    venueName: venue?.name ?? venueSlug,
    jcd: venue?.jcd ?? "01",
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { venueName, rno } = parseRaceId(id);
  return {
    title: `${venueName} ${rno}R | LIVE AI 推論 | 競艇直前物理AI`,
    description: `${venueName}${rno}Rのリアルタイム展開予測。LIVE AI 推論・EV フィルター・資金防衛AI の全データを確認できます。`,
  };
}

export default async function RacePage({ params }: Props) {
  const { id } = await params;
  const { venueName, rno, jcd } = parseRaceId(id);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header
        className="fixed top-0 left-0 w-full z-50 px-4 py-3 border-b border-white/5"
        style={{ background: "rgba(15,23,42,0.90)", backdropFilter: "blur(12px)" }}
      >
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← ダッシュボード
          </Link>
          <span className="text-sm text-slate-600">/</span>
          <h1 className="text-sm font-black text-white">{venueName} {rno}R</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-16 space-y-4">
        {/* Race header card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-black text-white font-outfit">
              {venueName} {rno}R
            </h2>
            <span className="px-3 py-1 rounded-full text-sm font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              LIVE AI 推論
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Gemini 2.5 Flash × LightGBM — 三段階AIリアルタイム解析
          </p>
        </div>

        {/* Tabs — the core UI */}
        <RaceTabs jcd={jcd} rno={rno} venueName={venueName} />
      </main>
    </div>
  );
}
