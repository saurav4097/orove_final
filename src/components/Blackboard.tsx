'use client';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import mermaid from "mermaid";
import { useEffect, useRef, useState } from "react";
import "@fontsource/shadows-into-light";
import "./blackboard.css";
import { useBlackboardStore } from "@/store/useBlackboardStore";


// ---- Mermaid diagram renderer (Mermaid v10+ Promise API) ----
function MermaidChart({ chart }: { chart: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!ref.current) return;

      // initialize once per render
      mermaid.initialize({ startOnLoad: false, theme: "dark" });

      try {
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, chart);
        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (e) {
        if (ref.current) {
          ref.current.innerHTML = `<pre style="color:#f88">Mermaid render error</pre>`;
        }
        // optional: console.error(e);
      }
    })();

    return () => {
      cancelled = true;
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [chart]);

  return <div ref={ref} className="mermaid-chart" />;
}

function parseMarkdown(text: string): string {
  return text
    .replace(/^# (.*$)/gim, "<h1>$1</h1>")
    .replace(/^## (.*$)/gim, "<h2>$1</h2>")
    .replace(/\*\*(.*?)\*\*/gim, "<strong>$1</strong>")
    .replace(/\n/g, "<br />");
}

export default function Blackboard({
  segments,
  segments2,
  playTrigger,
   paused, 
   greeting 
}: {
  segments: string[];
  segments2: string[];
  playTrigger: number;
  paused: boolean; 
  greeting?: string;
}) {
  const [displayText, setDisplayText] = useState("");
  const [isPlaying, setIsPlaying] = useState(true);
 const { setCurrentIndex } = useBlackboardStore();
 const [isHinglishMode, setIsHinglishMode] = useState(true); // 🔹 default Hinglish
  const ref = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const fullTextRef = useRef("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const writeNextChar = () => {
    const i = indexRef.current;
    const full = fullTextRef.current;
    if (i < full.length) {
      setDisplayText((prev) => prev + full.charAt(i));
      indexRef.current += 1;
        setCurrentIndex(indexRef.current);
    } else {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
    }
  };

  const speakFromIndex = (startIndex: number) => {
    synthRef.current?.cancel();

   // Choose text & language based on mode
  const speakText = isHinglishMode
    ? segments2.join("\n\n").slice(startIndex) // Hinglish text
    : segments.join("\n\n").slice(startIndex); // English text

    if (!speakText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(speakText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = isHinglishMode ? "en-IN" : "en-US"; // Hinglish → Indian English, English → US English

     const voices = synthRef.current?.getVoices();
  if (voices?.length) {
    const voice = voices.find(v => v.lang === utterance.lang)
      || voices.find(v => v.lang.startsWith(isHinglishMode ? "en-IN" : "en-US"))
      || voices[0];
    if (voice) utterance.voice = voice;
  }
     utteranceRef.current = utterance;
    synthRef.current?.speak(utterance);
  };


  const handlePause = () => {
    setIsPlaying(false);
    clearInterval(intervalRef.current!);
    intervalRef.current = null;
    synthRef.current?.cancel();
  };

  const handlePlay = () => {
    if (indexRef.current >= fullTextRef.current.length) return;
    setIsPlaying(true);
    if (!intervalRef.current) {
      intervalRef.current = setInterval(writeNextChar, 50);
    }
      speakFromIndex(indexRef.current);
    
  };
   // Button handlers
const switchToEnglish = () => {
  setIsHinglishMode(false);
  fullTextRef.current = segments.join(" \n\n");
  speakFromIndex(indexRef.current);
};

const switchToHinglish = () => {
  setIsHinglishMode(true);
  fullTextRef.current = segments2.join(" \n\n");
  speakFromIndex(indexRef.current);
};
 // Handle new text segments
  useEffect(() => {
    const currentFullText = fullTextRef.current;
    const newFullText = segments.join(" \n\n");

    if (newFullText.length > currentFullText.length) {
      fullTextRef.current = newFullText;
      if (!intervalRef.current && isPlaying) {
        intervalRef.current = setInterval(writeNextChar, 50);
      }
    } else {
      fullTextRef.current = newFullText;
      setDisplayText("");
      indexRef.current = 0;
      clearInterval(intervalRef.current!);
      synthRef.current?.cancel();

      if (isPlaying) {
        intervalRef.current = setInterval(writeNextChar, 50);
        speakFromIndex(0);
      }
    }
  }, [segments]);


  useEffect(() => {
    if (typeof window === "undefined") return;
    synthRef.current = window.speechSynthesis;

    return () => {
      clearInterval(intervalRef.current!);
      synthRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    // If greeting exists, show and speak it
    if (greeting) {
      fullTextRef.current = greeting;
      setDisplayText("");
      indexRef.current = 0;
      clearInterval(intervalRef.current!);
      intervalRef.current = setInterval(writeNextChar, 50);
      speakFromIndex(0);
    }
  }, [greeting]);

  useEffect(() => {
    if (!greeting && segments.length) {
      fullTextRef.current = segments.join(" \n\n");
      setDisplayText("");
      indexRef.current = 0;
      clearInterval(intervalRef.current!);
      intervalRef.current = setInterval(writeNextChar, 50);
      speakFromIndex(0);
    }
  }, [playTrigger]);

  
  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [displayText]);

  // Pause/resume logic
  useEffect(() => {
    if (paused) {
      clearInterval(intervalRef.current!);
      intervalRef.current = null;
      synthRef.current?.cancel();
    } else {
      if (!intervalRef.current && isPlaying) {
        intervalRef.current = setInterval(writeNextChar, 50);
      }
      if (isPlaying) {
        speakFromIndex(indexRef.current);
      }
    }
  }, [paused, isPlaying]);

// ---- Typed Markdown with code + Mermaid ----
  const CodeBlock = (props: any) => {
    const { inline, className, children, ...rest } = props;
    const match = /language-(\w+)/.exec(className || "");

    if (match?.[1] === "mermaid") {
      return <MermaidChart chart={String(children).trim()} />;
    }

    if (!inline && match) {
      return (
        <SyntaxHighlighter
          style={materialDark}
          language={match[1]}
          PreTag="div"
          {...rest}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      );
    }

    return (
      <code className={className} {...rest}>
        {children}
      </code>
    );
     };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* 🔹 Language Switch Buttons */}
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          onClick={switchToEnglish }
          className={`px-3 py-1 rounded ${!isHinglishMode ? "bg-blue-600 text-white" : "bg-gray-300"}`}
        
        >
          
          English
        </button>
        <button
          onClick={switchToHinglish}
          className={`px-3 py-1 rounded ${isHinglishMode ? "bg-green-600 text-white" : "bg-gray-300"}`}
        >
          Hinglish
        </button>
      </div>
      <div
        ref={ref}
        className="blackboard w-[90%] h-[90%] overflow-y-auto p-6 rounded-xl border border-white"
      >
        <div className="chalk-text text-white text-lg prose prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code: CodeBlock,
            }}
          >
            {displayText}
          </ReactMarkdown>
        </div>
      </div>

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