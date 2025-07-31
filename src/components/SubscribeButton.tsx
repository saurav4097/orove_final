'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscribeButton() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const handleSubscribe = async () => {
    const res = await fetch('/api/razorpay', {
      method: 'POST',
    });

    const data = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: 9900,
      currency: 'INR',
      name: 'OROVE',
      description: 'Gold Access - ₹99/month',
      order_id: data.orderId,
      handler: async function (response: any) {
        const body = {
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
        };

        const validateRes = await fetch('/api/payment-validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });

        const validateData = await validateRes.json();

        if (validateData?.isValid) {
          await fetch('/api/activate-premium', {
            method: 'POST',
          });

          alert('🎉 Payment successful! You are now a premium member.');
          window.location.href = '/';
        } else {
          alert('❌ Payment verification failed. Try again.');
        }
      },
      theme: {
        color: '#7e22ce',
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <button
      onClick={handleSubscribe}
      className="mt-6 bg-black text-white py-2 px-4 rounded-full hover:bg-gray-800 w-full"
    >
      Subscribe Now
    </button>
  );
}
