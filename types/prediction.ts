/** 予測データの型定義 */

export interface RacerData {
  lane: number;
  name: string;
  cls: string;         // 選手級別 (A1/A2/B1/B2)
  rate: number;        // 勝率
  motor_rate: number;  // モーター勝率
  regNo: string;       // 登録番号
  ex_time: string;     // 展示タイム
  tilt: string;        // チルト
  st_val: string;      // スタートタイミング
  st_course: string;   // 進入コース
  overall_score?: number; // AIスコア
  score_grade?: "S" | "A" | "B" | "C" | "D";
}

export interface WeatherData {
  temp: number;
  weather: string;
  wind_speed: number;
  wind_dir_name: string;
  water_temp: number;
  wave_height: number;
}

export interface AiResult {
  comment: string;
  escape_rate: number;
  solid_focus: string[];   // 本命フォーカス
  upset_focus: string[];   // 穴フォーカス
  confidence?: string;     // A/B/C
  ev_details?: Record<string, number>;
  recommendation_reason?: string;
}

export interface PredictionData {
  phase: 1 | 2 | 3;
  exhibition_completed: boolean;
  ai: AiResult;
  data: RacerData[];
  weather: WeatherData;
  result?: {
    combo: string;
    payout: number;
    is_hit: boolean;
  };
  cutoff_str?: string;
}

export interface RaceScheduleEntry {
  jcd: string;
  rno: number;
  venue_name: string;
  cutoff_str: string;
}
