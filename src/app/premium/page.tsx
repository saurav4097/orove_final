import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "@/models/User";
import dynamic from 'next/dynamic';
import Link from 'next/link';
import SubscribeButton from '@/components/SubscribeButton';

const JWT_SECRET = process.env.JWT_SECRET!;
const MONGODB_URI = process.env.MONGODB_URI!;

export default async function PremiumPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  let isPremium = false;
  let email = "";

  if (!token) {
    return (
      <div className="text-center py-20">
        Please <a href="/login" className="text-blue-600 underline">log in</a> to access this page.
      </div>
    );
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    email = decoded.email;

    if (!email) throw new Error("Email not found in token");

    if (!mongoose.connection.readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const user = await User.findOne({ email });

    if (user) {
      isPremium = user.isPremium;
    }
  } catch (error) {
    console.error("Token/DB Error:", error);
    return (
      <div className="text-center py-20">
        Invalid or expired token. Please <Link href="/login" className="text-blue-600 underline">log in</Link> again.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Top Navigation */}
      <div className="flex justify-between items-center px-6 py-4 border-b bg-white shadow-sm">
        <div className="text-2xl font-bold text-purple-700">OROVE</div>
        <Link
          href="/"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Back to Home
        </Link>
      </div>

      {/* Premium Status Section */}
      <section className="px-6 md:px-12 lg:px-24 py-10">
        <div
          className={`rounded-xl p-6 shadow-lg ${
            isPremium
              ? 'bg-gradient-to-r from-yellow-400 to-yellow-300 text-black'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          <h2 className="text-2xl font-bold mb-2">
            {isPremium ? '🌟 Premium Member' : '🔒 You Do Not Have Premium'}
          </h2>
          <p>
            {isPremium
              ? 'Thank you for subscribing! You have full access to all premium features.'
              : 'Unlock all learning benefits by subscribing to a premium plan.'}
          </p>
        </div>
      </section>

      {/* Subscription Cards */}
      <section className="px-6 lg:px-20 py-16 bg-gray-100 text-gray-900">
        <h2 className="text-3xl font-extrabold text-center mb-12">🚀 Choose Your Learning Plan</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Gold Plan */}
          <div className="bg-yellow-300 text-black p-6 rounded-2xl shadow-xl hover:scale-105 transition-transform">
            <h3 className="text-2xl font-bold mb-4">🥇 Gold Access - ₹199/month</h3>
            <ul className="list-disc pl-6 space-y-2 text-sm">
              <li>Unlimited Class Lectures</li>
              <li>Unlimited Topics</li>
              <li>Download Notes</li>
              <li>Doubt Support</li>
              <li>Access History</li>
            </ul>
          <SubscribeButton />

          </div>
        </div>
      </section>

      <footer className="bg-white py-6 px-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} OROVE. All rights reserved.
      </footer>
    </div>
  );
}
