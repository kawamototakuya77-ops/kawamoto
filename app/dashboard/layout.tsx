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
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <DashboardHeader user={session.user} />
      <main className="max-w-lg mx-auto px-4 pt-20 pb-16 space-y-4">
        {children}
      </main>
    </div>
  );
}
