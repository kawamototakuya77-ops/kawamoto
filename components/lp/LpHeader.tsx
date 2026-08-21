import Link from "next/link";

export default function LpHeader() {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-4 py-3 border-b border-white/5 shadow-lg"
      style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-lg font-black text-white font-outfit tracking-tight">
            競艇直前物理AI
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/hits"
            className="px-3 py-1.5 rounded-full text-xs font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-colors"
          >
            📊 的中・回収率ログ
          </Link>
          <Link
            href="/login"
            className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-200 bg-slate-800/80 border border-white/10 hover:bg-slate-700 transition-colors"
          >
            🔑 ログイン
          </Link>
        </div>
      </div>
    </header>
  );
}
