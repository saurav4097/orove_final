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
const [isLoggedIn, setIsLoggedIn] = useState(null);
useEffect(() => {
    async function checkAuth() {
      const res = await fetch("/api/check-auth");
      const data = await res.json();
      setIsLoggedIn(data.authenticated);
    }

    checkAuth();
  }, []);
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
const handleClassroomClick = () => {
    if (isLoggedIn === null) return;
    if (isLoggedIn) {
     
      router.push("/classroom");
    } else {
      router.push("/login");
    }
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
const formatResponse = (response: string) => {
    return response
      // Headings (# Something)
      .replace(/#+\s?(.*)/g, (match, p1) => `\n\n## ${p1}\n`)
      // Bold points (**something**)
      .replace(/\*\*(.*?)\*\*/g, (match, p1) => `\n${p1}:\n`)
      // Bullets (- or *)
      .replace(/[-*]\s/g, '• ')
      // Remove extra line breaks
      .replace(/\n{2,}/g, '\n\n');
  };
  const handleDownload = (note: Note) => {
      const doc = new jsPDF('p', 'pt', 'a4');
      const margin = 40;
      const maxWidth = 500;
      let y = margin;
  
      // Background
      doc.setFillColor(255, 253, 208); // pale yellow paper
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
  
      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(0, 51, 153); // navy blue
      doc.text(note.topic, margin, y);
      y += 30;
  
      // Created date
      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.setFont('helvetica', 'italic');
      doc.text(`Created At: ${new Date(note.createdAt).toLocaleString()}`, margin, y);
      y += 30;
  
      // Format response
      const response = formatResponse(note.response);
      const lines = response.split('\n');
  
      let insideCodeBlock = false;
      let codeBuffer: string[] = [];
  
      const flushCodeBlock = () => {
        if (codeBuffer.length === 0) return;
  
        const codeLines = doc.splitTextToSize(codeBuffer.join('\n'), maxWidth - 20);
        const boxHeight = codeLines.length * 16 + 20;
  
        // Draw black rectangle
        doc.setFillColor(0, 0, 0);
        doc.rect(margin - 5, y, maxWidth + 10, boxHeight, 'F');
  
        // White code text
        doc.setFont('courier', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(255, 255, 255);
  
        let codeY = y + 18;
        codeLines.forEach(cl => {
          doc.text(cl, margin, codeY);
          codeY += 16;
        });
  
        y += boxHeight + 10;
  
        // Reset font
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(13);
        doc.setTextColor(0);
  
        codeBuffer = [];
      };
  
      lines.forEach(line => {
        if (line.trim().startsWith('```')) {
          if (insideCodeBlock) {
            // End block
            flushCodeBlock();
          }
          insideCodeBlock = !insideCodeBlock;
        } else if (insideCodeBlock) {
          codeBuffer.push(line);
        } else if (line.startsWith('## ')) {
          // Heading
          y += 10;
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          doc.setTextColor(0, 51, 153);
          doc.text(line.replace('## ', ''), margin, y);
          y += 25;
        } else if (line.match(/^[A-Za-z0-9].*:\s*$/)) {
          // Bold subheading style
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(14);
          doc.setTextColor(102, 0, 153);
          doc.text(line.trim(), margin, y);
          y += 20;
        } else if (line.trim() !== '') {
          // Normal paragraph or bullet
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(12);
          doc.setTextColor(0);
  
          const wrapped = doc.splitTextToSize(line, maxWidth);
          wrapped.forEach(l => {
            if (y > doc.internal.pageSize.getHeight() - margin) {
              doc.addPage();
              doc.setFillColor(255, 253, 208);
              doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');
              y = margin;
            }
            doc.text(l, margin, y);
            y += 18;
          });
        }
      });
  
      // If ends inside code block
      flushCodeBlock();
  
      // Footer
      y = doc.internal.pageSize.getHeight() - 40;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('— End of Notes —', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
  
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
              <button 
               onClick={handleClassroomClick}
               className="w-full bg-[#3f5bdc] text-white py-2 rounded-lg hover:bg-[#3348b8]">ClassRoom</button>
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
