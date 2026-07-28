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
        <p className="text-sm text-slate-600 leading-relaxed">
          ※ 当サービスの予想は参考情報です。舟券の購入は自己責任でお願いします。AI判定・EV基準値は統計的根拠に基づきますが、万舟や特殊展開を完全には予測できません。
        </p>
      </div>
    </footer>
  );
}
