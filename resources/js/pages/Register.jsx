import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function Register() {
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '', username: '', email: '',
        password: '', password_confirmation: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            await register(form.name, form.username, form.email, form.password, form.password_confirmation)
            navigate('/chat')
        } catch (err) {
            const errors = err.response?.data?.errors
            if (errors) {
                const first = Object.values(errors)[0]
                setError(Array.isArray(first) ? first[0] : first)
            } else {
                setError(err.response?.data?.message || 'Registration failed')
            }
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
                        Join thousands of people already using Whispr to connect and collaborate.
                    </p>
                    <div className="mt-12 space-y-3">
                        {[
                            '✓ Real-time messaging',
                            '✓ Group conversations',
                            '✓ File sharing',
                            '✓ End-to-end security',
                        ].map(item => (
                            <div key={item} className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20 text-left">
                                <p className="text-sm font-medium">{item}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full" />
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-md py-8">
                    <div className="flex items-center gap-2 mb-8 lg:hidden">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                            <MessageCircle size={20} className="text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">Whispr</span>
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
                    <p className="text-gray-400 mb-8">Join Whispr and start chatting today</p>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-2">
                            <span>⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                                <input type="text" required value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-[#1a1d27] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600 transition-all"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                                <input type="text" required value={form.username}
                                    onChange={e => setForm({ ...form, username: e.target.value })}
                                    className="w-full bg-[#1a1d27] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600 transition-all"
                                    placeholder="johndoe"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email address</label>
                            <input type="email" required value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                className="w-full bg-[#1a1d27] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} required value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    className="w-full bg-[#1a1d27] border border-gray-700 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600 transition-all"
                                    placeholder="Min. 8 characters"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                            <input type="password" required value={form.password_confirmation}
                                onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
                                className="w-full bg-[#1a1d27] border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-600 transition-all"
                                placeholder="Repeat password"
                            />
                        </div>
                        <button type="submit" disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 mt-2">
                            {loading ? <><Loader2 size={18} className="animate-spin" /> Creating account...</> : 'Create account'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-gray-500 text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
