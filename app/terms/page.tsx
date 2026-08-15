import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約 | 競艇直前物理AI",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="px-4 py-4 border-b border-white/5">
        <div className="max-w-lg mx-auto">
          <Link href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
            ← トップページに戻る
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-10 space-y-8">
        <h1 className="text-2xl font-black text-white font-outfit">利用規約</h1>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-black text-white">第1条（適用およびサービス定義）</h2>
            <p>本規約は、ABYSS EXPLORER（以下「事業者」）が提供する「競艇直前物理AI」（以下「本サービス」）の利用条件を定めるものです。本サービスは、モーターボート競走に関する統計データおよび物理展示指標を独自アルゴリズムで解析・可視化するデータ分析・情報提供ソフトウェアです。勝舟投票券（舟券）の購入代行、賭博行為への勧誘、あるいは特定の経済的利益・的中結果を保証するものではありません。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">第2条（Stripe決済および特定商取引法に基づく表記）</h2>
            <ul className="list-disc list-inside space-y-1.5 text-slate-300">
              <li><strong>提供価格</strong>: PROプラン 月額1,980円（税込） / 単発予想 1レース 100円（税込）</li>
              
              <li><strong>自動継続課金</strong>: 無料期間終了までに解約手続きがない場合、4日目に初回月額料金（1,980円）が自動決済され、以降1ヶ月ごとに自動更新・課金されます。</li>
              <li><strong>決済手段</strong>: Stripe（クレジットカード・デビットカード決済）経由で安全に処理されます。</li>
              <li><strong>返金特約</strong>: デジタルコンテンツおよび月額SaaSサービスの性質上、決済完了後の返金・換金・日割計算には一切対応いたしかねます。</li>
              <li><strong>解約方法</strong>: 会員ダッシュボード画面またはサポート問い合わせより、次回更新日の前日までいつでも解約手続きが可能です。</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">第3条（厳格な免責事項および責任制限）</h2>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>本サービスが提供する数値・スコア・予測情報はAIアルゴリズムによる統計結果であり、実際のレース結果を保証するものではありません。</li>
              <li>モーターボート競走法第11条の定めにより、20歳未満の者は勝舟投票券（舟券）を購入・譲り受けることが禁止されています。</li>
              <li>本サービスの提供情報に基づいて行われた勝舟投票券の購入、投資判断、およびそれに伴い発生した損害・損失について、事業者は理由の如何を問わず一切の損害賠償責任・補償義務を負いません。</li>
              <li>通信障害、サーバー停止、外部データの遅延等により生じた損害についても一切の責任を負いません。</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">第4条（禁止事項）</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>アカウントまたはライセンスの第三者への譲渡・転売・共有</li>
              <li>当サービスのデータ・コンテンツの無断転載・スクレイピング・二次利用</li>
              <li>不正アクセス、不当景示法違反に該当する虚偽の宣伝行為</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">第5条（禁止事項）</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>ライセンスキーの第三者への譲渡・共有</li>
              <li>当サービスのデータ・コンテンツの無断転載・二次配布</li>
              <li>システムへの不正アクセス</li>
              <li>その他、当サービスが不適切と判断する行為</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">第6条（アカウントの停止）</h2>
            <p>禁止事項に違反した場合、予告なくアカウントを停止することがあります。この場合、利用料金の返金は行いません。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">第7条（規約の変更）</h2>
            <p>当サービスは予告なく本規約を変更することがあります。変更後の規約はこのページに掲載します。</p>
          </section>

          <p className="text-slate-500 pt-4">制定日：2026年7月</p>
        </div>
      </main>
    </div>
  );
}
