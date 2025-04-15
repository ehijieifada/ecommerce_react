import { useState, useRef, useEffect } from "react";
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
    <div className="flex flex-col h-full p-2 bg-gray-100 text-sm">
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`px-3 py-2 rounded-lg max-w-[85%] break-words ${
                msg.isUser ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-center mt-2">
            <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
          </div>
        )}

        {/* 👇 Scroll target */}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-1 mt-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
          className="flex-1 p-1.5 text-sm border rounded"
          placeholder="Ask me anything"
        />
        <button
          onClick={handleSend}
          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
