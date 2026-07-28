import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | 競艇直前物理AI",
};

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-black text-white font-outfit">プライバシーポリシー</h1>

        <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-black text-white">1. 取得する情報</h2>
            <p>当サービスでは、ご利用にあたり以下の情報を取得します。</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>メールアドレス（ログイン・ライセンス認証のため）</li>
              <li>Stripe 決済情報（決済処理はStripeが管理。カード番号は当サービスに保存されません）</li>
              <li>アクセスログ（Vercel により自動収集）</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">2. 情報の利用目的</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>サービスの提供・認証・サポート対応</li>
              <li>サービスの改善・障害対応</li>
              <li>重要なお知らせの送付</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">3. 第三者への提供</h2>
            <p>法令に基づく場合を除き、取得した個人情報を第三者に提供することはありません。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">4. 利用するサービス</h2>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Stripe（決済処理）</li>
              <li>Google Apps Script / Sheets（データ管理）</li>
              <li>Vercel（ホスティング・アクセスログ）</li>
              <li>Google AI（AI予測処理）</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">5. Cookie・アクセス解析</h2>
            <p>当サービスではセッション管理のためにCookieを使用します。ブラウザの設定で無効にすることができますが、一部機能が使用できなくなる場合があります。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">6. 個人情報の開示・削除</h2>
            <p>登録情報の開示・訂正・削除をご希望の場合は、サポートまでお問い合わせください。</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-black text-white">7. プライバシーポリシーの変更</h2>
            <p>本ポリシーは予告なく変更される場合があります。変更後はこのページに掲載します。</p>
          </section>

          <p className="text-slate-500 pt-4">制定日：2026年7月</p>
        </div>
      </main>
    </div>
  );
}
