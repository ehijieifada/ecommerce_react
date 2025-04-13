import { useState } from "react";
import Chatbot from "../components/Chatbot";
import { ChatBubbleLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";

const ChatBubble = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div
          className="
            fixed bottom-24 right-4
            w-[90vw] max-w-[260px] h-[320px]
            bg-white border shadow-lg rounded-lg z-50 overflow-hidden
          "
        >
          <Chatbot />
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-md transition"
        aria-label="Toggle Chatbot"
      >
        {isOpen ? (
          <XMarkIcon className="h-5 w-5" />
        ) : (
          <ChatBubbleLeftIcon className="h-5 w-5" />
        )}
      </button>
    </>
  );
};

export default ChatBubble;
