import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const APP_PASSWORD = process.env.APP_PASSWORD || "Travaux2026";

  if (password === APP_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("app_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: "/",
    });
    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
}
