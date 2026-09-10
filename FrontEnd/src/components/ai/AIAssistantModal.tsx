'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Send,
  User,
  RotateCcw,
  Copy,
  Check,
  FileText,
  MessageSquare,
  ChevronDown,
  Maximize2,
  Minimize2,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  sendAIChat,
  fetchAITeamSummary,
  fetchSuggestedPrompts,
  AIChatMessage,
} from '@/api/ai';

/**
 * Lightweight helper to render markdown styling safely
 */
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 text-xs sm:text-sm leading-relaxed text-slate-800">
      {lines.map((line, idx) => {
        // Headers
        if (line.startsWith('### ')) {
          return (
            <h4 key={idx} className="font-bold text-slate-900 text-sm mt-3 mb-1 flex items-center gap-1.5">
              {line.replace('### ', '')}
            </h4>
          );
        }
        if (line.startsWith('## ')) {
          return (
            <h3 key={idx} className="font-bold text-slate-900 text-sm sm:text-base mt-3 mb-1 border-b border-slate-200 pb-1">
              {line.replace('## ', '')}
            </h3>
          );
        }
        // Bullet list item
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          const text = line.trim().replace(/^[-*]\s+/, '');
          return (
            <li key={idx} className="ml-4 list-disc text-slate-700">
              <InlineFormatting text={text} />
            </li>
          );
        }
        // Numbered list item
        if (/^\d+\.\s+/.test(line.trim())) {
          const text = line.trim().replace(/^\d+\.\s+/, '');
          return (
            <li key={idx} className="ml-4 list-decimal text-slate-700">
              <InlineFormatting text={text} />
            </li>
          );
        }
        // Empty line
        if (!line.trim()) {
          return <div key={idx} className="h-1" />;
        }
        // Regular paragraph
        return (
          <p key={idx} className="text-slate-700">
            <InlineFormatting text={line} />
          </p>
        );
      })}
    </div>
  );
}

/**
 * Helper to parse bold, italics, and inline code
 */
