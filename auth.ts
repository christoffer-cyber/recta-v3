import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getUserByEmail, verifyPassword } from "@/lib/db/users";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('🔐 Authorize attempt:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await getUserByEmail(credentials.email);
          console.log('👤 User found:', user ? 'YES (id: ' + user.id + ')' : 'NO');
          
          if (!user) {
            return null;
          }

          const isValid = await verifyPassword(
            credentials.password,
            user.password_hash
          );
          console.log('🔑 Password valid:', isValid);

          if (!isValid) {
            return null;
          }

          const authUser = {
            id: user.id.toString(),
            email: user.email,
            name: user.name || null,
          };
          
          console.log('✅ Returning user:', authUser);
          return authUser;
        } catch (error) {
          console.error("❌ Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        console.log('💾 JWT callback - setting token.id:', user.id);
      }
      console.log('💾 JWT callback - token:', { id: token.id, email: token.email });
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        console.log('💾 Session callback - setting session.user.id:', token.id);
      }
      console.log('💾 Session callback - session:', { 
        userId: session.user?.id, 
        email: session.user?.email 
      });
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug logging
};

export default NextAuth(authOptions);
