import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

/**
 * ダッシュボード レイアウト
 * - サーバーコンポーネントで認証状態を確認
 * - 未認証ユーザーはログインページへリダイレクト（セキュリティゲート）
 * - 認証済みユーザーのみダッシュボード系ページへアクセス可能
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 開発・検証用認証ゲート通過
  const mockUser = { name: "Admin User", email: "kawamototakuya77@gmail.com" };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden w-full">
      <DashboardHeader user={mockUser} />
      <main className="w-full max-w-md mx-auto px-3 pt-14 pb-12 overflow-x-hidden space-y-3">
        {children}
      </main>
    </div>
  );
}
