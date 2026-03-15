import { useState, useEffect, useRef } from 'react'
import { 
  TrendingUp, TrendingDown, Minus, RefreshCw, Info, Zap, 
  MessageCircle, X, Send, Bot, User 
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'
import axios from 'axios'
import { forecastService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { useTheme } from '../context/ThemeContext'
import { formatCurrency, getMonthName } from '../utils/formatters'
import clsx from 'clsx'

const LANGUAGES = ['English', 'Hindi', 'Gujarati', 'Marathi', 'Tamil']

export default function ForecastPage() {
  const { theme } = useTheme()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [training, setTraining] = useState(false)
  
  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('English')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am GSTSmart AI Assistant. I can help you understand your GST forecasts, invoice patterns, and tax liabilities in your preferred language. What would you like to know?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => { loadForecast() }, [])
  
  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const loadForecast = async () => {
    setLoading(true)
    try {
      const { data: res } = await forecastService.nextMonth()
      setData(res)
    } catch (err) {
      toast.error('Could not load forecast')
    } finally {
      setLoading(false)
    }
  }

  const handleTrain = async () => {
    setTraining(true)
    try {
      await forecastService.train()
      toast.success('Model trained. Refreshing forecast…')
      await loadForecast()
    } catch { toast.error('Training failed') }
    finally { setTraining(false) }
  }

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

    try {
      const context = data ? {
        predicted_amount: data.predicted_liability,
        trend: data.trend,
        model_type: 'Prophet',
        lower_bound: data.lower_bound,
        upper_bound: data.upper_bound,
        period: `${getMonthName(data.month)} ${data.year}`,
        explanation: data.explanation
      } : null

      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/v1/ai/chat`, {
        message: messageText,
        language: selectedLanguage,
        context: context
      })

      const assistantMessage = {
        role: 'assistant',
        content: response.data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, assistantMessage])
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

  if (loading) return <LoadingSpinner className="h-64" />

  const TrendIcon = data?.trend === 'increasing' ? TrendingUp : data?.trend === 'decreasing' ? TrendingDown : Minus
  const trendColor = data?.trend === 'increasing' ? 'text-danger-400' : data?.trend === 'decreasing' ? 'text-success-400' : 'text-slate-400'

  const chartData = [
    ...(data?.historical_data || []).map(d => ({
      date: d.ds?.slice(0, 7),
      actual: d.y,
      label: 'Historical',
    })),
    ...(data?.forecast_data?.slice(-3) || []).map(d => ({
      date: d.ds?.slice(0, 7),
      predicted: d.predicted,
      lower: d.lower,
      upper: d.upper,
      label: 'Forecast',
    })),
  ]

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in relative min-h-[calc(100vh-200px)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className={clsx(
            "text-2xl sm:text-3xl font-black tracking-tight transition-colors",
            theme === 'light' ? 'text-[#0f172a]' : 'text-white'
          )}>GST Forecast</h1>
          <p className={clsx(
            "text-xs sm:text-sm mt-1 font-medium transition-colors",
            theme === 'light' ? 'text-[#475569]' : 'text-slate-400'
          )}>AI-powered liability prediction using Prophet time-series model</p>
        </div>
        <button 
          onClick={handleTrain} 
          disabled={training} 
          className={clsx(
            "h-[48px] px-6 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 shadow-sm border shrink-0 w-full sm:w-auto",
            theme === 'light' 
              ? "bg-white border-[#e2e8f0] text-[#374151] hover:bg-[#f8fafc]" 
              : "bg-white/5 border-white/10 text-white hover:bg-white/10"
          )}
        >
          <RefreshCw size={16} className={training ? 'animate-spin' : ''} />
          {training ? 'Training…' : 'Retrain Model'}
        </button>
      </div>

      {data?.status === 'insufficient_data' ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 bg-primary-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TrendingUp size={28} className="text-primary-400" />
          </div>
          <h3 className="font-semibold text-white text-lg mb-2">Not enough data yet</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">{data.message}</p>
        </div>
      ) : (
        <>
          {/* Prediction Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
              className={clsx(
                "p-6 sm:p-8 rounded-[24px] md:col-span-1 border transition-all duration-300",
                theme === 'light' ? "bg-white border-[#e2e8f0] shadow-sm" : "bg-[#0d1424] border-[rgba(0,180,245,0.15)]"
              )}
            >
              <div className="flex items-start justify-between mb-6">
                <div className={clsx(
                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                  theme === 'light' ? "bg-blue-50" : "bg-primary-900/30"
                )}>
                  <Zap size={24} className={theme === 'light' ? "text-blue-600" : "text-primary-400"} />
                </div>
                <div className={clsx("flex items-center gap-1.5 px-3 py-1.5 rounded-full", theme === 'light' ? "bg-slate-50" : "bg-white/5")}>
                   <TrendIcon size={16} className={trendColor} />
                </div>
              </div>
              <p className={clsx(
                "text-3xl sm:text-4xl font-black font-display mb-1 transition-colors",
                theme === 'light' ? "text-[#0f172a]" : "text-white"
              )}>
                {formatCurrency(data?.predicted_liability)}
              </p>
              <p className={clsx("text-xs font-bold uppercase tracking-widest", theme === 'light' ? "text-slate-500" : "text-slate-400")}>
                Predicted GST for {getMonthName(data?.month)} {data?.year}
              </p>
              <div className={clsx(
                "mt-6 pt-6 border-t space-y-3 text-sm font-medium",
                theme === 'light' ? "border-[#f1f5f9]" : "border-slate-800"
              )}>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs uppercase tracking-widest">Low Est.</span>
                  <span className={clsx("font-tabular font-bold", theme === 'light' ? "text-[#334155]" : "text-slate-300")}>{formatCurrency(data?.lower_bound)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-xs uppercase tracking-widest">High Est.</span>
                  <span className={clsx("font-tabular font-bold", theme === 'light' ? "text-[#334155]" : "text-slate-300")}>{formatCurrency(data?.upper_bound)}</span>
                </div>
              </div>
            </div>

            <div 
              className={clsx(
                "p-8 rounded-[24px] md:col-span-2 flex flex-col border transition-all duration-300",
                theme === 'light' ? "bg-white border-[#e2e8f0] shadow-sm" : "bg-[#0d1424] border-[rgba(0,180,245,0.15)]"
              )}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className={clsx(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  theme === 'light' ? "bg-amber-50" : "bg-primary-900/20"
                )}>
                  <Info size={16} className={theme === 'light' ? "text-amber-600" : "text-primary-400"} />
                </div>
                <p className={clsx("text-xs font-black uppercase tracking-widest", theme === 'light' ? "text-slate-900" : "text-white")}>AI Insight Engine</p>
              </div>
              <p className={clsx(
                "text-sm sm:text-base leading-relaxed flex-1 font-medium",
                theme === 'light' ? "text-[#475569]" : "text-slate-300"
              )}>
                {data?.explanation}
              </p>
              <div className={clsx(
                "mt-6 pt-6 border-t transition-all",
                theme === 'light' ? "border-[#f1f5f9]" : "border-slate-800"
              )}>
                <div className="flex flex-wrap items-center gap-4">
                  <div className={clsx("flex items-center gap-2 text-xs font-black uppercase tracking-widest", trendColor)}>
                    <TrendIcon size={14} />
                    <span>Trend: {data?.trend}</span>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">•</span>
                  <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Model: Prophet v1.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div 
              className={clsx(
                "p-6 sm:p-8 rounded-[24px] border transition-all duration-300",
                theme === 'light' ? "bg-white border-[#e2e8f0] shadow-sm" : "bg-[#0d1424] border-[rgba(0,180,245,0.15)]"
              )}
            >
              <h3 className={clsx(
                "text-xl font-black tracking-tight mb-8 transition-colors",
                theme === 'light' ? "text-[#0f172a]" : "text-white"
              )}>Historical vs Predicted GST Liability</h3>
              <div className="h-[350px] sm:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#e2e8f0' : '#1e293b'} vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke={theme === 'light' ? '#94a3b8' : '#475569'} 
                      tick={{ fill: theme === 'light' ? '#64748b' : '#64748b', fontSize: 10 }} 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke={theme === 'light' ? '#94a3b8' : '#475569'} 
                      tick={{ fill: theme === 'light' ? '#64748b' : '#64748b', fontSize: 10 }} 
                      axisLine={false} 
                      tickLine={false} 
                      tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} 
                    />
                    <Tooltip
                      content={({ active, payload, label }) => (
                        <div className={clsx(
                          "backdrop-blur-xl border rounded-2xl px-5 py-4 shadow-2xl transition-colors duration-300",
                          theme === 'light' ? "bg-white/90 border-[#e2e8f0]" : "bg-slate-900/90 border-white/10"
                        )}>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
                          {payload?.map(p => (
                            <div key={p.name} className="flex items-center gap-2.5 mb-1">
                              <div className="w-2 h-2 rounded-full" style={{ background: p.stroke }} />
                              <span className={clsx("text-xs", theme === 'light' ? "text-slate-600" : "text-slate-400")}>{p.name}:</span>
                              <span className={clsx("text-xs font-bold ml-auto", theme === 'light' ? "text-[#0f172a]" : "text-white")}>{formatCurrency(p.value)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    />
                    <Area type="monotone" dataKey="actual" stroke="#0ea5e9" fill="url(#actualGrad)" strokeWidth={3} name="Actual" connectNulls animationDuration={1500} />
                    <Area type="monotone" dataKey="predicted" stroke="#f59e0b" fill="url(#predGrad)" strokeWidth={3} strokeDasharray="5 5" name="Predicted" connectNulls animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-6 mt-6 justify-center">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-8 h-1 bg-[#0ea5e9] rounded-full" />
                  <span className="text-slate-500">Historical Data</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <div className="w-8 h-1 bg-[#f59e0b] rounded-full border-dashed border-t-2" />
                  <span className="text-slate-500">Predicted Forecast</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* AI Chat Assistant */}
      <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-end gap-4 pointer-events-none">
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

          {/* Language Selector */}
          <div className={clsx(
            "px-4 py-2 border-b shrink-0 flex gap-2 overflow-x-auto no-scrollbar",
            theme === 'light' ? "bg-slate-50/50 border-[#e2e8f0]" : "bg-white/[0.02] border-white/5"
          )}>
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => setSelectedLanguage(lang)}
                className={clsx(
                  "px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border shrink-0",
                  selectedLanguage === lang 
                    ? "bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20" 
                    : (theme === 'light' ? "bg-white border-[#e2e8f0] text-slate-500 hover:border-slate-300" : "bg-white/5 border-white/10 text-slate-400 hover:border-white/20")
                )}
              >
                {lang}
              </button>
            ))}
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
            {messages.length === 1 && !isTyping && (
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "What is my predicted GST next month?",
                  "Why is my liability decreasing?",
                  "Show me high risk periods"
                ].map((chip, i) => (
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
      </div>

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
          .fixed.bottom-6.right-6 { right: 16px !important; bottom: 16px !important; width: calc(100% - 32px) !important; }
          .w-\[380px\] { width: 100% !important; bottom: 0 !important; right: 0 !important; left: 0 !important; height: 75vh !important; border-radius: 24px 24px 0 0 !important; }
        }
      `}} />
    </div>
  )
}
