// 1️⃣ FILE: /app/reset-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [stage, setStage] = useState<'email' | 'otp' | 'reset'>('email');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const router = useRouter();

  const handleEmailSubmit = async () => {
  try {
    const res = await fetch('/api/reset-password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const errText = await res.text(); // fallback if response isn't JSON
      console.error('Failed response:', errText);
      alert('Failed to send OTP. Please try again.');
      return;
    }

    const data = await res.json();

    if (data.success) {
      alert('OTP sent to email. Valid for 10 minutes.');
      setStage('otp');
    } else {
      alert(data.message || 'Something went wrong');
    }
  } catch (err) {
    console.error('Client error:', err);
    alert('Something went wrong');
  }
};


  const handleOtpVerify = async () => {
    const res = await fetch('/api/reset-password/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (data.success) {
      setStage('reset');
    } else {
      alert(data.message);
    }
  };

  const handlePasswordReset = async () => {
    if (newPassword !== confirmPassword) return alert("Passwords don't match");
    const res = await fetch('/api/reset-password/change', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await res.json();
    if (data.success) {
      alert('Password changed successfully!');
      router.push('/');
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Reset Your Password</h2>

        {stage === 'email' && (
          <>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-2 border rounded mb-4"
            />
            <button onClick={handleEmailSubmit} className="w-full bg-blue-600 text-white p-2 rounded">
              Send OTP
            </button>
          </>
        )}

        {stage === 'otp' && (
          <>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full p-2 border rounded mb-4"
            />
            <button onClick={handleOtpVerify} className="w-full bg-blue-600 text-white p-2 rounded">
              Verify OTP
            </button>
          </>
        )}

        {stage === 'reset' && (
          <>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full p-2 border rounded mb-4"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className="w-full p-2 border rounded mb-4"
            />
            <button onClick={handlePasswordReset} className="w-full bg-green-600 text-white p-2 rounded">
              Change Password
            </button>
          </>
        )}
      </div>
    </div>
  );
}
