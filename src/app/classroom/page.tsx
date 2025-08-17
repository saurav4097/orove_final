
// ---------- ClassroomPage.tsx ----------
'use client';
import { useEffect, useState } from "react";
import Blackboard from "@/components/Blackboard";
import { useBlackboardStore } from "@/store/useBlackboardStore";
import { FaDownload, FaPause, FaPlay, FaSearch, FaMicrophone } from 'react-icons/fa';
 import { useRouter } from "next/navigation";

export default function ClassroomPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [query, setQuery] = useState("");
  const [doubtQuery, setDoubtQuery] = useState("");
  const [segments, setSegments] = useState<string[]>([]);
   const [segments2, setSegments2] = useState<string[]>([]);
  const [doubtCount, setDoubtCount] = useState(1);
const [playTrigger, setPlayTrigger] = useState(0);
const { currentIndex } = useBlackboardStore();// store live writing index
const router = useRouter();
  const [paused, setPaused] = useState(false);
const [loading, setLoading] = useState(false);
const [greeting, setGreeting] = useState<string>("");
const [user, setUser] = useState({ username: '', email: '',isPremium:false,tried:0 });
 // Fetch username for greeting
  useEffect(() => {
  async function fetchUser() {
    const res = await fetch("/api/check-auth");
    const data = await res.json();

    if (!data.authenticated) {
      router.push("/login");
    } else {
      setUser(data.user);
      setGreeting(`Hi ${data.user.username}, what do you want to learn today?`);
       if (!data.user.isPremium && data.user.tried >= 5) {
          setShowPopup(true); // 🔑 show paywall instead of instant redirect
        }
      
    }
  }
  fetchUser();
}, [router]);
// 🔑 Auto-redirect after showing popup
  useEffect(() => {
    if (!showPopup) return;
    const t = setTimeout(() => {
      router.push('/premium');
    }, 1500);
    return () => clearTimeout(t);
  }, [showPopup, router]);


const handleSearch = async () => {
    // 🔑 Gate before API calls
    if (!user.isPremium && user.tried >= 5) {
      setShowPopup(true);
      return;
    }
  // 1️⃣ First request - Get English version
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();

  const englishAnswer = data.result;

  // 2️⃣ Second request - Get Hinglish version
  const hinglishPrompt = `Translate the following text to Hinglish (Hindi grammar but written in English alphabets, like WhatsApp chat style). Keep meaning exactly same:\n\n${englishAnswer}`;
  
  const resHinglish = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: hinglishPrompt }),
  });
  const dataHinglish = await resHinglish.json();

  const hinglishAnswer = dataHinglish.result;

  // 3️⃣ Update both segments
  setSegments([`Topic: ${query}`, englishAnswer]);
  setSegments2([`Topic: ${query}`, hinglishAnswer]);

  // Reset doubts etc.
  setDoubtCount(1);
  setDoubtQuery("");

  // restart rendering
setPlayTrigger(prev => prev + 1);

// call backend to increase tried
await fetch("/api/increase-tried", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: user.email }),
});

// optimistic update (UI updates instantly)
setUser(prev => ({ ...prev, tried: prev.tried + 1 }));


};

