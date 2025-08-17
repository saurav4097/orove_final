// /app/api/ispremium/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '@/models/User';

const connectDB = async () => {
  if (mongoose.connections[0]?.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI!);
};

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ message: 'Invalid email' }, { status: 400 });
    }

    const user = await User.findOne({ email }); // post('findOne') will auto-expire if needed
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(
      {
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[ISPREFIX_ERROR]', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
