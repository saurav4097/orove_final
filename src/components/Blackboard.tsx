'use client';
import { useEffect, useRef, useState } from "react";
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

    synthRef.current = window.speechSynthesis;

    resetAnimation();

    return () => {
      clearInterval(intervalRef.current!);
      synthRef.current?.cancel();
    };
  }, [text]);

  const resetAnimation = () => {
    setDisplayText("");
    indexRef.current = 0;
    fullTextRef.current = text;
    setIsPlaying(true);
    clearInterval(intervalRef.current!);

    speakFromIndex(0);
    intervalRef.current = setInterval(writeNextChar, 50);
  };

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

  const speakFromIndex = (startIndex: number) => {
    const remainingText = fullTextRef.current.slice(startIndex);
    if (!remainingText.trim()) return;

    synthRef.current?.cancel(); // stop any ongoing speech

    const utterance = new SpeechSynthesisUtterance(remainingText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    const voices = synthRef.current?.getVoices();
    if (voices?.length) {
      utterance.voice = voices.find(v => v.lang === "en-US") || voices[0];
    }

    utteranceRef.current = utterance;
    synthRef.current?.speak(utterance);
  };

  const handlePause = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current!);
    synthRef.current?.cancel();
  };

  const handlePlay = () => {
    if (indexRef.current >= fullTextRef.current.length) return;
    setIsPlaying(true);
    intervalRef.current = setInterval(writeNextChar, 50);
    speakFromIndex(indexRef.current);
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
