"use client";
import React from 'react';
import { useEffect, useState } from "react";
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react'; // You can also use Heroicons or custom SVG
export default function HomePage() {
 const router = useRouter(); // ✅ useRouter must be used inside the component
 const [isLoggedIn, setIsLoggedIn] = useState(null);
 const [menuOpen, setMenuOpen] = useState(false);

 useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/check-auth");
      const data = await res.json();
      setIsLoggedIn(data.authenticated);
    }

    checkAuth();
  }, []);
 const handleLogout = async () => {
    await fetch("/api/logout");
    router.push("/");
  };
  const handleClassroomClick = () => {
    if (isLoggedIn === null) return;
    if (isLoggedIn) {
     
      router.push("/classroom");
    } else {
      router.push("/login");
    }
  };
const handleNotesClick = () => {
    if (isLoggedIn === null) return;
    if (isLoggedIn) {
     
      router.push("/history");
    } else {
      router.push("/login");
    }
  };
const handleSubscriptionsClick = () => {
    if (isLoggedIn === null) return;
    if (isLoggedIn) {
     
      router.push("/premium");
    } else {
      router.push("/login");
    }
  };


  const handleAccountClick = () => {
    if (isLoggedIn === null) return;
    if (isLoggedIn) {
      router.push("/profile");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
      {/* Navbar */}
     



<nav className="flex justify-between items-center px-6 py-4 bg-transparent backdrop-blur-md z-10 relative">
  {/* Logo */}
  <div className="flex items-center gap-2 text-xl font-bold">
    <Image src="/orove-logo2.png" alt="logo" width={30} height={30} />
    <span>OROVE</span>
  </div>

  {/* Desktop Menu */}
  <ul className="hidden md:flex gap-6 text-sm font-medium">
    
    <li><button onClick={handleClassroomClick}>ClassRoom</button></li>
    <li><button onClick={handleNotesClick}>Notes</button></li>
    <li><button onClick={handleAccountClick}>Account</button></li>
    <li><button onClick={handleSubscriptionsClick}>Subscriptions</button></li>
    <li><Link href="/contact">Contact</Link></li>
    <li><button onClick={handleLogout}>Log Out</button></li>
  </ul>

  {/* Mobile Hamburger Icon */}
  <div className="md:hidden">
    <button onClick={() => setMenuOpen(!menuOpen)}>
      {menuOpen ? <X size={24} /> : <Menu size={24} />}
    </button>
  </div>

  {/* Mobile Menu Dropdown */}
  {menuOpen && (
    <ul className="absolute top-full right-6 bg-white text-gray-800 rounded-md shadow-lg py-4 px-6 space-y-3 w-48 md:hidden z-50">
      <li><button onClick={handleClassroomClick}>ClassRoom</button></li>
    <li><button onClick={handleNotesClick}>Notes</button></li>
    <li><button onClick={handleAccountClick}>Account</button></li>
    <li><button onClick={handleSubscriptionsClick}>Subscriptions</button></li>
    <li><Link href="#">Contact</Link></li>
    <li><button onClick={handleLogout}>Log Out</button></li>
    </ul>
  )}
</nav>

      {/* Hero Section */}
      <main className="flex flex-col-reverse lg:flex-row items-center justify-between px-6 lg:px-20 py-16 gap-10">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">Welcome to</h1>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-yellow-300 mb-6">The OROVE AI</h2>
          <p className="text-lg md:text-xl mb-8">
            India&rsquo;s First Fully Functional AI Teacher! A smart classroom that adapts to you.
            Learn faster, deeper, and smarter with our AI-powered education suite built for modern learning.
          </p>
          
            <button onClick={handleClassroomClick}  className="bg-yellow-400 hover:bg-yellow-300 text-black font-semibold py-3 px-6 rounded-full shadow-xl transition duration-300">
              Enter Smart Class
            </button>
          
        </div>

        <div className="flex-1">
          <Image 
            src="/roboaiclass.jpg" 
            alt="AI Teacher" 
            width={600} 
            height={400} 
            className="w-full h-auto" 
          />
        </div>
      </main>

{/* Enhanced Hero-About Section */}
<section className="bg-gradient-to-br from-indigo-50 to-white py-16 px-6 lg:px-20 text-gray-800">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-12">
      <h1 className="text-4xl md:text-5xl font-extrabold text-indigo-800 mb-4">Meet OROVE AI</h1>
      <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
        India&rsquo;s first smart AI teacher powered by <span className="text-indigo-600 font-semibold">Gemini</span>, designed to transform education for every student.
      </p>
    </div>

    {/* Layer 1: Introduction */}
    <div className="bg-white shadow-lg rounded-3xl p-8 mb-10">
      <h2 className="text-3xl font-bold text-indigo-700 mb-4 text-center">About OROVE</h2>
      <p className="text-lg md:text-xl leading-relaxed mb-6 text-center">
        OROVE AI is a revolutionary platform that integrates cutting-edge artificial intelligence to create a real-time, interactive teaching environment.
        It empowers students and assists educators by providing instant feedback, personalized content, and interactive lectures—anytime, anywhere.
      </p>
      <p className="text-lg md:text-xl leading-relaxed text-center">
        Whether you're from a rural village or a metro city, OROVE ensures access to high-quality education at your fingertips.
      </p>
    </div>

    {/* Layer 2: AI Integration */}
    <div className="bg-gradient-to-r from-indigo-100 via-white to-indigo-100 shadow-inner rounded-3xl p-8 mb-10">
      <h3 className="text-2xl font-bold text-indigo-800 mb-4 text-center">Powered by Gemini AI</h3>
      <p className="text-lg md:text-xl leading-relaxed text-center mb-6">
        OROVE runs on the powerful Gemini AI model, offering:
      </p>
      <ul className="text-lg list-disc list-inside text-gray-700 max-w-3xl mx-auto mb-6">
        <li>Natural human-like understanding and responses</li>
        <li>Empathetic and context-aware interactions</li>
        <li>Real-time doubt-solving and lecture generation</li>
        <li>Daily performance tracking and learning suggestions</li>
      </ul>
      <p className="text-center text-lg text-indigo-700 font-medium">
        It&rsquo;s like having a personal tutor—smarter, faster, and always available.
      </p>
    </div>

    {/* Layer 3: The Movement */}
    <div className="bg-white shadow-lg rounded-3xl p-8">
      <h3 className="text-2xl font-bold text-indigo-800 mb-4 text-center">More Than a Tool — A Movement</h3>
      <p className="text-lg md:text-xl leading-relaxed text-center mb-6">
        OROVE isn't just software—It&rsquo;s a mission to equalize education. With Gemini under the hood, It&rsquo;s capable of reaching every corner of the country,
        bridging the educational gap with advanced AI systems.
      </p>
      <p className="text-lg md:text-xl leading-relaxed text-center mb-4">
        From downloadable notes to instant class replays and unlimited topics—OROVE ensures no student is left behind.
      </p>
      <p className="text-center font-semibold text-indigo-600 text-lg">
        OROVE is your forever-classroom. Adaptive. Smart. Reliable.
      </p>
    </div>
  </div>
</section>


      {/* Subscription Cards */}
      <section className="px-6 lg:px-20 py-16 bg-gray-100 text-gray-900">
        <h2 className="text-3xl font-bold text-center mb-10">Choose Your Plan</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Gold Plan */}
          <div className="bg-yellow-300 text-black p-6 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold mb-4">Gold Access - ₹199/month</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Unlimited Class Lectures</li>
              <li>Unlimited Topics</li>
              <li>Download Notes</li>
              <li>Doubt Support</li>
              <li>Access History</li>
            </ul>
            <button className="mt-6 bg-black text-white py-2 px-4 rounded-full hover:bg-gray-800">Select Plan</button>
          </div>

          {/* Coming Soon Plan 1 */}
          <div className="bg-white text-gray-700 p-6 rounded-2xl border border-gray-300 opacity-50">
            <h3 className="text-2xl font-bold mb-4">Platinum Plus - ₹499/month</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Everything in Gold</li>
              <li>AI Study Partner</li>
              <li>Test Generator</li>
              <li>Advanced Progress Tracker</li>
            </ul>
            <button className="mt-6 bg-gray-300 text-gray-600 py-2 px-4 rounded-full cursor-not-allowed">Coming Soon</button>
          </div>

          {/* Coming Soon Plan 2 */}
          <div className="bg-white text-gray-700 p-6 rounded-2xl border border-gray-300 opacity-50">
            <h3 className="text-2xl font-bold mb-4">Diamond AI Elite - ₹999/month</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>All Features +</li>
              <li>1-on-1 AI Mentorship</li>
              <li>Career Counseling Tools</li>
              <li>Offline Mode</li>
            </ul>
            <button className="mt-6 bg-gray-300 text-gray-600 py-2 px-4 rounded-full cursor-not-allowed">Coming Soon</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-6 mt-12">
        <p>&copy; {new Date().getFullYear()} OROVE AI. All rights reserved.</p>
        <p className="text-sm">Empowering the future of education through AI and innovation.</p>
      </footer>
    </div>
  )
}
