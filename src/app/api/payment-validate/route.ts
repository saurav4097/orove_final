import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    const isValid = generatedSignature === razorpay_signature;

    return NextResponse.json({ isValid });
  } catch (error) {
    console.error('[PAYMENT_VALIDATE_ERROR]', error);
    return NextResponse.json({ isValid: false }, { status: 500 });
  }
}
