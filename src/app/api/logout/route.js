
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
   const cookieStore = await cookies();
  cookieStore.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0, // remove immediately
    path: "/"
  });

  return NextResponse.json({ success: true });
}
