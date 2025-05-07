import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const session = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const isAuthenticated = !!session;

  if (
    (request.nextUrl.pathname.startsWith("/admin") ||
      request.nextUrl.pathname.includes("/admin/")) &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// Protect specific routes with the middleware
export const config = {
  matcher: ["/admin/:path*"],
};
