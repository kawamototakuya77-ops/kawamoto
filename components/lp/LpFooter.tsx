import Link from "next/link";

export default function LpFooter() {
  return (
    <footer className="mt-16 border-t border-white/5 py-8">
      <div className="max-w-lg mx-auto px-4 space-y-3 text-center">
        <p className="text-sm font-bold text-slate-400">競艇直前物理AI</p>
        <div className="flex justify-center gap-4">
          <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            プライバシーポリシー
          </Link>
          <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            利用規約
          </Link>
        </div>
        <p className="text-sm text-slate-600">
          © 2026 競艇直前物理AI. All rights reserved.
        </p>
        <div className="text-[11px] text-slate-500/80 leading-relaxed text-left bg-slate-900/60 p-4 rounded-xl border border-white/5 space-y-1.5 mt-4">
          <p className="font-bold text-slate-400">【免責事項 兼 ご利用上の注意】</p>
          <p>
            1. 本サービス（競艇直前物理AI）は、競艇の過去統計データおよび直前展示タイム等の物理指標をアルゴリズムにより独自解析・可視化する「データ分析・統計表示ソフトウェア」です。
          </p>
          <p>
            2. 本サービスは勝馬投票券（舟券）の購入代行、賭博行為の勧誘、あるいは特定の収支・的中結果を保証するものではありません。
          </p>
          <p>
            3. 本サービスの提供情報に基づいて行われたいかなる取引、舟券購入、投資判断、およびそれに伴う損害・不利益について、運営者は理由の如何を問わず一切の責任および補償を負いません。舟券の購入は必ずご自身の判断と責任において無理のない範囲で行ってください。
          </p>
        </div>
      </div>
    </footer>
  );
}
