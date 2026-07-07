import { NextResponse } from "next/server";

const SESSION_COOKIE = "fitlek_admin_session";

// Note: this only checks that a session cookie is present. The Edge runtime
// used by middleware can't run the jsonwebtoken/crypto verification, so the
// real signature check happens server-side in every API route via
// requireAdmin() from lib/auth.js. This middleware only improves UX by
// bouncing obviously-logged-out visitors straight to the login page.
export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"]
};
