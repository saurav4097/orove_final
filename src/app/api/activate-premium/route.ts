// /app/api/activate-payment/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let email: string;
    try {
      const decoded: any = jwt.verify(token, JWT_SECRET);
      email = decoded.email;
      if (!email) throw new Error('Email missing in token');
    } catch {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    await dbConnect();

    // We use findOne + save so we can compute an extended expiry intelligently
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const base = user.premiumExpiresAt && user.premiumExpiresAt > now ? user.premiumExpiresAt : now;
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

    user.isPremium = true;
    user.premiumExpiresAt = new Date(base.getTime() + THIRTY_DAYS_MS);

    await user.save();

    return NextResponse.json({
      message: 'User upgraded to premium',
      user: {
        email: user.email,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
      },
    });
  } catch (error) {
    console.error('[ACTIVATE_PAYMENT_ERROR]', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
