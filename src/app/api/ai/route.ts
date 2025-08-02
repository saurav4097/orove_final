import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Note from "@/models/Note";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const MONGODB_URI = process.env.MONGODB_URI!;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

// 1. MongoDB connection setup
if (!mongoose.connection.readyState) {
  await mongoose.connect(MONGODB_URI);
}

// 2. Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    // 3. Get token from cookie and decode email
    const cookieStore =  await cookies();
    const token =  cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ result: "Not authenticated" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, JWT_SECRET);
    const email = decoded.email;
    if (!email) {
      return NextResponse.json({ result: "Email not found in token" }, { status: 400 });
    }

    // 4. Generate response from Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: query }] }],
    });

    const response = await result.response;
    const text = response.text();


    // 6. Send response to client
    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("Gemini error:", error);
    return NextResponse.json(
      { result: "Failed to fetch AI response." },
      { status: 500 }
    );
  }
}
