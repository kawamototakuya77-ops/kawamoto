/** 予測データの型定義 */

export interface RacerData {
  lane: number;
  name: string;
  cls: string;         // 選手級別 (A1/A2/B1/B2)
  rate: string | number;
  motor_rate: string | number;
  regNo?: string;
  ex_time?: string;
  tilt?: string;
  st_val?: string;
  st_course?: string;
  overall_score?: number;
  score_grade?: "S" | "A" | "B" | "C" | "D";
  lap_time?: string;
  turn_time?: string;
  straight_time?: string;
  
  // カスタムAI評価スコア
  ai_scores?: {
    win: number;
    start: number;
    escape: number;
    turn: number;
    maint: number;
    safety: number;
  };
}

export interface WeatherData {
  temp: string | number;
  weather: string;
  wind_speed: string | number;
  wind_dir_name: string;
  water_temp: string | number;
  wave_height: string | number;
}

export interface AiResult {
  comment: string;
  escape_rate: string | number | null;
  solid_focus: string[];
  upset_focus: string[];
  confidence?: string | null;
  ev_details?: Record<string, number>;
  recommendation_reason?: string;
}

export interface PredictionData {
  phase: number;               // 0=なし, 1=事前, 2=LIVE AI推論, 3=気象急変
  exhibition_completed?: boolean;
  ai: AiResult;
  data: RacerData[];
  weather?: WeatherData | null;
  result?: {
    combo: string;
    payout?: number;
    is_hit: boolean;
  } | null;
  cutoff_str?: string;
}

export interface RaceScheduleEntry {
  jcd: string;
  rno: number;
  venue_name: string;
  cutoff_str: string;
}
