'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState({ username: '', email: '' });
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      const res = await fetch("/api/check-auth");
      const data = await res.json();

      if (!data.authenticated) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
    }

    fetchUser();
  }, []);


 async function handleLogout() {
    await fetch("/api/logout");
    router.push("/");
  }
if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#ecf0ff] to-[#d3e1ff] text-gray-800">
      <div className="px-4 md:px-10 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1c2b60]">OROVE</h1>
        <Link href="/" className="bg-[#3f5bdc] text-white px-4 py-2 rounded-lg hover:bg-[#3348b8] text-sm md:text-base">
          Back
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-10 px-6 py-10">
        <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-sm text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-[#3f5bdc] rounded-full" />
            <div>
              <h2 className="text-xl font-semibold text-[#1c2b60]">{user.username || 'Name'}</h2>
              <p className="text-gray-600">{user.email || 'name@gmail.com'}</p>
            </div>

            <div className="space-y-4 pt-4 w-full">
              <Link href="/premium">
              <button className="w-full bg-[#3f5bdc] text-white py-2 rounded-lg hover:bg-[#3348b8]">
                Go Premium
              </button>
              </Link>
              <button className="w-full bg-[#3f5bdc] text-white py-2 rounded-lg hover:bg-[#3348b8]">
                Enter in Class
              </button>
              <button
                onClick={handleLogout}
                className="w-full bg-[#e53e3e] text-white py-2 rounded-lg hover:bg-[#c53030]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md">
          <div className="space-y-4">
            {['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5', 'Topic 6'].map((topic, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <span className="font-medium">{topic}</span>
                <button className="bg-[#3f5bdc] text-white text-sm px-4 py-1 rounded hover:bg-[#3348b8]">
                  Download
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Link href="/history">
            <button className="w-full bg-[#3f5bdc] text-white py-2 rounded-lg hover:bg-[#3348b8]">
              See All Previous Topics
            </button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-[#1c2b60] text-white text-center text-sm py-4 mt-10">
        © 2025 OROVE. All rights reserved.
      </footer>
    </div>
  );
}
