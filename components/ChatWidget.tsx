import React, { useState, useRef, useEffect } from 'react';
import { Message, ChatState } from '../types';
import { sendMessageToOllama, checkOllamaConnection } from '../services/ollamaService';
import { Send, X, MessageSquare, Loader2, Info, RefreshCw } from 'lucide-react';

const INITIAL_MESSAGE: Message = {
  role: 'assistant',
  content: 'Здравствуйте! Я виртуальный помощник ЖК "Патрики". Я знаю всё о ценах, планировках, инфраструктуре и ходе строительства. Чем могу помочь?',
  timestamp: Date.now(),
};

// Base64 SVG Logo for offline use
const LOGO_BASE64 = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyMDAgNjAiPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIzMCIgZmlsbD0iIzMzMyI+UEFUUklLSTwvdGV4dD48L3N2Zz4=";

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [state, setState] = useState<ChatState>({
    messages: [INITIAL_MESSAGE],
    isLoading: false,
    isOpen: false,
    error: null,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages, isOpen]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !state.error) {
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }
  }, [isOpen, state.error]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    // Check connection when opening first time or if there was an error
    if (!isOpen && (state.messages.length === 1 || state.error)) {
        checkConnection();
    }
  };

  const checkConnection = async () => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const connected = await checkOllamaConnection();
      if (!connected) {
          setState(prev => ({
              ...prev,
              isLoading: false,
              error: "Ошибка подключения к серверу."
          }));
      } else {
          setState(prev => ({ ...prev, isLoading: false, error: null }));
      }
  };

  const handleSend = async () => {
    if (!input.trim() || state.isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));
    setInput('');

    try {
      // Create a temporary assistant message for streaming
      const assistantMessageId = Date.now() + 1;
      let fullContent = "";

      setState((prev) => ({
        ...prev,
        messages: [
            ...prev.messages, 
            { role: 'assistant', content: '', timestamp: assistantMessageId }
        ],
      }));

      // Stream response
      await sendMessageToOllama(
          [...state.messages, userMessage], // Full history
          (chunk) => {
            fullContent += chunk;
            setState((prev) => {
                const newMessages = [...prev.messages];
                // Update the last message (which is the assistant's streaming message)
                const lastMsgIndex = newMessages.length - 1;
                newMessages[lastMsgIndex] = {
                    ...newMessages[lastMsgIndex],
                    content: fullContent
                };
                return { ...prev, messages: newMessages };
            });
          }
      );

      setState((prev) => ({ ...prev, isLoading: false }));

    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || "Произошла ошибка при получении ответа.",
      }));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[380px] h-[600px] max-h-[80vh] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0">
                 <img 
                    src={LOGO_BASE64} 
                    alt="ЖК Патрики" 
                    className="w-full h-full object-contain p-1"
                 />
              </div>
              <div>
                <h3 className="font-semibold text-sm md:text-base">ЖК Патрики</h3>
                <p className="text-xs text-slate-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  AI Онлайн
                </p>
              </div>
            </div>
            <button 
              onClick={toggleChat}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 custom-scrollbar">
            
            {/* Connection Error State */}
            {state.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 text-sm text-red-800">
                    <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 shrink-0 text-red-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold mb-1">Ошибка подключения</p>
                            <p className="mb-2">{state.error}</p>
                            <p className="text-xs text-slate-600 mb-2">
                                Для работы чата запустите:
                                <br />1. Ollama (обычный режим)
                                <br />2. Сервер: <code className="bg-slate-200 px-1 rounded">node server.js</code>
                            </p>
                            <button 
                                onClick={checkConnection}
                                className="flex items-center gap-2 bg-white border border-red-300 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors text-xs font-medium"
                            >
                                <RefreshCw size={12} /> Попробовать снова
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages */}
            {state.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-2 shrink-0">
                    <span className="text-sm">🤖</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-slate-800 text-white rounded-br-none'
                      : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator (if waiting for initial stream start) */}
            {state.isLoading && state.messages[state.messages.length - 1]?.role === 'user' && (
               <div className="flex justify-start mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mr-2">
                    <span className="text-sm">🤖</span>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    <span className="text-xs text-slate-500">Анализирую документы...</span>
                  </div>
               </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Задайте вопрос о ЖК..."
                disabled={state.isLoading || !!state.error}
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm text-slate-800 placeholder-slate-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || state.isLoading || !!state.error}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-slate-900 transition-colors"
              >
                {state.isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <div className="mt-2 text-center">
                 <p className="text-[10px] text-slate-400">Powered by Avalin (2025)</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className={`w-14 h-14 rounded-full shadow-lg shadow-slate-900/20 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 ${
          isOpen ? 'bg-slate-700 text-white rotate-90' : 'bg-slate-900 text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};