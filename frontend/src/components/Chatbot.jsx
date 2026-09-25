import { useState, useRef, useEffect } from "react";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { fetchGeminiResponse } from "./api";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef(null); // 👈 create ref

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setInput("");
    setIsLoading(true);

    const response = await fetchGeminiResponse(input);
    setMessages((prev) => [...prev, { text: response, isUser: false }]);
    setIsLoading(false);
  };

  // 👇 Auto-scroll to bottom when messages update
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="flex h-full flex-col bg-stone-50 text-sm text-slate-900">
      <div className="border-b border-stone-200 bg-slate-900 px-4 py-3 text-white">
        <p className="font-semibold">BlissTech Assistant</p>
        <p className="mt-0.5 text-xs text-slate-300">Here to help you shop smarter</p>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-3 py-2 rounded-lg max-w-[85%] break-words ${
                msg.isUser
                  ? "rounded-br-sm bg-orange-500 text-white"
                  : "rounded-bl-sm border border-stone-200 bg-white text-slate-700 shadow-sm"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="mt-2 flex justify-start">
            <div className="rounded-bl-sm rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
              Thinking...
            </div>
          </div>
        )}

        {/* 👇 Scroll target */}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex items-center gap-2 border-t border-stone-200 bg-white p-3"
        onSubmit={(event) => {
          event.preventDefault();
          handleSend();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
          placeholder="Ask me about the company"
          aria-label="Ask the BlissTech Assistant"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          aria-label="Send message"
          title="Send message"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white shadow-sm transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-1 disabled:cursor-not-allowed disabled:bg-stone-300 disabled:shadow-none"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
