import React from "react";

export default function PricingTable() {
  const plans = [
    {
      name: "無料お試し",
      price: "¥0",
      period: "（登録不要）",
      badge: "まず体験",
      features: [
        "✅ 24場 全開催グリッド閲覧",
        "✅ 出走表＆全国/当地勝率データ",
        "✅ 直前展示タイム＆スタート順位",
        "❌ 2次予想（LIVE AI解禁）",
        "❌ 期待値(EV)フィルター",
        "❌ 資金防衛AI（ケン判定）",
      ],
      cta: "登録不要で今すぐ体験",
      href: "/dashboard",
      isExternal: false,
      cardClass: "bg-slate-900/60 border border-slate-700/50 backdrop-blur-md",
      ctaClass: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/50",
    },
    {
      name: "単発予想（1R解禁）",
      price: "¥100",
      period: "/ 1レース",
      badge: "本命勝負に！",
      features: [
        "✅ 指定1レースの2次予想（直前AI推論）",
        "✅ 直前展示の物理解析スコア（OVR）",
        "✅ 期待値(EV1.2以上)買い目選別",
        "✅ リアルタイム展開予想（逃げ/差し/まくり）",
        "❌ 24場 全レース見放題",
        "❌ LINE直前AI速報配信",
      ],
      cta: "🎯 レース一覧から勝負レースを選ぶ",
      href: "/dashboard",
      isExternal: false,
      cardClass: "bg-slate-900/80 border-2 border-teal-500/40 shadow-[0_0_20px_rgba(20,184,166,0.15)]",
      ctaClass: "bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-extrabold shadow-lg",
    },
    {
      name: "プロプラン (PRO)",
      price: "¥1,980",
      period: "/月",
      badge: "人気 No.1 / 推奨",
      features: [
        "✅ 全国24場・全レースリアルタイム完全解禁",
        "✅ 直前展示の『偽物』を暴く物理解析エンジン",
        "✅ 資金防衛AI（見送り・ケン判定自動アラート）",
        "✅ 期待値1.2以上の激アツ買い目を自動抽出",
        "✅ LINE直前AI速報通知（締切10分前）",
        "✅ 月間回収率(ROI)＆的中実績リアルタイムログ",
      ],
      cta: "👑 PROプランを即時解禁 (月額1,980円)",
      href: "https://buy.stripe.com/14A9AT6E6aBY0pHbDFgjC02",
      isExternal: true,
      cardClass: "bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.25)] relative overflow-hidden",
      ctaClass: "bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-sm shadow-xl tracking-wider",
    },
  ];

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono tracking-widest uppercase">
          Pricing Plans
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white font-outfit tracking-tight">
          目的とスタイルに合わせた <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">3つの明確な料金体系</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          感情・思惑を一切排除した冷徹なデータ解析。100円の単発アンロックから、月額1,980円のPRO完全解禁まで。
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((plan, idx) => (
          <div key={idx} className={`rounded-2xl p-6 flex flex-col justify-between ${plan.cardClass}`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  {plan.badge}
                </span>
              </div>
              <h3 className="text-lg font-black text-white mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-3xl sm:text-4xl font-black text-white font-outfit">{plan.price}</span>
                <span className="text-xs text-slate-400 font-medium">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 text-xs text-slate-300">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-2 leading-relaxed">
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              {plan.isExternal ? (
                <a
                  href={plan.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-3.5 px-4 text-center rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${plan.ctaClass}`}
                >
                  {plan.cta}
                </a>
              ) : (
                <a
                  href={plan.href}
                  className={`block w-full py-3.5 px-4 text-center rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] ${plan.ctaClass}`}
                >
                  {plan.cta}
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-500 mt-8">
        Stripeによる暗号化安全決済（クレジットカード / Apple Pay 対応）。
      </p>
    </section>
  );
}
