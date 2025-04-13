import { useState } from "react";
import { fetchGeminiResponse } from "./api";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);  // Loading state

  const handleSend = async () => {
    if (!input.trim()) return;

    // add user message immediately
    setMessages((prev) => [...prev, { text: input, isUser: true }]);
    setInput("");
    setIsLoading(true);  // Set loading state to true

    // Get AI response
    const response = await fetchGeminiResponse(input);
    setMessages((prev) => [...prev, { text: response, isUser: false }]);
    setIsLoading(false);  // Set loading state to false
  };

  return (
    <div className="flex flex-col h-full p-4 bg-gray-100">
      <div className="flex-1 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className={`p-3 rounded-lg max-w-xs ${
                msg.isUser ? "bg-blue-500 text-white" : "bg-gray-300"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        
        {/* Show loading indicator while AI is processing */}
        {isLoading && (
        <div className="flex justify-center mt-2">
            <div className="w-3 h-3 bg-black rounded-full animate-bounce"></div>
        </div>
        )}

      </div>

      <div className="flex items-center space-x-2">
        <input
         type="text"
         value={input}
         onChange={(e) => setInput(e.target.value)}
         onKeyDown={(e) => {
           if (e.key === "Enter") {
             handleSend();
           }
         }}
         className="flex-1 p-2 border rounded"
         placeholder="Ask me anything!"
        />
        <button onClick={handleSend} className="p-2 bg-red-500 text-white rounded hover:bg-green-500">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
