import { useState } from "react";

type Message = {
  sender: "user" | "bot";
  text: string;
};

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: "user", text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");

    try {
      const response = await fetch(
        "https://chatbot-api-zwii.onrender.com/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        }
      );
      const data = await response.json();
      typeOutMessage(data.response);
    } catch (error) {
      console.error("Error fetching bot response:", error);
    }
  };

  const typeOutMessage = (message: string) => {
    setTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index < message.length) {
        const botMessage: Message = {
          sender: "bot",
          text: message.slice(0, index + 1),
        };

        setMessages((prevMessages) => {
          // Check if the last message is an incomplete bot message and replace it if so
          const lastMessage = prevMessages[prevMessages.length - 1];
          if (lastMessage?.sender === "bot" && lastMessage.text !== message) {
            return [...prevMessages.slice(0, -1), botMessage];
          } else {
            return [...prevMessages, botMessage];
          }
        });

        index++;
      } else {
        clearInterval(interval);
        setTyping(false);
      }
    }, 3);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-11/12 bg-white rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-3xl font-bold text-center text-gray-800 p-4">
          Aridient's AI Chatbot
        </h2>

        <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-b-lg">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg shadow-md transition duration-300 ${
                  message.sender === "user"
                    ? "max-w-[70%] bg-blue-500 text-white transform"
                    : "max-w-[98%] bg-gray-300 text-gray-800 transform"
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="max-w-xs px-4 py-2 rounded-lg bg-gray-300 text-gray-800 shadow-md animate-pulse">
                Typing...
              </div>
            </div>
          )}
        </div>

        <div className="flex p-4 border-t border-gray-200">
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 transition duration-200 ease-in-out"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
