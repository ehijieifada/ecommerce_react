import { useState } from "react";
import Chatbot from "../components/Chatbot";
import { ChatBubbleLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-[360px] h-[480px] bg-white border shadow-2xl rounded-xl z-50 overflow-hidden">
          <Chatbot />
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition"
        aria-label="Toggle Chatbot"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftIcon className="h-6 w-6" />
        )}
      </button>
    </>
  );
};

export default ChatBubble;
