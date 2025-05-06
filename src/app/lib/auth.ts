// auth.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
  // Optional: Add callbacks (jwt, session, signIn, redirect) for customization
  callbacks: {
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
      // Add data from the token to the session
      if (token) {
        session.user.id = token.id as string; // Assuming you set user.id in jwt callback
        // session.accessToken = token.accessToken; // Example: expose access token to session
      }
      return session;
    },
  },
  // Optional: Specify session strategy (jwt is default)
  session: {
    strategy: "jwt",
  },
  // Optional: Specify custom pages (like a custom sign-in page)
  // pages: {
  //   signIn: "/login", // Redirect to /login if not authenticated
  //   // error: '/auth/error',
  // },
  // Optional: Enable debug mode in development
  // debug: process.env.NODE_ENV === "development",
});
