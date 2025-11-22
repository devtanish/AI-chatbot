"use client";

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, ChevronDown, Home, MessageSquare, ChevronLeft } from 'lucide-react';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  time: Date;
}

interface QAItem {
  keywords: string[];
  answer: string;
}

interface Professor {
  name: string;
  department: string;
  email: string;
}

interface Event {
  name: string;
  date: string;
  location: string;
}

const PREDEFINED_QA: Record<string, QAItem> = {
  admission: {
    keywords: ["admission", "apply", "application", "enroll", "enrollment", "join"],
    answer: "To apply for admission, visit our Admissions page and fill out the online application form. Required documents include: transcripts, ID proof, and passport photos. Application deadline is March 31st for Fall semester."
  },
  fees: {
    keywords: ["fee", "fees", "cost", "tuition", "payment", "price"],
    answer: "Our tuition fees vary by program:\n• Undergraduate: $5,000/semester\n• Graduate: $7,500/semester\n\nPayment can be made online through the student portal. We also offer installment plans and financial aid."
  },
  contact: {
    keywords: ["contact", "phone", "email", "reach", "support", "helpdesk"],
    answer: "You can reach us at:\n📧 Email: support@university.edu\n📞 Phone: +1-800-123-4567\n🕐 Office Hours: Mon-Fri 9AM-5PM"
  },
  courses: {
    keywords: ["course", "courses", "program", "programs", "subjects", "classes"],
    answer: "We offer 50+ courses across Engineering, Business, Arts, and Sciences. Visit our Course Catalog for detailed information on each program, prerequisites, and credit hours."
  },
  exam: {
    keywords: ["exam", "examination", "test", "schedule", "midterm", "final"],
    answer: "Exam schedules are posted on the student portal 2 weeks before exams. Midterms are typically in Week 8, Finals in Week 16."
  },
  library: {
    keywords: ["library", "book", "books", "borrow", "resources"],
    answer: "The library is open Mon-Sat, 8AM-10PM. Students can borrow up to 5 books for 14 days. Digital resources are available 24/7 through the student portal."
  },
  scholarship: {
    keywords: ["scholarship", "financial aid", "grant", "funding"],
    answer: "We offer merit-based and need-based scholarships. Apply through the Financial Aid office by February 15th. Requirements include minimum 3.5 GPA."
  }
};

