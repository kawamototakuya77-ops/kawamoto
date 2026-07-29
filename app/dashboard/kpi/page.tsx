import React from 'react';

export default function KPIDashboard() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          <span className="text-emerald-500">📊</span>
          マーケティングKPI 定点観測ダッシュボード
        </h1>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 sm:p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-400">GA4 解析</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-lg sm:text-2xl font-black text-emerald-400">計測稼働</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-mono truncate">G-YZ7SH1JBXG</p>
          </div>

          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 sm:p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-400">Stripe 決済</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-lg sm:text-2xl font-black text-emerald-400">自動課金</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">3日無料体験</p>
          </div>

          <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4 sm:p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-400">LINE 通知</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <p className="text-lg sm:text-2xl font-black text-emerald-400">本番送信</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1 font-mono truncate">@089aloaj</p>
          </div>

          <div className="bg-slate-900 border border-indigo-500/30 rounded-xl p-4 sm:p-6 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-400">自律PDCA</h3>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            </div>
            <p className="text-lg sm:text-2xl font-black text-indigo-400">自動監視</p>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">目標 CVR 3%</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">定点観測の運用フロー（毎朝のチェックリスト）</h2>
          <div className="space-y-4 text-sm text-slate-300">
            <div className="flex gap-4 items-start pb-4 border-b border-slate-800">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <p className="font-bold text-white mb-1">トラフィックの確認 (GA4)</p>
                <p>Google Analyticsの「レポート」＞「集客」＞「トラフィック獲得」を開き、<code className="text-emerald-400 bg-emerald-400/10 px-1 rounded">utm_campaign=pre_race_funnel</code> 経由のセッション数を確認します。これが1日100件未満なら、Xの露出（インプレッション）自体が足りていません。</p>
              </div>
            </div>
            
            <div className="flex gap-4 items-start pb-4 border-b border-slate-800">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <p className="font-bold text-white mb-1">コンバージョンの確認 (GA4 / Stripe)</p>
                <p>GA4のイベント <code className="text-rose-400 bg-rose-400/10 px-1 rounded">begin_checkout</code> の発生数、およびStripeの新規トライアル開始数を確認します。トラフィック100に対してCVが3未満（CVR 3%未満）の場合、LPの煽り文句か価格設定に問題があります。</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <p className="font-bold text-white mb-1">解約率（チャーンレート）の確認 (Stripe)</p>
                <p>トライアルの3日後に本課金へ移行せずキャンセルしたユーザーの割合を確認します。これが50%を超える場合、ツールの精度自体（的中結果）か、毎日のメール/LINEでのフォローアップ（実績アピール）が不足しています。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
