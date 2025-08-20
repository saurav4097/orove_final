import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Query from "@/models/Query";

export async function POST(req: Request) {
  try {
    await dbConnect(); // connect to MongoDB

    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Save query in MongoDB
    const newQuery = new Query({ name, email, message });
    await newQuery.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("❌ Error saving query:", error);
    return NextResponse.json(
      { error: "Failed to save query" },
      { status: 500 }
    );
  }
}
