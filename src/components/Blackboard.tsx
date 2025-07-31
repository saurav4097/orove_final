'use client';
import { useEffect, useState, useRef } from "react";
import "@fontsource/shadows-into-light";
import "./blackboard.css";

// Markdown parser
function parseMarkdown(text: string): string {
  return text
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

export default function Blackboard({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);

  const ref = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const fullTextRef = useRef(text);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Cancel existing speech
    if (synthRef.current?.speaking) {
      synthRef.current.cancel();
    }

    // Reset text and state
    setDisplayText("");
    indexRef.current = 0;
    fullTextRef.current = text;
    setIsPlaying(true);
    clearInterval(intervalRef.current!);

    // Setup voice
    synthRef.current = window.speechSynthesis;
    utteranceRef.current = new SpeechSynthesisUtterance(text);
    utteranceRef.current.rate = 1;
    utteranceRef.current.pitch = 1;
    utteranceRef.current.lang = "en-US";

    const speak = () => {
      const voices = synthRef.current!.getVoices();
      if (voices.length > 0) {
        utteranceRef.current!.voice = voices.find(v => v.lang === 'en-US') || voices[0];
      }
      synthRef.current!.speak(utteranceRef.current!);
    };

    // Wait for voices to load before speaking
    if (synthRef.current.getVoices().length === 0) {
      synthRef.current.onvoiceschanged = speak;
    } else {
      speak();
    }

    // Setup typing effect
    intervalRef.current = setInterval(writeNextChar, 50);

    return () => {
      clearInterval(intervalRef.current!);
      synthRef.current?.cancel();
    };
  }, [text]);

  const writeNextChar = () => {
    const i = indexRef.current;
    const full = fullTextRef.current;

    if (i < full.length) {
      setDisplayText((prev) => prev + full.charAt(i));
      indexRef.current += 1;
    } else {
      clearInterval(intervalRef.current!);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current!);
    if (synthRef.current?.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    if (indexRef.current < fullTextRef.current.length) {
      intervalRef.current = setInterval(writeNextChar, 50);
    }
    if (synthRef.current?.paused) {
      synthRef.current.resume();
    }
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [displayText]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* Blackboard */}
      <div
        ref={ref}
        className="blackboard w-[90%] h-[90%] overflow-y-auto p-6 rounded-xl border border-white"
      >
        <div
          className="chalk-text text-white text-lg"
          dangerouslySetInnerHTML={{ __html: parseMarkdown(displayText) }}
        />
      </div>

      {/* Play/Pause Buttons */}
      <div className="mt-4 flex gap-4">
        {!isPlaying ? (
          <button
            onClick={handlePlay}
            className="bg-green-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-green-700 shadow-md transition duration-200"
          >
            ▶️ Resume
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="bg-red-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-red-700 shadow-md transition duration-200"
          >
            ⏸ Pause
          </button>
        )}
      </div>
    </div>
  );
}
