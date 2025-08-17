// /app/api/increase-tried/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // If field doesn't exist yet, initialize it
    if (typeof user.tried !== 'number') {
      user.tried = 0;
    }

    // Increase tried count
    user.tried += 1;
    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Tried count increased',
      tried: user.tried,
    });
  } catch (error) {
    console.error('Error increasing tried count:', error);
    return NextResponse.json(
      { success: false, message: 'Server error' },
      { status: 500 }
    );
  }
}
