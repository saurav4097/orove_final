
'use client';
import { useEffect, useRef,useState } from "react";
import Blackboard from "@/components/Blackboard";

import { FaDownload, FaPause, FaPlay, FaSearch, FaMicrophone } from 'react-icons/fa';


export default function ClassroomPage() {
     const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleSearch = async () => {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    setResponse(data.result);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      
      {/* Top Bar */}
     <div className="w-full bg-black text-white flex items-center justify-between px-4 py-3 relative">
  {/* Left: Title */}
  <div className="text-xl font-bold">OROVE</div>

  {/* Center: Search Bar */}
  <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center w-[60%] max-w-xl">
    <input
     type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
      className="w-full h-9 px-3 rounded-l-md bg-gray-800 text-white focus:outline-none"
      placeholder="Ask something..."
    />
    <button  onClick={handleSearch}
      className="h-9 px-3 bg-gray-700 hover:bg-gray-600 text-white rounded-r-md flex items-center justify-center"
      aria-label="Search"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
      </svg>
    </button>
  </div>

  {/* Right: Reserved space for buttons or alignment */}
  <div className="w-[80px]"></div>
</div>



      {/* Main Blackboard */}
      <div className="flex-1 bg-black flex justify-center items-center">
        <div className="w-full h-full max-w-screen-xl mx-auto flex justify-center items-center">
         <Blackboard text={response || "Write your query to see results here..."} />

        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="w-full bg-white flex flex-wrap items-center justify-between px-4 py-3 gap-2">
        
        {/* Download Button */}
        <button className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-blue-700">
          <FaDownload />
          Download
        </button>

        {/* Controls: Pause and Play */}
        <div className="flex items-center gap-4">
          <button className="text-blue-700 text-xl hover:scale-110"><FaPause /></button>
          <button className="text-blue-700 text-xl hover:scale-110"><FaPlay /></button>
        </div>

        {/* Search Bar */}
        <div className="flex-1 flex items-center max-w-sm bg-blue-500 rounded-full px-2 py-1">
          <input
            type="text"
            placeholder="Search..."
            className="flex-1 bg-transparent text-white placeholder-white px-2 outline-none"
          />
          <button className="text-white hover:scale-110">
            <FaSearch />
          </button>
        </div>

        {/* Mic Button */}
        <button className="bg-blue-600 w-10 h-10 flex items-center justify-center rounded-full text-white text-lg hover:bg-blue-700">
          <FaMicrophone />
        </button>

      </div>
    </div>
  );
}