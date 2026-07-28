/**
 * 料金比較表 — 松竹梅の法則 / アンカリング効果
 * プロプラン(1,980円)を「推奨・人気 No.1」として視覚的に強調
 */
export default function PricingTable() {
  const plans = [
    {
      name: "ライトプラン",
      price: "¥500",
      period: "/月",
      badge: null,
      features: [
        "✅ 事前AI予想（一次予想）",
        "✅ 全国24場 開催状況グリッド",
        "✅ 選手基本情報",
        "❌ LIVE AI 推論（二次予想）",
        "❌ 資金防衛AI（バンクロール・ディフェンダー）",
        "❌ EVフィルター（EV1.2以上の選別）",
      ],
      cta: "ライトプランで始める",
      href: "https://buy.stripe.com/eVq6oH9Qi39w3BT8rtgjC01",
      cardClass: "bg-slate-900/60 border border-white/10",
      ctaClass: "bg-slate-700 hover:bg-slate-600 text-white",
    },
    {
      name: "プロプラン (PRO)",
      price: "¥1,980",
      period: "/月",
      badge: "人気 No.1 / 推奨",
      features: [
        "✅ 事前AI予想（一次予想）",
        "✅ 全国24場 開催状況グリッド",
        "✅ 選手AIスコア（OVR S/A/B/C/D）",
        "✅ LIVE AI 推論（二次予想）",
        "✅ 資金防衛AI（バンクロール・ディフェンダー）",
        "✅ EVフィルター（EV1.2以上の選別）",
      ],
      cta: "最初の3日間無料トライアルで始める",
      href: "https://buy.stripe.com/14A9AT6E6aBY0pHbDFgjC02",
      cardClass:
        "bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.15)]",
      ctaClass:
        "text-white font-black",
    },
  ];

  return (
    <section className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-white font-outfit">プランを選ぶ</h2>
        <p className="text-sm text-slate-400">本命的中・無駄な投資ゼロを両立したいならプロプラン</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.name} className={`relative rounded-3xl p-6 space-y-5 ${plan.cardClass}`}>
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 rounded-full text-sm font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg whitespace-nowrap">
                  {plan.badge}
                </span>
              </div>
            )}

            <div>
              <p className="text-sm font-bold text-slate-400 mb-1">{plan.name}</p>
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-white font-outfit">{plan.price}</span>
                <span className="text-base text-slate-500 mb-1">{plan.period}</span>
              </div>
              {plan.badge && (
                <div className="mt-2 text-xs font-bold text-rose-400 bg-rose-900/30 border border-rose-500/30 px-2 py-1 rounded inline-block">
                  ※ β版リリース記念: 先着50名様限定 (残り3枠)
                </div>
              )}
            </div>

            <ul className="space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="text-sm text-slate-300 leading-snug">
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={plan.href}
              className={`block w-full py-3.5 text-center text-base font-black rounded-xl transition-all active:scale-[0.98] ${plan.ctaClass}`}
              style={
                plan.badge
                  ? { background: "linear-gradient(135deg, #10b981, #0d9488)" }
                  : undefined
              }
            >
              {plan.cta}
            </a>
          </div>
        ))}
      </div>

      <p className="text-sm text-slate-500 text-center">
        ※ クレジットカード不要・Stripeで安全決済・いつでも解約可
      </p>
    </section>
  );
}
