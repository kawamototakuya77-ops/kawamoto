"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import LpHeader from "@/components/lp/LpHeader";
import LpFooter from "@/components/lp/LpFooter";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [licenseKey, setLicenseKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      licenseKey,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("メールアドレスまたはライセンスキーが正しくありません。");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      <LpHeader />
      <div className="w-full max-w-sm mx-auto px-4 pt-28 pb-16 space-y-6">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
          </div>
          <h1 className="text-2xl font-black text-white font-outfit">ログイン</h1>
          <p className="text-sm text-slate-400">
            登録済みのメールアドレスとライセンスキーを入力してください
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-sm font-bold text-slate-300">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full min-h-[48px] px-4 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors placeholder:text-slate-600"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="licenseKey" className="block text-sm font-bold text-slate-300">
              ライセンスキー
            </label>
            <input
              id="licenseKey"
              type="password"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              required
              placeholder="••••••••••••••••"
              className="w-full min-h-[48px] px-4 rounded-xl bg-slate-900 border border-white/10 text-white text-sm focus:outline-none focus:border-emerald-500/60 transition-colors placeholder:text-slate-600"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/30 text-sm text-rose-300 font-bold">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full min-h-[52px] rounded-xl text-base font-black text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: "linear-gradient(135deg, #10b981, #0d9488)" }}
          >
            {loading ? "認証中..." : "🔐 ログイン"}
          </button>
        </form>

        {/* Back to LP */}
        <div className="text-center">
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">
            ← トップページに戻る
          </Link>
        </div>
      </div>
      <LpFooter />
    </div>
  );
}
