import { useState, useEffect, useRef } from 'react'
import { 
  X, Send, Bot, MessageCircle
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import axios from 'axios'
import clsx from 'clsx'

export default function ChatAssistant() {
  const { theme } = useTheme()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am GSTSmart AI Assistant. I can help you understand your GST forecasts, invoice patterns, and tax liabilities in any language. What would you like to know?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [suggestions, setSuggestions] = useState([
    "What is my predicted GST next month?",
    "Why is my liability decreasing?",
    "Show me high risk periods"
  ])
  const messagesEndRef = useRef(null)

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const sendMessage = async (text) => {
    const messageText = text || inputText
    if (!messageText.trim()) return

    const userMessage = {
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsTyping(true)
    setSuggestions([]) // Clear suggestions while typing

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/ai/chat`, {
        message: messageText,
        context: null // Global context can be expanded later
      })

      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, assistantMessage])
      setSuggestions(response.data.suggestions || [])
    } catch (error) {
      console.error('Chat Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I could not process that. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[1000] flex flex-col items-end gap-4 pointer-events-none">
      {/* Chat Panel */}
      <div className={clsx(
        "w-[380px] max-w-[calc(100vw-32px)] h-[520px] max-h-[70vh] rounded-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right pointer-events-auto",
        isChatOpen ? "translate-y-0 opacity-100 scale-100 shadow-2xl" : "translate-y-8 opacity-0 scale-95 pointer-events-none",
        theme === 'light' 
          ? "bg-white border border-[#e2e8f0] shadow-[0_20px_50px_rgba(0,0,0,0.15)]" 
          : "bg-[#0a0f1e] border border-[#00b4f5]/20 shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
      )}>
        {/* Header */}
        <div className={clsx(
          "p-4 px-5 flex items-center justify-between border-b shrink-0",
          theme === 'light' ? "border-[#e2e8f0]" : "border-white/5"
        )}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
              <Bot size={22} className="text-cyan-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={clsx("font-bold text-sm", theme === 'light' ? "text-[#0f172a]" : "text-white")}>GSTSmart AI Assistant</h3>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[11px] font-medium text-slate-500">Multilingual GST Support</p>
            </div>
          </div>
          <button 
            onClick={() => setIsChatOpen(false)}
            className="p-1.5 hover:bg-slate-500/10 rounded-lg transition-colors text-slate-400"
          >
            <X size={18} />
          </button>
        </div>


        {/* Messages Area */}
        <div className={clsx(
          "flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar",
          theme === 'light' ? "bg-[#f8fafc]" : "bg-[#080d1a]"
        )}>
          {messages.map((msg, idx) => (
            <div key={idx} className={clsx(
              "flex flex-col",
              msg.role === 'user' ? "items-end" : "items-start"
            )}>
              <div className={clsx(
                "flex gap-2 max-w-[85%]",
                msg.role === 'user' ? "flex-row-reverse" : "flex-row"
              )}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 mt-1 border border-cyan-500/20 shadow-sm">
                    <Bot size={14} className="text-cyan-500" />
                  </div>
                )}
                <div className={clsx(
                  "p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                  msg.role === 'user' 
                    ? (theme === 'light' ? "bg-[#2563eb] text-white rounded-tr-none shadow-blue-500/10" : "bg-[#1d4ed8] text-white rounded-tr-none shadow-black/20")
                    : (theme === 'light' ? "bg-white text-slate-700 border border-[#e2e8f0] rounded-tl-none" : "bg-[#111827] text-slate-200 border border-white/5 rounded-tl-none")
                )}>
                  {msg.content}
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-500 mt-1 px-1">{msg.timestamp}</span>
            </div>
          ))}
          
          {/* Suggestion Chips */}
          {!isTyping && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {suggestions.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(chip)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg border text-[11px] font-bold transition-all text-left",
                    theme === 'light' 
                      ? "border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100" 
                      : "border-blue-500/20 text-blue-400 bg-blue-500/5 hover:bg-blue-500/10"
                  )}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {isTyping && (
            <div className="flex items-start gap-2">
              <div className="w-7 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                <Bot size={14} className="text-cyan-500" />
              </div>
              <div className={clsx(
                "px-4 py-3 rounded-2xl flex gap-1 items-center shadow-sm",
                theme === 'light' ? "bg-white border border-[#e2e8f0]" : "bg-[#111827] border border-white/5"
              )}>
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={clsx(
          "p-3 px-4 border-t shrink-0",
          theme === 'light' ? "bg-white border-[#e2e8f0]" : "bg-[#0a0f1e] border-white/5"
        )}>
          <div className="flex gap-2 items-center">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              disabled={isTyping}
              placeholder="Ask about your GST in any language..."
              className={clsx(
                "flex-1 px-4 py-2.5 rounded-full text-sm outline-none transition-all border",
                isTyping ? "opacity-50 cursor-not-allowed" : "",
                theme === 'light' 
                  ? "bg-white border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5" 
                  : "bg-[#111827] border-white/10 focus:border-cyan-500/50 focus:ring-4 focus:ring-cyan-500/5 text-white"
              )}
            />
            <button 
              onClick={() => sendMessage()}
              disabled={isTyping || !inputText.trim()}
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0",
                isTyping || !inputText.trim() 
                  ? (theme === 'light' ? "bg-slate-100 text-slate-400" : "bg-white/5 text-slate-600")
                  : "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30 hover:scale-105 active:scale-95"
              )}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className={clsx(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 pointer-events-auto relative group",
          isChatOpen ? "bg-slate-200 text-slate-700 rotate-90" : "bg-cyan-500 text-white hover:scale-110",
          !isChatOpen && "animate-chat-pulse"
        )}
      >
        {isChatOpen ? <X size={24} /> : (
          <>
            <MessageCircle size={24} className="fill-white/10" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-slate-900 rounded-full" />
          </>
        )}
        
        <div className="absolute right-full mr-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
          Ask AI Assistant
        </div>
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes chat-pulse {
          0% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(6, 182, 212, 0); }
          100% { box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
        }
        .animate-chat-pulse {
          animation: chat-pulse 2s infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @media (max-width: 768px) {
          .origin-bottom-right { transform-origin: bottom !important; }
          .fixed.bottom-4.right-4 { right: 12px !important; bottom: 12px !important; width: calc(100% - 24px) !important; }
          .w-\[380px\] { width: 100% !important; bottom: 0 !important; right: 0 !important; left: 0 !important; height: 75vh !important; border-radius: 24px 24px 0 0 !important; }
        }
      `}} />
    </div>
  )
}
