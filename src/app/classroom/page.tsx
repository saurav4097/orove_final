
// ---------- ClassroomPage.tsx ----------
'use client';
import { useState } from "react";
import Blackboard from "@/components/Blackboard";
import { FaDownload, FaPause, FaPlay, FaSearch, FaMicrophone } from 'react-icons/fa';
 
export default function ClassroomPage() {
  const [query, setQuery] = useState("");
  const [doubtQuery, setDoubtQuery] = useState("");
  const [segments, setSegments] = useState<string[]>([]);
  const [doubtCount, setDoubtCount] = useState(1);
const [playTrigger, setPlayTrigger] = useState(0);

  const handleSearch = async () => {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();

  // RESET everything for a new topic
  setSegments([`📘 Topic: ${query}`, data.result]);
  setDoubtCount(1);
  setDoubtQuery("");

  // ✅ Trigger board to restart rendering
  setPlayTrigger(prev => prev + 1);
};
const handleDoubtSearch = async () => {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: doubtQuery }),
  });
  const data = await res.json();

  const doubtIntro = `✋ Doubt ${doubtCount}: ${doubtQuery}`;
  const doubtResponse = data.result;
  const resumeLine = `📌 Let's come back to our topic.`;

  setSegments(prev => {
    const insertAt = prev.lastIndexOf("📌 Let's come back to our topic.") || prev.length;
    const before = prev.slice(0, insertAt);
    const after = prev.slice(insertAt);

    return [...before, doubtIntro, doubtResponse, resumeLine, ...after];
  });

  setDoubtCount(prev => prev + 1);
  setDoubtQuery("");

  // ✅ Trigger board to resume rendering new content
  setPlayTrigger(prev => prev + 1);
};

  const handleMakeNotes = async () => {
  const res = await fetch("/api/classroom-notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      question: query, // main question or topic
      responses: segments.join("\n\n"), // all responses in 1 string
    }),
  });

  const data = await res.json();
  alert(data.result); // show success/fail message
};

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top Bar */}
      <div className="w-full bg-black text-white flex items-center justify-between px-4 py-3 relative">
        <div className="text-xl font-bold">OROVE</div>
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center w-[60%] max-w-xl">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-9 px-3 rounded-l-md bg-gray-800 text-white focus:outline-none"
            placeholder="Start a topic..."
          />
          <button onClick={handleSearch} className="h-9 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-r-md">
            <FaSearch />
          </button>
        </div>
        <div className="w-[80px]"></div>
      </div>

      {/* Blackboard */}
      <div className="flex-1 bg-black flex justify-center items-center">
        <div className="w-full h-full max-w-screen-xl mx-auto flex justify-center items-center">
          <Blackboard segments={segments} playTrigger={playTrigger} />

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-white flex flex-wrap items-center justify-between px-4 py-3 gap-2">
        <button  onClick={handleMakeNotes} className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-blue-700">
          <FaDownload />
          Make Notes
        </button>
        <div className="flex items-center gap-4">
          <button className="text-blue-700 text-xl hover:scale-110"><FaPause /></button>
          <button className="text-blue-700 text-xl hover:scale-110"><FaPlay /></button>
        </div>
        <div className="flex-1 flex items-center max-w-sm bg-blue-500 rounded-full px-2 py-1">
          <input
            type="text"
            value={doubtQuery}
            onChange={(e) => setDoubtQuery(e.target.value)}
            placeholder="Ask a doubt..."
            className="flex-1 bg-transparent text-white placeholder-white px-2 outline-none"
          />
          <button onClick={handleDoubtSearch} className="text-white hover:scale-110">
            <FaSearch />
          </button>
        </div>
        <button className="bg-blue-600 w-10 h-10 flex items-center justify-center rounded-full text-white text-lg hover:bg-blue-700">
          <FaMicrophone />
        </button>
      </div>
    </div>
  );
}
