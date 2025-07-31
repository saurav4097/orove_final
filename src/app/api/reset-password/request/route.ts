import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import nodemailer from 'nodemailer';
import User from '@/models/User'; // You'll need to create this
import ResetToken from '@/models/ResetToken'; // You'll also need this

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    await dbConnect();

    const user = await User.findOne({ email }); // ✅ use Mongoose, not db.collection
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 10 * 60 * 1000;

    await ResetToken.findOneAndUpdate(
      { email },
      { otp, expiry },
      { upsert: true, new: true }
    );

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'OROVE Password Reset OTP',
      text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
    });

    return NextResponse.json({ success: true, message: 'OTP sent to email' });
  } catch (error: any) {
    console.error('Error in reset-password/request:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
