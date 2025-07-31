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

  const handleDownload = (note: Note) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Topic: ${note.topic}`, 10, 20);
    doc.setFontSize(12);
    doc.text(`Response:`, 10, 30);

    const splitText = doc.splitTextToSize(note.response, 180);
    doc.text(splitText, 10, 40);

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
