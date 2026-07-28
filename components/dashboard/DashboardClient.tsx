"use client";

import { useState } from "react";
import VenueGrid from "@/components/dashboard/VenueGrid";

export default function DashboardClient() {
  const [selectedJcd, setSelectedJcd] = useState("14"); // 鳴門をデフォルト
  const [selectedRno, setSelectedRno] = useState(1);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-white font-outfit">🏁 全国24場 開催状況</h2>
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-bold border border-emerald-500/20">
          緑枠：本日開催
        </span>
      </div>

      <VenueGrid
        selectedJcd={selectedJcd}
        selectedRno={selectedRno}
        onSelect={setSelectedJcd}
      />
    </div>
  );
}
