'use client';

import { useRef } from 'react';
import html2pdf from 'html2pdf.js';

export default function NotesPage() {
  const notesRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (notesRef.current) {
      const opt = {
        margin: 0.5,
        filename: 'my-styled-notes.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
      };

      html2pdf().from(notesRef.current).set(opt).save();
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Printable notes area */}
      <div
        ref={notesRef}
        className="bg-yellow-50 text-gray-900 p-8 rounded-xl shadow-lg"
        style={{ fontFamily: 'Georgia, serif', lineHeight: '1.8' }}
      >
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">Study Notes</h1>

        <h2 className="text-xl font-semibold text-indigo-600 mt-4 mb-2">📌 Key Concepts</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Well-styled notes look more professional</li>
          <li>Use clear headings and background</li>
          <li>Make it feel like real handwritten notes</li>
        </ul>

        <h2 className="text-xl font-semibold text-indigo-600 mt-6 mb-2">📝 Examples</h2>
        <p className="mb-4">
          For instance, instead of using <code>**bold**</code> or <code># Heading</code>,
          just use proper styling with React + Tailwind.
        </p>

        <blockquote className="border-l-4 border-indigo-400 pl-4 italic text-gray-700">
          “A beautifully styled PDF is easier to revise and share.”
        </blockquote>
      </div>

      {/* Download Button */}
      <div className="text-center mt-6">
        <button
          onClick={handleDownload}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition"
        >
          📄 Download Notes PDF
        </button>
      </div>
    </div>
  );
}