function InlineFormatting({ text }: { text: string }) {
  // Simple regex parser for **bold** and `code`
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="px-1.5 py-0.5 rounded bg-slate-100 text-brand-700 font-mono text-[11px]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

export function AIAssistantModal() {
  const { user, isManager, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'summary'>('chat');

  // Chat State
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      role: 'assistant',
      content: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! I am your **TeamTrack AI Copilot** powered by Google Gemini. 
      
Ask me anything about:
- **Weekly team progress** & sprint deliverables
- **Active blockers** and system bottlenecks
- **Workload analysis** and hours logged per project
- **Report review guidance** and action items`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Suggestions
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'What did the team work on last week?',
    'Which projects have open blockers?',
    'Are there any workload imbalances?',
    'What are the critical items awaiting review?',
  ]);

  // Executive Summary State
  const [summaryData, setSummaryData] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryTimestamp, setSummaryTimestamp] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchSuggestedPrompts()
        .then((prompts) => {
          if (prompts && prompts.length > 0) {
            setSuggestedPrompts(prompts);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch dynamic prompt suggestions:', err);
        });
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, activeTab]);

  const handleSend = async (queryText?: string) => {
    const query = (queryText || input).trim();
    if (!query || isTyping) return;

    setErrorMsg(null);
    const newHistory: AIChatMessage[] = [...messages, { role: 'user', content: query }];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    try {
      // Format history for backend Gemini API
      const historyPayload = messages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await sendAIChat(query, historyPayload);

      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: res.reply,
          model: res.model,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'An error occurred';
      setErrorMsg(errMsg);
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: `⚠️ **Unable to generate response**: ${errMsg}. Please try again.`,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchAITeamSummary();
      setSummaryData(res.summary);
      setSummaryTimestamp(new Date(res.generatedAt).toLocaleString());
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleCopyMessage = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleCopySummary = () => {
    if (summaryData) {
      navigator.clipboard.writeText(summaryData);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        role: 'assistant',
        content: 'Conversation history cleared. How else can I assist you with TeamTrack today?',
      },
    ]);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white font-semibold text-sm shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
          title="Ask TeamTrack AI Copilot"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400"></span>
            </span>
          </div>
          <span>TeamTrack Copilot</span>
        </button>
      )}

      {/* Floating Chat Drawer / Modal */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col transition-all duration-300 ${
            isExpanded
              ? 'inset-4 sm:inset-10 md:inset-16 max-w-5xl mx-auto h-[calc(100vh-5rem)]'
              : 'bottom-6 right-6 w-[94vw] max-w-sm sm:max-w-md h-[580px]'
          }`}
        >
          {/* Top Header */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold leading-tight tracking-tight">TeamTrack Copilot</h4>
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Grounded with Live Database RAG
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors hidden sm:block"
                title={isExpanded ? 'Minimize drawer' : 'Maximize window'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close AI Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-3 pt-2 gap-2 text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 py-2 px-3 border-b-2 transition-all ${
                activeTab === 'chat'
                  ? 'border-brand-600 text-brand-600 bg-white rounded-t-lg shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Copilot Chat</span>
            </button>

            {isManager && (
              <button
                onClick={() => {
                  setActiveTab('summary');
                  if (!summaryData && !summaryLoading) {
                    handleGenerateSummary();
                  }
                }}
                className={`flex items-center gap-1.5 py-2 px-3 border-b-2 transition-all ${
                  activeTab === 'summary'
                    ? 'border-brand-600 text-brand-600 bg-white rounded-t-lg shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Executive Summary</span>
                <span className="px-1 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 border border-amber-300">
                  Manager
                </span>
              </button>
            )}
          </div>

          {/* TAB 1: COPILOT CHAT */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
              {/* Messages list */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className="relative group max-w-[86%] sm:max-w-[80%]">
                      <div
                        className={`p-3.5 rounded-2xl shadow-sm text-xs sm:text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-brand-600 text-white rounded-tr-none'
                            : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                        }`}
                      >
                        {m.role === 'assistant' ? (
                          <MarkdownRenderer content={m.content} />
                        ) : (
                          <div className="whitespace-pre-wrap">{m.content}</div>
                        )}
                      </div>

                      {/* Message actions */}
                      {m.role === 'assistant' && (
                        <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-slate-400">
                          <span>{m.model ? `Gemini Flash` : ''}</span>
                          <button
                            onClick={() => handleCopyMessage(m.content, idx)}
                            className="p-1 rounded hover:text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1"
                            title="Copy response"
                          >
                            {copiedIndex === idx ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span className="text-emerald-600 font-medium">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    {m.role === 'user' && (
                      <div className="w-7 h-7 rounded-xl bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                        {user?.name ? user.name[0].toUpperCase() : <User className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 pl-9 text-slate-500 text-xs">
                    <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-brand-600 animate-spin" />
                    </div>
                    <div className="flex items-center gap-1 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-slate-500 font-medium text-xs">Thinking & querying data</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Dynamic Suggested Prompt Chips */}
              <div className="px-3 py-2 bg-slate-100/90 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0 no-scrollbar">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 shrink-0">
                  Try:
                </span>
                {suggestedPrompts.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    disabled={isTyping}
                    className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-slate-200 text-slate-600 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input & Toolbar */}
              <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about team tasks, blockers, workload, or metrics..."
                    disabled={isTyping}
                    className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:bg-slate-50 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className="p-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white hover:from-brand-700 hover:to-indigo-700 transition-all disabled:opacity-40 shadow-sm"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>Role-based privacy enforced</span>
                  </div>
                  <button
                    onClick={handleClearHistory}
                    className="hover:text-slate-600 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear chat</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EXECUTIVE TEAM SUMMARY */}
          {activeTab === 'summary' && isManager && (
            <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
              <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-600" />
                    AI-Generated Team Intelligence Summary
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Synthesizes cross-project velocity, critical blockers, and capacity distribution.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateSummary}
                    disabled={summaryLoading}
                    className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${summaryLoading ? 'animate-spin' : ''}`} />
                    <span>{summaryLoading ? 'Generating...' : 'Refresh Summary'}</span>
                  </button>
                  {summaryData && (
                    <button
                      onClick={handleCopySummary}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Copy full summary"
                    >
                      {copiedSummary ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                {summaryLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 animate-pulse">
                      <Sparkles className="w-6 h-6 animate-spin" />
                    </div>
                    <div>
                      <h5 className="font-semibold text-slate-900 text-sm">Synthesizing Reports & Blockers</h5>
                      <p className="text-xs text-slate-500 max-w-sm mt-1">
                        Analyzing recent weekly submissions, hours distribution, and blocker logs...
                      </p>
                    </div>
                  </div>
                ) : summaryData ? (
                  <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Executive AI Intelligence
                      </span>
                      <span>{summaryTimestamp ? `Updated ${summaryTimestamp}` : ''}</span>
                    </div>

                    <MarkdownRenderer content={summaryData} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
                    <FileText className="w-10 h-10 text-slate-400" />
                    <div>
                      <h5 className="font-semibold text-slate-800 text-sm">No Summary Generated Yet</h5>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">
                        Click below to generate a multi-project executive report with blocker and capacity analysis.
                      </p>
                    </div>
                    <button
                      onClick={handleGenerateSummary}
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-500/20 transition-all"
                    >
                      Generate Team Summary
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
