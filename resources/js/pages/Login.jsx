import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await login(form.email, form.password)
            navigate('/chat')
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex bg-[#0f1117]">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 text-white text-center">
                    <div className="flex items-center justify-center gap-3 mb-8">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                            <MessageCircle size={30} className="text-white" />
                        </div>
                        <span className="text-4xl font-bold">Whispr</span>
                    </div>
                    <p className="text-xl text-white/80 max-w-sm leading-relaxed">
                        Connect with friends and colleagues in real-time. Fast, secure, and beautiful.
                    </p>
                    <div className="mt-12 grid grid-cols-3 gap-4">
                        {['Real-time', 'Secure', 'Beautiful'].map(tag => (
                            <div key={tag} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <p className="text-sm font-medium">{tag}</p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <MessageCircle size={20} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">Whispr</span>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
                    <p className="text-gray-400 mb-8">Sign in to continue to Whispr</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full bg-[#1a1d27] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full bg-[#1a1d27] border border-gray-700 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600 transition-all"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
                        >
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Signing in...</> : 'Sign in'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-500 text-sm">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
                            Create account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
