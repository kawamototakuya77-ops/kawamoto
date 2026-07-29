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
        <div className="text-[11px] text-slate-400 leading-relaxed text-left bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2 mt-4">
          <p className="font-bold text-slate-300 border-b border-slate-800 pb-1">【法的免責事項 兼 ご利用規約】</p>
          <p>
            1. 本サービス（競艇直前物理AI）は、モーターボート競走に関する過去の統計データおよび展示タイム等の物理指標を独自アルゴリズムにより解析・可視化する「データ分析・情報提供ソフトウェア」です。
          </p>
          <p>
            2. 本サービスは、勝舟投票券（舟券）の購入代行、賭博行為への勧誘、あるいは特定の経済的利益や的中結果を保証するものではありません。
          </p>
          <p>
            3. モーターボート競走法および関係法令に基づき、20歳未満の者の勝舟投票券の購入・譲り受けは法律で禁止されています。
          </p>
          <p>
            4. 本サービスの提供情報に基づいて行われたいかなる取引、勝舟投票券の購入、投資判断、およびそれに伴い生じた損害・不利益について、運営者は理由の如何を問わず一切の法的責任および補償義務を負いません。舟券の購入は必ずご自身の判断と責任において無理のない範囲で行ってください。
          </p>
        </div>
      </div>
    </footer>
  );
}
