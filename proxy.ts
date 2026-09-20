import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJwtPayloadEdge(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload) as Record<string, unknown>;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && now > (payload.exp as number)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for session cookies (userId or fallback devbridge_session)
  const token = request.cookies.get("userId")?.value || request.cookies.get("devbridge_session")?.value;
  let userRole: string | null = null;
  let profileCompleted = false;

  if (token) {
    const payload = decodeJwtPayloadEdge(token);
    if (payload && payload.role) {
      userRole = payload.role as string;
      profileCompleted = payload.profileCompleted === true;
    }
  }

  // If user is logged in and visits /auth, redirect them to their dashboard
  if (pathname.startsWith("/auth")) {
    if (userRole) {
      let target = "/developer/dashboard";
      if (userRole === "ADMIN") {
        target = "/admin/dashboard";
      } else if (!profileCompleted) {
        target = "/onboarding";
      } else if (userRole === "CLIENT") {
        target = "/client/dashboard";
      }
      return NextResponse.redirect(new URL(target, request.url));
    }
    return NextResponse.next();
  }

  // Allow access to /onboarding for all authenticated users who haven't completed it
  if (pathname.startsWith("/onboarding")) {
    if (!userRole) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }
    // Admins don't need onboarding
    if (userRole === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (profileCompleted) {
      return NextResponse.redirect(
        new URL(userRole === "DEVELOPER" ? "/developer/dashboard" : "/client/dashboard", request.url)
      );
    }
    return NextResponse.next();
  }

  // 1. ADMIN PROTECTED ROUTES (/admin/dashboard) — check before profileCompleted
  //    Admins don't have a profileCompleted flow, so skip that check for them.
  if (pathname.startsWith("/admin/dashboard")) {
    if (!userRole) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (userRole !== "ADMIN") {
      // Non-admin users: redirect to their own dashboard
      if (userRole === "DEVELOPER") {
        return NextResponse.redirect(new URL("/developer/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/client/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // For developer/client protected routes, check profile completion
  const isProtected = pathname.startsWith("/developer") || pathname.startsWith("/client");
  
  if (isProtected && userRole && !profileCompleted && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // 2. DEVELOPER PROTECTED ROUTES (/developer/*)
  if (pathname.startsWith("/developer")) {
    if (!userRole) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (userRole === "CLIENT") {
      return NextResponse.redirect(new URL("/client/dashboard", request.url));
    }
  }

  // 3. CLIENT PROTECTED ROUTES (/client/*)
  if (pathname.startsWith("/client")) {
    if (!userRole) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    if (userRole === "DEVELOPER") {
      return NextResponse.redirect(new URL("/developer/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/developer/:path*", "/client/:path*", "/admin/dashboard/:path*", "/onboarding/:path*", "/auth"],
};
