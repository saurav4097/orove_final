import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Note from "@/models/Note";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const MONGODB_URI = process.env.MONGODB_URI!;

// ✅ connect only once
if (!mongoose.connection.readyState) {
  await mongoose.connect(MONGODB_URI);
}

export async function POST(req: Request) {
  try {
    const { question, responses } = await req.json();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ result: "Not authenticated" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;

    if (!email || !question || !responses) {
      return NextResponse.json({ result: "Missing data" }, { status: 400 });
    }

    await Note.create({
      topic: question,
      response: responses,
      email,
    });

    return NextResponse.json({ result: "Notes saved successfully!" });
  } catch (error) {
    console.error("Error saving notes:", error);
    return NextResponse.json({ result: "Failed to save notes" }, { status: 500 });
  }
}
