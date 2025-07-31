'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.success) {
      localStorage.setItem('token', data.token);
      router.push('/profile');
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#4f46e5] via-[#6d28d9] to-[#3b82f6] flex flex-col items-center">
      
      {/* Navbar */}
      <div className="w-full flex items-center justify-start px-6 py-4">
        <h1 className="text-white text-3xl font-extrabold tracking-wide drop-shadow-md">
          OROVE
        </h1>
      </div>

      {/* Login Card */}
      <div className="flex flex-col items-center justify-center flex-grow w-full px-4">
        <div className="bg-white shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md mt-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#1b1c3b] mb-6">
            Welcome Back
          </h2>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 placeholder-gray-400"
          />

          <button
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] text-white py-2.5 rounded-lg font-semibold hover:from-[#4f46e5] hover:to-[#7c3aed] transition duration-200 shadow-md"
          >
            Login
          </button>
<p className="text-center text-sm mt-6 text-gray-600">
    Forgot your password?{' '}
    <Link href="/reset-password" className="text-blue-600 hover:underline">
      Reset here
    </Link>
  </p>
          <p className="text-center text-sm mt-6 text-gray-600">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-blue-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
