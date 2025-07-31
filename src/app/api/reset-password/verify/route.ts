import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ResetToken from '@/models/ResetToken';

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    await dbConnect();

const token = await ResetToken.findOne({ email }).exec(); // ✅ TS safe



    if (!token) {
      return NextResponse.json({ success: false, message: 'OTP not found' });
    }

    if (Date.now() > token.expiry) {
      return NextResponse.json({ success: false, message: 'OTP expired' });
    }

    if (token.otp !== otp) {
      return NextResponse.json({ success: false, message: 'Invalid OTP' });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error' });
  }
}
