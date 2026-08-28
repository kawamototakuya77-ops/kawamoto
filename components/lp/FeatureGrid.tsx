const features = [
  {
    icon: "🎯",
    title: "3段階AI予測",
    desc: "事前（一次）→ 展示確定（LIVE AI 推論）→ 気象急変（三次）の自動連鎖。深夜から締切直前まで完全自動監視。",
    color: "emerald",
  },
  {
    icon: "🛡️",
    title: "資金防衛AI（バンクロール・ディフェンダー）",
    desc: "EVフィルターでEV1.2未満の買い目を自動除外。期待値が低いレースは「見送り推奨」を即時判定。",
    color: "rose",
  },
  {
    icon: "📊",
    title: "選手AIスコア（OVR）",
    desc: "勝率・モーター・展示タイムを統合しS/A/B/C/Dの5段階でスコア化。一目で戦力を把握できる。",
    color: "indigo",
  },
  {
    icon: "⚡",
    title: "Firebase リアルタイム同期",
    desc: "24場のデータをFirebase Realtime DBに即時反映。ポーリング不要で画面が自動更新される。",
    color: "amber",
  },
];

const colorMap: Record<string, string> = {
  emerald: "border-emerald-500/30 bg-emerald-500/5",
  rose: "border-rose-500/30 bg-rose-500/5",
  indigo: "border-indigo-500/30 bg-indigo-500/5",
  amber: "border-amber-500/30 bg-amber-500/5",
};

export default function FeatureGrid() {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-black text-white font-outfit text-center">
        選ばれる理由
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div
            key={f.title}
            className={`rounded-2xl p-5 border ${colorMap[f.color]} space-y-3`}
          >
            <div className="text-3xl">{f.icon}</div>
            <div>
              <h3 className="text-base font-black text-white leading-snug mb-1">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
