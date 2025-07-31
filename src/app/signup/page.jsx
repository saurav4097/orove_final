'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [username, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    const res = await fetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
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
    <div className="min-h-screen bg-gradient-to-br from-[#5c6ac4] via-[#b4c0ff] to-[#e2eafc] flex flex-col">
      {/* Navbar / Logo */}
      <div className="p-6">
        <h1 className="text-3xl font-bold text-white tracking-wide">OROVE</h1>
      </div>

      {/* Signup Card */}
      <div className="flex-grow flex items-center justify-center px-4">
        <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-[#3e4dc5] mb-6">
            Create a New Account
          </h2>

          <input
            value={username}
            onChange={(e) => setName(e.target.value)}
            placeholder="Username"
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-800 placeholder-gray-400"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400  text-gray-800 placeholder-gray-400"
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400  text-gray-800 placeholder-gray-400"
          />

          <button
            onClick={handleSignup}
            className="w-full bg-[#3e4dc5] text-white py-2 rounded-lg font-medium hover:bg-[#2f3dad] transition"
          >
            Sign Up
          </button>
<p className="text-center text-sm mt-6 text-gray-600">
    Forgot your password?{' '}
    <Link href="/reset-password" className="text-blue-600 hover:underline">
      Reset here
    </Link>
  </p>
          <div className="text-center mt-6 text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
