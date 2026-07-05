import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (token) {
            api.get('/auth/me')
                .then(res => setUser(res.data))
                .catch(() => localStorage.removeItem('auth_token'))
                .finally(() => setLoading(false))
        } else {
            setLoading(false)
        }
    }, [])

    // Ping every 30 seconds to keep online status updated
    useEffect(() => {
        if (!user) return
        const interval = setInterval(() => {
            api.get('/auth/me')
                .then(res => setUser(res.data))
                .catch(() => {})
        }, 30000)
        return () => clearInterval(interval)
    }, [user?.id])

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        localStorage.setItem('auth_token', data.token)
        setUser(data.user)
        return data
    }

    const register = async (name, username, email, password, password_confirmation) => {
        const { data } = await api.post('/auth/register', {
            name, username, email, password, password_confirmation
        })
        localStorage.setItem('auth_token', data.token)
        setUser(data.user)
        return data
    }

    const logout = async () => {
        await api.post('/auth/logout')
        localStorage.removeItem('auth_token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
