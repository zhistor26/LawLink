import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  providers: [
    CredentialsProvider({
      name: "LawLink",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@lawlink.local";
        const adminPassword = process.env.SEED_ADMIN_PASSWORD;

        if (!adminPassword) {
          return null;
        }

        if (credentials?.email === adminEmail && credentials.password === adminPassword) {
          return {
            id: "seed-admin",
            name: "系统管理员",
            email: adminEmail
          };
        }

        return null;
      }
    })
  ],
  pages: {
    signIn: "/login"
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
