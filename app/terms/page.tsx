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
            <h2 className="text-base font-black text-white">第1条（適用）</h2>
            <p>本規約は、競艇直前物理AI（以下「当サービス」）の利用に関する条件を定めるものです。ユーザーは本規約に同意した上でサービスをご利用ください。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">第2条（サービスの内容）</h2>
            <p>当サービスは、競艇レースのAI予測情報を提供するサービスです。予測情報はあくまで参考情報であり、舟券の的中・収益を保証するものではありません。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">第3条（免責事項）</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>当サービスの予測情報に基づいた投資判断はユーザー自身の責任で行ってください</li>
              <li>AIの予測精度・的中率を保証するものではありません</li>
              <li>通信障害・システム障害による損害について責任を負いません</li>
              <li>公営競技は18歳未満の方は購入できません</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">第4条（料金・支払い）</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>ライトプラン：月額500円（税込）</li>
              <li>プロプラン：月額1,980円（税込）</li>
              <li>支払いはStripeを通じて処理されます</li>
              <li>解約は次回更新日の前日までにお手続きください</li>
              <li>返金は原則として対応しておりません</li>
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
