import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import syncUserWithDatabase from "@/lib/syncUserWithDatabase";
// import { NextResponse, NextRequest } from "next/server";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,

      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      console.log("auth-astro signIn callback triggered", { user });

      if (user && profile) {
        await syncUserWithDatabase(user, profile);
      }

      return true;
    },
    async jwt({ token, account, profile }) {
      // Data from Google profile is available here on initial sign-in
      if (account) {
        token.accessToken = account.access_token; // Example: save access token
      }
      if (profile) {
        token.googleId = profile.sub;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string; // Assuming you set user.id in jwt callback
      }
      return session;
    },
  },
  // Optional: Specify session strategy (jwt is default)
  session: {
    strategy: "jwt",
  },
  // Optional: Specify custom pages (like a custom sign-in page)
  pages: {
    signIn: "/", // Redirect to /login if not authenticated
  },
  // Optional: Enable debug mode in development
  debug: process.env.NODE_ENV === "development",
});
