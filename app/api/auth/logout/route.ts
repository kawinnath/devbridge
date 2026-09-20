import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    // Clear cookies using response.cookies.set (not the cookies() API)
    // This ensures the Set-Cookie headers are actually attached to the response
    response.cookies.set("userId", "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    response.cookies.set("devbridge_session", "", {
      path: "/",
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
