import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Old shared links lived on /. Send any query string to the longevity calculator. */
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/" && request.nextUrl.searchParams.size > 0) {
    const url = request.nextUrl.clone();
    url.pathname = "/longevity";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
