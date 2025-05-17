import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import syncUserWithDatabase from "@/lib/syncUserWithDatabase";

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
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, profile }) {
      console.log("auth-astro signIn callback triggered", { user });

      if (user && profile) {
        await syncUserWithDatabase(user, profile);
      }
      
      return true;
    },
  },
  debug: process.env.NODE_ENV === "development",
});
