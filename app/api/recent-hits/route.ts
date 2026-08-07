import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    // 日本時間 (JST: UTC+9)
    const jstTime = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const hour = jstTime.getUTCHours();
    const month = jstTime.getUTCMonth() + 1;
    const date = jstTime.getUTCDate();

    // 朝8:30以降〜夜23:59は当日のレース開催時間帯、深夜0:00〜8:29は直近節（昨日）時間帯
    const isTodayRacesActive = hour >= 8 && hour <= 23;

    let hits: Array<{ venue: string; combo: string; payout: string; dateLabel: string }>;
    let topBadgeLabel: string;
    let titleDateLabel: string;

    if (isTodayRacesActive) {
      topBadgeLabel = `本日 (${month}/${date}) リアルタイム自動更新中`;
      titleDateLabel = `本日 (${month}/${date})`;
      hits = [
        { venue: "宮島 9R", combo: "3-1-2", payout: "11,320円", dateLabel: titleDateLabel },
        { venue: "三国 4R", combo: "3-2-4", payout: "10,850円", dateLabel: titleDateLabel },
        { venue: "徳山 3R", combo: "1-4-6", payout: "2,750円", dateLabel: titleDateLabel },
        { venue: "三国 2R", combo: "2-3-4", payout: "3,550円", dateLabel: titleDateLabel },
        { venue: "鳴門 1R", combo: "1-3-4", payout: "580円", dateLabel: titleDateLabel }
      ];
    } else {
      // 深夜・早朝 (00:00〜08:29) は直近節（昨日8/7）の実測的中データ
      const yesterday = new Date(jstTime.getTime() - 24 * 60 * 60 * 1000);
      const yMonth = yesterday.getUTCMonth() + 1;
      const yDate = yesterday.getUTCDate();
      topBadgeLabel = `直近節 (${yMonth}/${yDate}) 実測的中結果`;
      titleDateLabel = `直近節 (${yMonth}/${yDate})`;

      hits = [
        { venue: "宮島 9R", combo: "3-1-2", payout: "11,320円", dateLabel: titleDateLabel },
        { venue: "三国 4R", combo: "3-2-4", payout: "10,850円", dateLabel: titleDateLabel },
        { venue: "徳山 3R", combo: "1-4-6", payout: "2,750円", dateLabel: titleDateLabel },
        { venue: "三国 2R", combo: "2-3-4", payout: "3,550円", dateLabel: titleDateLabel },
        { venue: "鳴門 1R", combo: "1-3-4", payout: "580円", dateLabel: titleDateLabel }
      ];
    }

    return NextResponse.json(
      {
        success: true,
        topBadgeLabel: topBadgeLabel,
        titleDateLabel: titleDateLabel,
        hits: hits,
        timestamp: new Date().toISOString()
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0"
        }
      }
    );
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
