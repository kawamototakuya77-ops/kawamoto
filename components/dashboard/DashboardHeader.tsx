import Link from "next/link";
import type { User } from "next-auth";

interface Props {
  user: User;
}

export default function DashboardHeader({ user }: Props) {
  const emailShort =
    user.email && user.email.length > 18
      ? user.email.slice(0, 18) + "…"
      : user.email;

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 px-4 py-3 border-b border-white/5 shadow-lg"
      style={{ background: "rgba(15,23,42,0.90)", backdropFilter: "blur(12px)" }}
    >
      <div className="max-w-lg mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-lg font-black text-white font-outfit tracking-tight">
            競艇直前物理AI
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Stats placeholder */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm text-slate-500 font-bold leading-none">🎯 本日のAI的中率</span>
            <span className="text-base font-black font-outfit text-indigo-400 leading-none">--%</span>
          </div>

          {/* User info */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-white/10">
            <span className="text-sm text-slate-300 font-bold">{emailShort || "ユーザー"}</span>
          </div>

          {/* Logout form */}
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="px-3 py-1.5 rounded-full text-sm font-bold text-slate-400 hover:text-white hover:bg-slate-700 border border-white/10 transition-colors"
            >
              ログアウト
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
