import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/admin"];
const homePage = "/";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    console.log({ AUTH_SECRET: process.env.AUTH_SECRET, token });
    if (!token) {
      const url = new URL(homePage, req.url);

      return NextResponse.redirect(url);
    }

    // Optional: Check data within the token for more granular access control
    // if (token.role !== 'admin') {
    //   const url = new URL('/unauthorized', req.url);
    //   return NextResponse.redirect(url);
    // }

    // If token exists and checks pass, allow the request to proceed
    return NextResponse.next();
  }

  return NextResponse.next();
}
