import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchMe()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data)
    } catch {
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.access_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
    setToken(data.access_token)
    setUser(data.user)
    return data
  }

  const register = async (name, email, password, role) => {
    const { data } = await api.post('/auth/register', { name, email, password, role })
    localStorage.setItem('token', data.access_token)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.access_token}`
    setToken(data.access_token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
