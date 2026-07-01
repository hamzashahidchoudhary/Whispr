import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import ChatLayout from './pages/ChatLayout'
import Settings from './pages/Settings'
import AdminDashboard from './pages/AdminDashboard'

function PrivateRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-950">
                <div className="text-gray-400 text-sm">Loading...</div>
            </div>
        )
    }
    return user ? children : <Navigate to="/login" />
}

function GuestRoute({ children }) {
    const { user, loading } = useAuth()
    if (loading) return null
    return !user ? children : <Navigate to="/chat" />
}

export default function App() {
    return (
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />
                <Route path="/chat" element={<PrivateRoute><ChatLayout /></PrivateRoute>} />
                <Route path="/chat/:id" element={<PrivateRoute><ChatLayout /></PrivateRoute>} />
                <Route path="/chat/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
                <Route path="/" element={<Navigate to="/chat" />} />
                <Route path="*" element={
                    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
                        <div className="text-center">
                            <p className="text-6xl mb-4">404</p>
                            <p className="text-gray-400">Page not found</p>
                        </div>
                    </div>
                } />
            </Routes>
        </AuthProvider>
    )
}