const handleDoubtSearch = async () => {
  setPaused(true);       // ⏸ stop blackboard
  setLoading(true);      // show loader

  // 1️⃣ First request - Get English doubt response
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: doubtQuery }),
  });
  const data = await res.json();
  const doubtIntro = `✋ Doubt ${doubtCount}: ${doubtQuery}`;
  const doubtResponse = data.result;
  const resumeLine = `📌 Let's come back to our topic.`;

  // 2️⃣ Second request - Get Hinglish version of the doubt response
  const hinglishPrompt = `Translate the following text to Hinglish (Hindi grammar but written in English alphabets, like WhatsApp chat style). Keep the meaning exactly same:\n\n${doubtResponse}`;
  
  const resHinglish = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: hinglishPrompt }),
  });
  const dataHinglish = await resHinglish.json();
  const doubtResponseHinglish = dataHinglish.result;

  // 3️⃣ Update English segments
  setSegments(prev => {
    const fullText = prev.join(" \n\n");
    const beforeText = fullText.slice(0, currentIndex);
    const afterText = fullText.slice(currentIndex);
    const beforeSegments = beforeText.split(" \n\n");
    const afterSegments = afterText.split(" \n\n");

    return [
      ...beforeSegments,
      doubtIntro,
      doubtResponse,
      resumeLine,
      ...afterSegments
    ];
  });

  // 4️⃣ Update Hinglish segments
  setSegments2(prev => {
    const fullText = prev.join(" \n\n");
    const beforeText = fullText.slice(0, currentIndex);
    const afterText = fullText.slice(currentIndex);
    const beforeSegments2 = beforeText.split(" \n\n");
    const afterSegments2 = afterText.split(" \n\n");

    return [
      ...beforeSegments2,
      doubtIntro,
      doubtResponseHinglish,
      resumeLine,
      ...afterSegments2
    ];
  });

  // 5️⃣ Reset state
  setDoubtCount(prev => prev + 1);
  setDoubtQuery("");
  setLoading(false);
  setPaused(false); // ▶️ resume
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
//////////////////startlistening///////////////
const startListening = () => {
  if (typeof window === "undefined" || !("webkitSpeechRecognition" in window)) {
    alert("Speech recognition is not supported in this browser.");
    return;
  }

  const recognition = new (window as any).webkitSpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.onstart = () => {
    console.log("Voice recognition started. Speak now.");
  };

  recognition.onerror = (event: any) => {
    const error = event.error || "Unknown error";
    console.error("Speech recognition error:", error);

    switch (error) {
      case "not-allowed":
        alert("Microphone access denied. Please allow mic permission.");
        break;
      case "no-speech":
        alert("No speech detected. Please try again.");
        break;
      case "audio-capture":
        alert("No microphone found. Please check your device.");
        break;
      default:
        alert("Speech recognition error: " + error);
    }
  };

  recognition.onresult = (event: any) => {
    const transcript = event.results?.[0]?.[0]?.transcript;
    if (!transcript) {
      alert("Could not detect any voice input. Please try again.");
      return;
    }

    console.log("Voice input:", transcript);
    setDoubtQuery(transcript);

    setTimeout(() => {
      handleDoubtSearch(); // trigger the existing logic
    }, 100);
  };

  recognition.start();
};

//////////////////////////////////////////////
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
        <button
    onClick={() => router.push("/")}
    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-1.5 rounded-full"
  >
    Back to Home
  </button>
      
      </div>

      {/* Blackboard */}
      <div className="flex-1 bg-black flex justify-center items-center">
        <div className="w-full h-full max-w-screen-xl mx-auto flex justify-center items-center">
          <Blackboard segments={segments} segments2={segments2} playTrigger={playTrigger} paused={paused}  greeting={greeting} />
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="w-full bg-white flex flex-wrap items-center justify-between px-4 py-3 gap-2">
        <button  onClick={handleMakeNotes} className="bg-blue-600 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm hover:bg-blue-700">
          <FaDownload />
          Make Notes
        </button>
        <div className="flex items-center gap-4">
         
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
        <button  onClick={startListening} title="Speak your doubt"  className="bg-blue-600 w-10 h-10 flex items-center justify-center rounded-full text-white text-lg hover:bg-blue-700">
          <FaMicrophone />
        </button>
      </div>

      {/* 🔑 Paywall Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-white text-gray-900 w-[90%] max-w-md rounded-2xl p-6 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">🚀 Your 5 Free Tries Are Over</h2>
            <p className="mb-4">
              Unlock <span className="font-semibold">unlimited topics</span>,{' '}
              <span className="font-semibold">downloads</span>, and{' '}
              <span className="font-semibold">doubt support</span> with Premium.
            </p>
            <ul className="text-sm space-y-1 mb-5 list-disc pl-5">
              <li>Unlimited class lectures</li>
              <li>Unlimited topics & revisions</li>
              <li>Download notes anytime</li>
              <li>Priority doubt solving</li>
              <li>Access your history</li>
            </ul>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/premium')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full"
              >
                Upgrade to Premium
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 rounded-full border border-gray-300"
              >
                Not now
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              You’ll be redirected to the Premium page shortly…
            </p>
          </div>
        </div>
      )}
    </div>
  
   
  );
}