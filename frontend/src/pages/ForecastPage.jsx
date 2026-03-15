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
  
  useEffect(() => { loadForecast() }, [])
  
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
      toast.success('Model trained. Refreshing forecast...')
      await loadForecast()
    } catch { 
      toast.error('Training failed') 
    } finally { 
      setTraining(false) 
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

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
