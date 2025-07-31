import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Note from "@/models/Note";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const MONGODB_URI = process.env.MONGODB_URI!;

export async function GET() {
  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    if (!email) {
      return NextResponse.json({ error: "No email in token" }, { status: 400 });
    }

    const notes = await Note.find({ email }).sort({ createdAt: -1 });

    return NextResponse.json({ notes }, { status: 200 });
  } catch (error) {
    console.error("History API error:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
