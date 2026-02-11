import React, { useState, FC, FormEvent, ChangeEvent } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';

const ChatBot: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: 'Hi! How can I help you with account detection today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: input }]);
    setInput('');

    // Simulate bot response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: 'Thanks for your message. How else can I help?' }]);
    }, 500);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition hover:scale-110 z-40"
          title="Chat Support"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 left-6 w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col z-40">
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between rounded-t-lg">
            <h3 className="font-bold">Support Chat</h3>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-blue-700 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
