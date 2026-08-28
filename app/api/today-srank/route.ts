import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const jst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const y = jst.getUTCFullYear();
    const m = String(jst.getUTCMonth() + 1).padStart(2, "0");
    const d = String(jst.getUTCDate()).padStart(2, "0");
    const dateStr = `${y}${m}${d}`;
    const dateLabel = `${jst.getUTCMonth() + 1}/${jst.getUTCDate()}`;
    let sranks: Array<{ venue: string; rno: number; deadline: string; rank: string; ev: number | null }> = [];
    const gasUrl = process.env.GAS_API_URL || "https://script.google.com/macros/s/AKfycbyvJwPQZXBaFeh6DA3GnTDTapqRaOg7OEJHiBmhEDrqO3--CkpbEgZQbcjGvxQo_XLm/exec";
    try {
      const res = await fetch(`${gasUrl}?action=get_predictions_only&pass=BATCH_INTERNAL_ACCESS_2026&date=${dateStr}`, { cache: "no-store", headers: { "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const json = await res.json();
        if (json && json.predictions) {
          for (const k of Object.keys(json.predictions)) {
            const p = json.predictions[k];
            const confidence = (p.confidence || p.rank || "").toUpperCase();
            if (confidence === "S") {
              sranks.push({ venue: p.venue_name || p.jcd || k.split("-")[0], rno: Number(p.rno || k.split("-")[1] || 0), deadline: p.deadline || p.deadline_time || "--:--", rank: "S", ev: p.ev ? Number(Number(p.ev).toFixed(2)) : null });
            }
          }
          sranks.sort((a, b) => a.deadline.localeCompare(b.deadline));
        }
      }
    } catch (_) {}
    return NextResponse.json({ success: true, date: dateLabel, count: sranks.length, races: sranks }, { headers: { "Cache-Control": "no-store, no-cache, must-revalidate", "Pragma": "no-cache" } });
  } catch (_) {
    return NextResponse.json({ success: false, date: "", count: 0, races: [] });
  }
}