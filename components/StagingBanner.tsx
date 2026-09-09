"use client";

import { useEffect, useState } from "react";

export default function StagingBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isPreview =
    process.env.NEXT_PUBLIC_VERCEL_ENV === "preview" ||
    (typeof window !== "undefined" &&
      (window.location.hostname.includes("staging") ||
        window.location.hostname.includes("localhost")));

  if (!isPreview) return null;

  return (
    <div className="bg-amber-500 text-slate-950 px-4 py-1 text-xs font-black text-center sticky top-0 z-[100] shadow-md flex items-center justify-center gap-2">
      <span className="bg-slate-950 text-amber-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider">
        STAGING
      </span>
      <span>【準備・検証環境】この画面はテスト専用です（本番サイト・実課金には影響しません）</span>
    </div>
  );
}
