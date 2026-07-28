import type { RacerData } from "@/types/prediction";

export interface ComputedScores {
  overall: number;   // 総合力
  motor: number;     // モーター力
  start: number;     // スタート力
  turn: number;      // 旋回力
  straight: number;  // 直線力
  escape: number;    // イン信頼度
}

export function computeRacerScores(
  racer: RacerData,
  globalScores: Record<string, any>
): ComputedScores | null {
  const rScore = racer.regNo ? globalScores[racer.regNo] : null;
  if (!rScore) return null;

  // Helpers
  const parseNum = (val: any): number | null => {
    if (val === undefined || val === null || val === "N/A" || val === "--") return null;
    const n = typeof val === "number" ? val : parseFloat(val);
    return isNaN(n) ? null : n;
  };
  const clamp = (val: number) => Math.min(100, Math.max(0, Math.round(val)));

  // Raw values
  const winRate = parseNum(racer.rate) ?? 5.0;
  const motorRate = parseNum(racer.motor_rate) ?? 30.0;
  const stVal = parseNum(racer.st_val);
  const exTime = parseNum(racer.ex_time);
  const lapTime = parseNum(racer.lap_time);
  const turnTime = parseNum(racer.turn_time);
  const straightTime = parseNum(racer.straight_time);
  const tilt = parseNum(racer.tilt);

  // 1. 総合力 (Overall Ability)
  // Win rate normalized (3.0 - 8.5) -> 0-100 scale
  const winRateScore = clamp(((winRate - 3.0) / 5.5) * 100);
  const overall = clamp(rScore.win * 0.4 + rScore.safety * 0.2 + winRateScore * 0.4);

  // 2. モーター力 (Motor Power)
  // Motor rate normalized (20% - 50%) -> 0-100 scale
  const motorRateScore = clamp(((motorRate - 20) / 30) * 100);
  const motor = clamp(rScore.maint * 0.6 + motorRateScore * 0.4);

  // 3. スタート力 (Start Ability)
  // ST normalizes from 0.22 (0) to 0.10 (100)
  let stScore = 50;
  if (stVal !== null) {
    stScore = clamp(((0.22 - stVal) / 0.12) * 100);
  } else {
    stScore = rScore.start; // Fallback to raw AI start score
  }
  const start = clamp(rScore.start * 0.6 + stScore * 0.4);

  // 4. 旋回力 (Cornering)
  // Turn time normalizes around a typical baseline (e.g., lower is better). 
  // If turn/lap time is missing, we use motor & AI turn score heavily.
  let turnBonus = 0;
  if (turnTime !== null) {
     // typical turn time ~ 4.5s
     turnBonus = (4.7 - turnTime) * 100; 
  } else if (lapTime !== null) {
     // typical lap time ~ 36.5s
     turnBonus = (37.0 - lapTime) * 20; 
  }
  const turn = clamp(rScore.turn * 0.7 + Math.max(0, turnBonus) * 0.3);

  // 5. 直線力 (Straight Speed)
  // Exhibition time is heavily correlated with straight speed
  let straightBonus = 0;
  if (straightTime !== null) {
    // typical straight time ~ 6.5s
    straightBonus = (6.8 - straightTime) * 100;
  } else if (exTime !== null) {
    // typical ex time ~ 6.7s
    straightBonus = (7.0 - exTime) * 100;
  }
  // Tilt bonus (positive tilt usually increases straight speed at cost of turn)
  const tiltBonus = tilt !== null && tilt > 0 ? tilt * 10 : 0;
  const straight = clamp(motorRateScore * 0.3 + rScore.maint * 0.3 + Math.max(0, straightBonus) * 0.3 + tiltBonus);

  // 6. イン信頼度 (In-Course Reliability)
  const escape = clamp(rScore.escape * 0.7 + winRateScore * 0.3);

  return { overall, motor, start, turn, straight, escape };
}
