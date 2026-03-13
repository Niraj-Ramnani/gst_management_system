import { useState, useEffect } from 'react'
import { Shield, Users, FileText, AlertTriangle } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatDate } from '../utils/formatters'

export default function AdminPage() {
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/admin/stats'),
      api.get('/admin/users'),
      api.get('/admin/audit-logs'),
    ]).then(([statsRes, usersRes, logsRes]) => {
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data)
      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data)
      if (logsRes.status === 'fulfilled') setLogs(logsRes.value.data?.logs || [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner className="h-64" />

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
          <Shield size={24} className="text-amber-400" /> Admin Panel
        </h1>
        <p className="text-slate-400 text-sm mt-1">System administration and audit logs</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.total_users, icon: Users, color: 'text-primary-400' },
            { label: 'Businesses', value: stats.total_businesses, icon: Shield, color: 'text-success-400' },
            { label: 'Total Invoices', value: stats.total_invoices, icon: FileText, color: 'text-purple-400' },
            { label: 'Flagged', value: stats.flagged_invoices, icon: AlertTriangle, color: 'text-danger-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center">
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <h3 className="font-semibold text-white">User Accounts</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800">
              {['Name', 'Email', 'Role', 'Status'].map(h => (
                <th key={h} className="text-left px-6 py-3 text-slate-500 font-medium text-xs uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-800/20">
                <td className="px-6 py-3 text-slate-200 font-medium">{user.name}</td>
                <td className="px-6 py-3 text-slate-400 font-mono text-xs">{user.email}</td>
                <td className="px-6 py-3"><span className="badge-info capitalize">{user.role?.replace('_',' ')}</span></td>
                <td className="px-6 py-3"><span className={user.is_active ? 'badge-success' : 'badge-danger'}>{user.is_active ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
