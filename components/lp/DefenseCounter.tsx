"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 社会的証明カウンター（損失回避の法則）
 * 「今日、AIの見送り推奨でユーザーが回避した損失額」をカウントアップ表示
 */
export default function DefenseCounter() {
  const [count, setCount] = useState(0);
  const TARGET = 24800; // 静的値（後でFirebaseから取得）
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1800; // ms

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(TARGET * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <section className="rounded-3xl p-6 border border-amber-500/30 bg-amber-500/5 space-y-3 text-center">
      <p className="text-sm font-bold text-amber-400 tracking-wider uppercase">
        🛡️ 本日、プロプランユーザーが回避した損失額
      </p>
      <div
        className="text-5xl font-black font-outfit tabular-nums"
        style={{
          background: "linear-gradient(90deg, #fbbf24, #f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        ¥{count.toLocaleString()}
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">
        AIの「見送り推奨」に従ったことで、
        <br />
        支払わずに済んだ舟券代の合計（1回あたり800円換算）
      </p>
      <div className="pt-1">
        <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-sm text-amber-300 font-bold">
          本日の見送り成功率: 80%
        </span>
      </div>
      <p className="text-sm text-slate-500">
        ※ 実際の収支（利益）とは異なります
      </p>
    </section>
  );
}
