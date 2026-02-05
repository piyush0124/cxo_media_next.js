import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isAdminPath = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  if (!isAdminPath || isAdminLogin) return NextResponse.next();

  const session = req.cookies.get("session")?.value;
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
