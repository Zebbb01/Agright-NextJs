// src/lib/auth.ts (Fixed authOptions)
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  // DO NOT USE ADAPTER with JWT strategy and CredentialsProvider
  // The PrismaAdapter is for database sessions, not JWT sessions
  // When using JWT strategy, sessions are stored in JWTs, not the database

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { role: true },
        });

        if (!user || !user.password || !(await bcrypt.compare(credentials.password, user.password))) {
          return null;
        }

        // Return user object for JWT
        return {
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: user.role.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt", // Keep JWT strategy
    // maxAge: 30 * 24 * 60 * 60, // 30 days
    // maxAge: 3 * 24 * 60 * 60, // 3 days
    // maxAge: 24 * 60 * 60, // 1 day
    maxAge: 3 * 60 * 60, // 3 hours
    // maxAge: 60 * 60, // 1 hour
  },
  jwt: {
    secret: process.env.NEXTAUTH_JWT_SECRET || process.env.NEXTAUTH_SECRET,
    // maxAge: 30 * 24 * 60 * 60, // 30 days
    // maxAge: 3 * 24 * 60 * 60, // 3 days
    // maxAge: 24 * 60 * 60, // 1 day
    maxAge: 3 * 60 * 60, // 3 hours
    // maxAge: 60 * 60, // 1 hour
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }

      if (trigger === "update" && session?.user) {
        // Handle session updates if needed
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};