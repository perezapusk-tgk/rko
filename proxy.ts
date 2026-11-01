import { getSessionCookie } from "better-auth/cookies";
import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const protectedPath = path === "/" || path.startsWith("/admin") || path.startsWith("/api/");
  const publicApi = path.startsWith("/api/auth/");
  if (protectedPath && !publicApi && !getSessionCookie(request)) {
    if (path.startsWith("/api/")) return NextResponse.json({ ok:false, error:"Необходима авторизация" }, {status:401});
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
