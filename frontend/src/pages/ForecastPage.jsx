import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus, RefreshCw, Info, Zap } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import toast from 'react-hot-toast'
import { forecastService } from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatCurrency, getMonthName } from '../utils/formatters'

export default function ForecastPage() {
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
      toast.success('Model trained. Refreshing forecast…')
      await loadForecast()
    } catch { toast.error('Training failed') }
    finally { setTraining(false) }
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
    <div className="space-y-8 animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">GST Forecast</h1>
          <p className="text-slate-400 text-sm mt-0.5">AI-powered liability prediction using Prophet time-series model</p>
        </div>
        <button onClick={handleTrain} disabled={training} className="btn-secondary flex items-center gap-2">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-6 md:col-span-1">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 bg-primary-900/30 rounded-xl">
                  <Zap size={20} className="text-primary-400" />
                </div>
                <TrendIcon size={18} className={trendColor} />
              </div>
              <p className="text-3xl font-display font-bold text-white mb-1">{formatCurrency(data?.predicted_liability)}</p>
              <p className="text-sm text-slate-400">Predicted GST for {getMonthName(data?.month)} {data?.year}</p>
              <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Lower bound</span>
                  <span className="text-slate-300 font-mono">{formatCurrency(data?.lower_bound)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Upper bound</span>
                  <span className="text-slate-300 font-mono">{formatCurrency(data?.upper_bound)}</span>
                </div>
              </div>
            </div>

            <div className="card p-6 md:col-span-2 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <Info size={14} className="text-primary-400" />
                <p className="text-sm font-semibold text-white">AI Insight</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed flex-1">{data?.explanation}</p>
              <div className="mt-4 pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 text-sm font-medium ${trendColor}`}>
                    <TrendIcon size={14} />
                    Trend: <span className="capitalize">{data?.trend}</span>
                  </div>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-400 text-sm">Model: Prophet / ARIMA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="card p-6">
              <h3 className="section-title mb-6">Historical vs Predicted GST Liability</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="date" stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis stroke="#475569" tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', fontSize: '12px' }}
                    formatter={v => formatCurrency(v)}
                  />
                  <Area type="monotone" dataKey="actual" stroke="#0ea5e9" fill="url(#actualGrad)" strokeWidth={2} name="Actual" connectNulls />
                  <Area type="monotone" dataKey="predicted" stroke="#f59e0b" fill="url(#predGrad)" strokeWidth={2} strokeDasharray="5 5" name="Predicted" connectNulls />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-6 mt-4 justify-center">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-0.5 bg-primary-500 rounded" />
                  <span className="text-slate-400">Historical</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-8 h-0.5 bg-warning-500 rounded border-dashed border-t border-warning-500" />
                  <span className="text-slate-400">Forecast</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
