'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';

type Note = {
  _id: string;
  topic: string;
  response: string;
  createdAt: string;
};

export default function HistoryPage() {
  const [notes, setNotes] = useState<Note[] | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await fetch('/api/history');
        const data = await res.json();
        setNotes(data.notes || []);
      } catch (err) {
        console.error('Failed to fetch notes', err);
        setNotes([]);
      }
    };

    fetchNotes();
  }, []);

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

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-extrabold text-purple-800">OROVE</h1>
        <button
          onClick={() => router.push('/')}
          className="bg-purple-700 text-white px-4 py-2 rounded hover:bg-purple-800"
        >
          Home
        </button>
      </div>

      {notes === null ? (
        <p className="text-gray-700 text-center text-lg">Loading...</p>
      ) : notes.length === 0 ? (
        <p className="text-gray-700 text-center text-lg">No searches found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-50 shadow-lg rounded overflow-hidden text-sm md:text-base">
            <thead className="bg-purple-700 text-white">
              <tr>
                <th className="p-4 text-left">#</th>
                <th className="p-4 text-left">Topic</th>
                <th className="p-4 text-left">Created At</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-900 font-medium">
              {notes.map((note, index) => (
                <tr
                  key={note._id}
                  className="border-t hover:bg-purple-50 transition duration-150"
                >
                  <td className="p-4">{index + 1}</td>
                  <td className="p-4">{note.topic}</td>
                  <td className="p-4">
                    {new Date(note.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDownload(note)}
                      className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 text-sm"
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
