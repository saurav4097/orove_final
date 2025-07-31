// /app/api/reset-password/change/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import ResetToken from '@/models/ResetToken';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  const { email, newPassword } = await req.json();
  await dbConnect();

  const user = await User.findOne({ email });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  // Delete the OTP after successful reset
  await ResetToken.deleteOne({ email });

  return NextResponse.json({ success: true, message: 'Password updated' });
}
