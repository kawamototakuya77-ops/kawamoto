import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "競艇直前物理AI - レース予測";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: Promise<{ id: string }>;
}

function parseRaceId(id: string) {
  // Format: "suminoe-10r" → { venue: "住之江", rno: "10R" }
  const venueMap: Record<string, string> = {
    kiryu: "桐生", toda: "戸田", edogawa: "江戸川", heiwajima: "平和島",
    tamagawa: "多摩川", hamanako: "浜名湖", gamagori: "蒲郡", tsurumi: "津",
    mikuni: "三国", biwako: "びわこ", suminoe: "住之江", amagasaki: "尼崎",
    naruto: "鳴門", marugame: "丸亀", kojima: "児島", miyajima: "宮島",
    tokuyama: "徳山", shimonoseki: "下関", wakamatsu: "若松", ashiya: "芦屋",
    omuta: "大牟田", karatsu: "唐津", fukuoka: "福岡", saga: "佐賀",
  };
  const parts = id.split("-");
  const venueKey = parts.slice(0, -1).join("-");
  const rno = parts[parts.length - 1]?.toUpperCase() || "";
  const venue = venueMap[venueKey] || venueKey;
  return { venue, rno };
}

export default async function OgImage({ params }: Props) {
  const { id } = await params;
  const { venue, rno } = parseRaceId(id);

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Badge */}
        <div
          style={{
            background: "rgba(16,185,129,0.15)",
            border: "1px solid rgba(16,185,129,0.4)",
            borderRadius: "999px",
            padding: "8px 20px",
            color: "#34d399",
            fontSize: "20px",
            fontWeight: 900,
            marginBottom: "24px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          AI Powered · リアルタイム予測
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "white",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}
        >
          {venue} {rno}
        </div>
        <div
          style={{
            fontSize: "36px",
            fontWeight: 700,
            background: "linear-gradient(90deg, #34d399, #2dd4bf)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: "40px",
          }}
        >
          LIVE AI 推論 · EV フィルター解析済み
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: "24px",
            color: "#94a3b8",
            fontWeight: 600,
          }}
        >
          競艇直前物理AI — Gemini Flash × LightGBM
        </div>
      </div>
    ),
    { ...size }
  );
}
