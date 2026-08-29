import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const GAS_URL = process.env.GAS_API_URL || "https://script.google.com/macros/s/AKfycbyvJwPQZXBaFeh6DA3GnTDTapqRaOg7OEJHiBmhEDrqO3--CkpbEgZQbcjGvxQo_XLm/exec";

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    // 日本時間 (JST)
    const jstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const month = jstTime.getUTCMonth() + 1;
    const date = jstTime.getUTCDate();

    let hits: Array<{ venue: string; combo: string; payout: string; dateLabel: string; rank: string }> = [];
    
    // GAS または DB から実測的中実績を取得
    try {
      const dateStr = `${jstTime.getUTCFullYear()}${String(month).padStart(2, "0")}${String(date).padStart(2, "0")}`;
      const res = await fetch(`${GAS_URL}?action=get_predictions_only&pass=BATCH_INTERNAL_ACCESS_2026&date=${dateStr}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
        signal: AbortSignal.timeout(4000),
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.predictions) {
          for (const k of Object.keys(json.predictions)) {
            const p = json.predictions[k];
            const resObj = p.result || p.actual_result;
            if (resObj && (resObj.is_hit || resObj.actual_payout > 0)) {
              const vName = p.venue_name || p.jcd;
              const rNo = p.rno;
              const combo = resObj.combo || resObj.winning_combo || "";
              const payoutVal = Number(resObj.payout || resObj.actual_payout || 0);
              const payoutStr = payoutVal > 0 ? `${payoutVal.toLocaleString()}円` : "的中";
              hits.push({
                venue: `${vName} ${rNo}R`,
                combo: combo,
                payout: payoutStr,
                dateLabel: `本日 ${month}/${date} 確定`,
                rank: p.confidence || "S"
              });
            }
          }
        }
      }
    } catch (e) {
      // GAS通信不可時は完全安全な過去実測データ
    }

    // 本日の的中がまだ確定していない場合（朝・日中前半）、前日・前々日のGASデータを探索
    if (hits.length === 0) {
      for (let daysAgo = 1; daysAgo <= 3; daysAgo++) {
        try {
          const pastDate = new Date(jstTime.getTime() - daysAgo * 24 * 60 * 60 * 1000);
          const pMonth = pastDate.getUTCMonth() + 1;
          const pDate = pastDate.getUTCDate();
          const pDateStr = `${pastDate.getUTCFullYear()}${String(pMonth).padStart(2, "0")}${String(pDate).padStart(2, "0")}`;

          const res = await fetch(`${GAS_URL}?action=get_predictions_only&pass=BATCH_INTERNAL_ACCESS_2026&date=${pDateStr}`, {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache" },
            signal: AbortSignal.timeout(3000),
          });

          if (res.ok) {
            const json = await res.json();
            if (json && json.predictions) {
              for (const k of Object.keys(json.predictions)) {
                const p = json.predictions[k];
                const resObj = p.result || p.actual_result;
                if (resObj && (resObj.is_hit || resObj.actual_payout > 0)) {
                  const vName = p.venue_name || p.jcd;
                  const rNo = p.rno;
                  const combo = resObj.combo || resObj.winning_combo || "";
                  const payoutVal = Number(resObj.payout || resObj.actual_payout || 0);
                  const payoutStr = payoutVal > 0 ? `${payoutVal.toLocaleString()}円` : "的中";
                  hits.push({
                    venue: `${vName} ${rNo}R`,
                    combo: combo,
                    payout: payoutStr,
                    dateLabel: `${pMonth}/${pDate} 確定実績`,
                    rank: p.confidence || "S"
                  });
                }
              }
            }
          }
          if (hits.length > 0) break; // 直近の日の的中が見つかったら終了
        } catch (_) {}
      }
    }

    return NextResponse.json(
      {
        success: true,
        hits: hits,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        }
      }
    );
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      hits: []
    });
  }
}
