import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const GAS_API_URL =
  process.env.GAS_API_URL ||
  "https://script.google.com/macros/s/AKfycbyvJwPQZXBaFeh6DA3GnTDTapqRaOg7OEJHiBmhEDrqO3--CkpbEgZQbcjGvxQo_XLm/exec";

/**
 * GAS の verifyAccess(email, licenseKey) を呼び出してライセンス認証
 * members_db シートのデータと照合（active + 有効期限内）
 */
async function verifyLicenseWithGAS(
  email: string,
  licenseKey: string
): Promise<{ valid: boolean; tier?: string }> {
  try {
    const res = await fetch(GAS_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verify_license",
        email,
        key: licenseKey,
      }),
    });

    if (!res.ok) return { valid: false };

    const data = await res.json();
    return { valid: !!data.valid, tier: data.tier };
  } catch (err) {
    console.error("[Auth] GAS verify_license error:", err);
    return { valid: false };
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "ライセンスキー",
      credentials: {
        email: { label: "メールアドレス", type: "email" },
        licenseKey: { label: "ライセンスキー", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;
        const licenseKey = credentials?.licenseKey as string;

        if (!email || !licenseKey) return null;

        // ── 開発用デモキー（本番では削除可） ──
        if (
          process.env.DEMO_LICENSE_KEY &&
          licenseKey === process.env.DEMO_LICENSE_KEY
        ) {
          return { id: "demo", email, name: "Demo User", tier: "pro" };
        }

        // ── GAS members_db でライセンス認証 ──
        const { valid, tier } = await verifyLicenseWithGAS(email, licenseKey);

        if (!valid) return null;

        return {
          id: email,
          email,
          name: email,
          tier: tier || "light",
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30日
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.tier = (user as { tier?: string }).tier ?? "light";
      }
      return token;
    },
    async session({ session, token }) {
      if (token.email) session.user.email = token.email as string;
      if (token.tier) (session.user as { tier?: string }).tier = token.tier as string;
      return session;
    },
  },
});
