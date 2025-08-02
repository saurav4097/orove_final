'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

type Note = {
  _id: string;
  topic: string;
  response: string;
  createdAt: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState({ username: '', email: '' });
  const [notes, setNotes] = useState<Note[]>([]);
  const router = useRouter();

  // Fetch user info
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
  }, [router]);

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/history');
        const data = await res.json();
        const sorted = (data.notes || []).sort(
          (a: Note, b: Note) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNotes(sorted.slice(0, 6));
      } catch (err) {
        console.error('Failed to fetch notes', err);
        setNotes([]);
      }
    };
    fetchNotes();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout");
    router.push("/");
  };

  const parseBold = (text: string) => {
    const regex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ text: text.substring(lastIndex, match.index), bold: false });
      }
      parts.push({ text: match[1], bold: true });
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push({ text: text.substring(lastIndex), bold: false });
    }

    return parts;
  };

  const drawFormattedLine = (
    doc: jsPDF,
    parts: { text: string; bold: boolean }[],
    x: number,
    y: number,
    maxWidth: number
  ) => {
    let currentX = x;
    let currentY = y;
    const lineHeight = 16;

    parts.forEach(({ text, bold }) => {
      const font = bold ? 'Helvetica' : 'Times';
      const style = bold ? 'bold' : 'normal';
      doc.setFont(font, style);

      const words = text.split(' ');
      words.forEach((word) => {
        const wordWidth = doc.getTextWidth(word + ' ');
        if (currentX + wordWidth > x + maxWidth) {
          currentX = x;
          currentY += lineHeight;
        }
        doc.text(word + ' ', currentX, currentY);
        currentX += wordWidth;
      });
    });

    return currentY + lineHeight;
  };

  const handleDownload = (note: Note) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 40;
    let y = 50;

    // Background
    doc.setFillColor(255, 255, 204);
    doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(33, 37, 41);
    const titleWidth = doc.getTextWidth(note.topic);
    doc.text(note.topic, (pageWidth - titleWidth) / 2, y);
    y += 30;

    const lines = note.response.split('\n');

    lines.forEach((rawLine) => {
      if (y > 750) {
        doc.addPage();
        doc.setFillColor(255, 255, 204);
        doc.rect(0, 0, pageWidth, doc.internal.pageSize.getHeight(), 'F');
        y = 50;
      }

      const line = rawLine.trim();

      if (line.startsWith('# ') || line.startsWith('## ')) {
        const isH1 = line.startsWith('# ') && !line.startsWith('## ');
        const headingText = line.replace(/^#+\s*/, '');

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(isH1 ? 18 : 16);
        doc.setTextColor(isH1 ? 0 : 40, 40, isH1 ? 150 : 90);
        const hWidth = doc.getTextWidth(headingText);
        doc.text(headingText, (pageWidth - hWidth) / 2, y);
        y += isH1 ? 30 : 24;
      }

      else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
        const text = `• ${line.replace(/^[-•*]/, '').trim()}`;
        doc.setFont('Times', 'normal');
        doc.setFontSize(13);
        doc.setTextColor(40, 40, 40);
        const parts = parseBold(text);
        y = drawFormattedLine(doc, parts, marginX + 10, y, pageWidth - marginX * 2);
        y += 10;
      }

      else if (line === '') {
        y += 10;
      }

      else {
        doc.setFont('Times', 'normal');
        doc.setFontSize(13);
        doc.setTextColor(60, 60, 60);
        const parts = parseBold(line);
        y = drawFormattedLine(doc, parts, marginX, y, pageWidth - marginX * 2);
        y += 10;
      }
    });

    doc.save(`${note.topic.replace(/[^a-z0-9]/gi, '_')}_notes.pdf`);
  };

  const paddedNotes = [...notes, ...Array(6 - notes.length).fill(null)];

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-[#ecf0ff] to-[#d3e1ff] text-gray-800">
      <div className="px-4 md:px-10 py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#1c2b60]">OROVE</h1>
        <Link href="/" className="bg-[#3f5bdc] text-white px-4 py-2 rounded-lg hover:bg-[#3348b8] text-sm md:text-base">
          Back
        </Link>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-10 px-6 py-10">
        {/* Profile Card */}
        <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-sm text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-[#3f5bdc] rounded-full" />
            <div>
              <h2 className="text-xl font-semibold text-[#1c2b60]">{user.username || 'Name'}</h2>
              <p className="text-gray-600">{user.email || 'name@gmail.com'}</p>
            </div>
            <div className="space-y-4 pt-4 w-full">
              <Link href="/premium">
                <button className="w-full bg-[#3f5bdc] text-white py-2 rounded-lg hover:bg-[#3348b8]">Go Premium</button>
              </Link>
              <button className="w-full bg-[#3f5bdc] text-white py-2 rounded-lg hover:bg-[#3348b8]">Enter in Class</button>
              <button
                onClick={handleLogout}
                className="w-full bg-[#e53e3e] text-white py-2 rounded-lg hover:bg-[#c53030]"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Notes List */}
        <div className="bg-white shadow-md rounded-2xl p-6 w-full max-w-md">
          <div className="space-y-4">
            {paddedNotes.map((note, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <span className="font-medium text-gray-800">
                  {note ? note.topic : 'No search'}
                </span>
                <button
                  disabled={!note}
                  onClick={() => note && handleDownload(note)}
                  className={`text-sm px-4 py-1 rounded ${
                    note
                      ? 'bg-[#3f5bdc] text-white hover:bg-[#3348b8]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
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