const DATABASE: { professors: Professor[]; events: Event[] } = {
  professors: [
    { name: "Dr. Sarah Johnson", department: "Computer Science", email: "s.johnson@uni.edu" },
    { name: "Dr. Michael Chen", department: "Mathematics", email: "m.chen@uni.edu" }
  ],
  events: [
    { name: "Career Fair", date: "Nov 25, 2025", location: "Main Hall" },
    { name: "Tech Workshop", date: "Dec 5, 2025", location: "Lab 101" }
  ]
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [view, setView] = useState<'home' | 'chat'>('home');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "👋 Hi! I'm Apollo, an AI Assistant. Ask me anything about admissions, courses, fees, or any other questions!", time: new Date() }
  ]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findPredefinedAnswer = (question: string): string | null => {
    const lowerQ = question.toLowerCase();
    for (const qa of Object.values(PREDEFINED_QA)) {
      if (qa.keywords.some((kw: string) => lowerQ.includes(kw))) {
        return qa.answer;
      }
    }
    return null;
  };

  const searchDatabase = (question: string): string | null => {
    const lowerQ = question.toLowerCase();
    if (lowerQ.includes("professor") || lowerQ.includes("teacher") || lowerQ.includes("faculty")) {
      return "Our faculty members:\n" + DATABASE.professors.map((p: Professor) => `• ${p.name} - ${p.department}\n  📧 ${p.email}`).join("\n");
    }
    if (lowerQ.includes("event") || lowerQ.includes("workshop") || lowerQ.includes("happening")) {
      return "Upcoming events:\n" + DATABASE.events.map((e: Event) => `• ${e.name}\n  📅 ${e.date} | 📍 ${e.location}`).join("\n");
    }
    return null;
  };

  const sendToBackend = async (message: string): Promise<string> => {
    try {
      const response = await axios.get('/api/v1/bot', {
        params: { message }
      });
      console.log(response.data);

      return response.data.message || "This is a placeholder response from the backend.";
    } catch (error) {
      console.error("There was an error!", error);
      return "Error: Unable to connect to backend.";
    }
  };

  const handleSend = async (): Promise<void> => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, time: new Date() }]);
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 1000));

    let response = findPredefinedAnswer(userMessage);
    if (!response) {
      response = searchDatabase(userMessage);
    }
    if (!response) {
      response = "I'm not sure about that. Could you please rephrase your question or ask about admissions, fees, courses, exams, or events? You can also contact our support team for more help.";
    }

    setMessages(prev => [...prev, { role: 'assistant', content: response as string, time: new Date() }]);
    setIsTyping(false);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickQuestions: string[] = ["How do I apply?", "What are the fees?", "Show events"];

  return (
    <div className="min-h-screen bg-linear-to-br flex items-center justify-center p-4">
      <div className="relative">
        {isOpen && (
          <div className="w-80 h-[500px] border border-black bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {view === 'home' && (
              <>
                <div className="bg-emerald-500 text-white p-4 rounded-t-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <ChevronLeft className="w-5 h-5 opacity-0" />
                    <span className="font-semibold text-lg">Messages</span>
                  </div>
                </div>

                <div className="flex-1 bg-white p-4">
                  <h3 className="text-gray-800 font-semibold mb-3">Start a new chat</h3>
                  
                  <button 
                    onClick={() => setView('chat')}
                    className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-md transition mb-6"
                  >
                    <div className="text-left">
                      <p className="font-semibold text-gray-800">New Conversation</p>
                      <p className="text-gray-500 text-sm">We typically reply in a few minutes</p>
                    </div>
                    <Send className="w-5 h-5 text-emerald-500" />
                  </button>

                  <h3 className="text-gray-800 font-semibold mb-3">Recent</h3>
                  
                  <button 
                    onClick={() => setView('chat')}
                    className="w-full bg-white border border-gray-100 rounded-xl p-3 flex items-center gap-3 hover:bg-gray-50 transition"
                  >
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">🤖</span>
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-800">Apollo</p>
                        <span className="text-xs text-gray-400">now</span>
                      </div>
                      <p className="text-gray-500 text-sm truncate">👋 Hi! I'm Apollo, an AI Assistant...</p>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180" />
                  </button>
                </div>

                <div className="bg-white border-t border-gray-200 p-3 flex justify-around rounded-b-2xl">
                  <button className="flex flex-col items-center text-emerald-500">
                    <Home className="w-6 h-6" />
                  </button>
                  <button onClick={() => setView('chat')} className="flex flex-col items-center text-gray-400 hover:text-emerald-500">
                    <MessageSquare className="w-6 h-6" />
                  </button>
                </div>
              </>
            )}

            {view === 'chat' && (
              <>
                <div className="bg-emerald-500 text-white p-4 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setView('home')} className="hover:opacity-80">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <span>🤖</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">Apollo</p>
                      <p className="text-xs text-emerald-100">AI Assistant • Online</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 bg-gray-50 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg: Message, i: number) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[80%]">
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-xs">🤖</span>
                            </div>
                            <span className="text-xs text-gray-500">Apollo</span>
                          </div>
                        )}
                        <div className={`rounded-2xl px-4 py-2 ${
                          msg.role === 'user' 
                            ? 'bg-emerald-500 text-white rounded-br-sm' 
                            : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        <p className={`text-xs text-gray-400 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                          {formatTime(msg.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {messages.length <= 2 && (
                  <div className="bg-gray-50 px-4 pb-2 flex gap-2 overflow-x-auto">
                    {quickQuestions.map((q: string, i: number) => (
                      <button
                        key={i}
                        onClick={() => setInput(q)}
                        className="text-xs bg-white text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-200 hover:bg-emerald-50 whitespace-nowrap"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                <div className="bg-white border-t border-gray-200 p-3 rounded-b-2xl">
                  <div className="flex gap-2 items-center">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={async () => {
                        setInput('');
                        setMessages(prev => [...prev, { role: 'user', content: input.trim(), time: new Date() }]);
                        const data = await sendToBackend(input); 
                        setMessages(prev => [...prev, { role: 'assistant', content: data, time: new Date() }]);
                      }}
                      disabled={!input.trim() || isTyping}
                      className="bg-emerald-500 text-white p-2 rounded-full hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
            
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
              <div className="flex items-center gap-1 text-xs text-gray-400 bg-white px-3 py-1 rounded-full shadow">
                <span>🤖</span>
                <span>Powered by Apollo AI</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute -bottom-16 -right-4 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition flex items-center justify-center"
        >
          {isOpen ? <ChevronDown className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}