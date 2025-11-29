import React, { createContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, register as apiRegister } from '../api/auth'

export const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('auth')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setUser(parsed.user || null)
        setToken(parsed.token || null)
      } catch (_) {
        localStorage.removeItem('auth')
      }
    }
    setLoading(false)
  }, [])

  const saveAuth = (data) => {
    setUser(data.user)
    setToken(data.token)
    localStorage.setItem('auth', JSON.stringify(data))
  }

  const login = async (username, password) => {
    const result = await apiLogin(username, password)
    saveAuth(result)
    navigate('/dashboard')
  }

  const register = async (payload) => {
    await apiRegister(payload)
    // Depois de registrar, já faz login
    await login(payload.username, payload.password)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth')
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
