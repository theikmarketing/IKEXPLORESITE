import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");
  const protectDashboard = pathname.startsWith("/dashboard");
  if (protectAdmin || protectDashboard) {
    const auth = request.cookies.get("admin_auth")?.value;
    if (!auth) {
      const url = new URL("/admin/login", request.url);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"],
};
