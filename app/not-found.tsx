import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 text-center space-y-6">
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
          404 ERROR
        </span>
        <h1 className="text-3xl font-black font-outfit text-white">ページが見つかりません</h1>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          指定されたURLは変更されたか、削除された可能性があります。
        </p>
      </div>

      <Link
        href="/"
        className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-950 hover:brightness-110 transition-all"
      >
        🏠 競艇直前物理AI トップへ戻る
      </Link>
    </div>
  );
}
