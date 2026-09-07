'use client';

import React, { useState } from 'react';
import { Bot, Sparkles, X, Send, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AIAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Hello! I am your **WorkPulse AI Copilot**. How can I help you with your weekly reporting, sprint achievements, blockers, or dashboard metrics today?',
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const sampleQuestions = [
    'What did the team work on recently?',
    'Which projects have the most workload?',
    'What are common blockers in weekly reports?',
    'How do I request a correction as manager?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newMessages);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse = '';
      const q = query.toLowerCase();

      if (q.includes('workload') || q.includes('project')) {
        botResponse =
          'According to project analytics, **Mobile Banking App** and **Analytics & Reporting Pipeline** currently have the highest task density and logged development hours.';
      } else if (q.includes('blocker') || q.includes('challenge')) {
        botResponse =
          'Key blockers reported include **Kafka broker timeout** and **Stripe sandbox webhook latency**. Make sure to highlight critical blockers with the Key Issue toggle in Section 5.';
      } else if (q.includes('correction') || q.includes('review')) {
        botResponse =
          'Managers can review submitted reports from **/manager/reports**. Clicking **Request Changes** opens a modal requiring specific feedback, switching the status to **NEEDS_CORRECTION** so team members can revise.';
      } else if (q.includes('pending') || q.includes('submitted')) {
        botResponse =
          'Reports in **SUBMITTED** status are currently awaiting manager approval. Check your **/manager/dashboard** overview to review pending items.';
      } else {
        botResponse = `Thanks for asking: "${query}". WorkPulse provides weekly task tracking, task % completions, hours categorization (dev, testing, meetings, docs), and managerial reviews with approval workflows.`;
      }

      setMessages([...newMessages, { role: 'assistant', content: botResponse }]);
      setIsTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 active:scale-95 transition-all"
        title="Ask WorkPulse AI"
      >
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <span>Ask WorkPulse AI</span>
      </button>

      {/* Floating Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px] animate-fade-in">
          {/* Drawer Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">WorkPulse Copilot</h4>
                <p className="text-[11px] text-slate-400">Team Intelligence Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[82%] text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-tl-none'
                  }`}
                >
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-slate-400 text-xs pl-9">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="px-3 py-2 bg-slate-100 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[11px]">
            {sampleQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Chat input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about reports or stats..."
              className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
