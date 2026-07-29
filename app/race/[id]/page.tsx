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

// JCD -> スラグ / 名前 逆引きマップ
const JCD_MAP: Record<string, { name: string; slug: string; jcd: string }> = {
  "01": { name: "桐生", slug: "kiryu", jcd: "01" }, "02": { name: "戸田", slug: "toda", jcd: "02" },
  "03": { name: "江戸川", slug: "edogawa", jcd: "03" }, "04": { name: "平和島", slug: "heiwajima", jcd: "04" },
  "05": { name: "多摩川", slug: "tamagawa", jcd: "05" }, "06": { name: "浜名湖", slug: "hamanako", jcd: "06" },
  "07": { name: "蒲郡", slug: "gamagori", jcd: "07" }, "08": { name: "常滑", slug: "tokoname", jcd: "08" },
  "09": { name: "津", slug: "tsu", jcd: "09" }, "10": { name: "三国", slug: "mikuni", jcd: "10" },
  "11": { name: "びわこ", slug: "biwako", jcd: "11" }, "12": { name: "住之江", slug: "suminoe", jcd: "12" },
  "13": { name: "尼崎", slug: "amagasaki", jcd: "13" }, "14": { name: "鳴門", slug: "naruto", jcd: "14" },
  "15": { name: "丸亀", slug: "marugame", jcd: "15" }, "16": { name: "児島", slug: "kojima", jcd: "16" },
  "17": { name: "宮島", slug: "miyajima", jcd: "17" }, "18": { name: "徳山", slug: "tokuyama", jcd: "18" },
  "19": { name: "下関", slug: "shimonoseki", jcd: "19" }, "20": { name: "若松", slug: "wakamatsu", jcd: "20" },
  "21": { name: "芦屋", slug: "ashiya", jcd: "21" }, "22": { name: "福岡", slug: "fukuoka", jcd: "22" },
  "23": { name: "唐津", slug: "karatsu", jcd: "23" }, "24": { name: "大村", slug: "omura", jcd: "24" },
};

function parseRaceId(id: string): { venueSlug: string; rno: number; venueName: string; jcd: string } {
  const parts = id.split("-");
  const rnoStr = parts[parts.length - 1];
  const rno = parseInt(rnoStr?.replace(/r$/i, "") || "1", 10);
  const rawVenue = parts.slice(0, -1).join("-");
  
  // 数字JCD (例: "14" や "01") の場合
  const normalizedJcd = rawVenue.padStart(2, "0");
  if (JCD_MAP[normalizedJcd]) {
    const v = JCD_MAP[normalizedJcd];
    return { venueSlug: v.slug, rno, venueName: v.name, jcd: v.jcd };
  }

  // スラグ名 (例: "naruto") の場合
  const venue = VENUE_MAP[rawVenue];
  return {
    venueSlug: rawVenue,
    rno,
    venueName: venue?.name ?? rawVenue,
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
