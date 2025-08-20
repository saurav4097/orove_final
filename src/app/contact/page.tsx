"use client";
import { useState } from "react";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { useRouter } from "next/navigation"; // ✅ for back navigation
export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
 const router = useRouter();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Sending...");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setStatus("✅ Query sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } else {
      setStatus("❌ Failed to send. Try again.");
    }
  };


  return (
     <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col items-center p-6 relative">
      {/* 🔙 Back Button */}
      <button
        onClick={() => router.back()}
        className="absolute top-4 right-4 bg-blue-200 hover:bg-blue-300 text-gray-800 px-4 py-2 rounded-lg shadow-md transition"
      >
        ⬅ Back
      </button>
      {/* Header */}
      <header className="text-center max-w-3xl mb-8">
        <h1 className="text-4xl font-bold mb-4">Orove</h1>
        <p className="text-lg text-gray-600">
          Have a question, need support, or want to reach out? <br />
           Simply fill out the Contact Us form below — we’re here to help!
        </p>
      </header>

      {/* Info Section */}
      <section className="bg-white shadow-lg rounded-2xl p-6 max-w-3xl w-full mb-10">
        <h2 className="text-2xl font-semibold mb-4">Business Info</h2>
        <ul className="space-y-2">
          <li><strong>Name:</strong> Orove</li>
          <li><strong>Description:</strong> AI teaches you exactly how you learn best.</li>
          <li><strong>Email:</strong> <a href="mailto:orove018@gmail.com" className="text-blue-600">orove018@gmail.com</a></li>
          <li><strong>Address:</strong> IIT Guwahati, Assam, India</li>
          <li className="flex gap-4 mt-2">
            <a href="https://www.instagram.com/orove1" target="_blank" rel="noopener noreferrer">
              <FaInstagram className="text-pink-500 text-2xl hover:scale-110 transition" />
            </a>
            <a href="https://www.linkedin.com/in/saurav-choudhary-78361b2a5" target="_blank" rel="noopener noreferrer">
              <FaLinkedin className="text-blue-700 text-2xl hover:scale-110 transition" />
            </a>
          </li>
        </ul>
      </section>

      {/* Contact Form */}
      <section className="bg-white shadow-lg rounded-2xl p-6 max-w-3xl w-full">
        <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your Name"
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your Email"
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Your Message"
            required
            rows={5}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Send Message
          </button>
        </form>
        {status && <p className="mt-4 text-center text-sm">{status}</p>}
      </section>
    </div>
  );
}
