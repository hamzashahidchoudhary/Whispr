import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ArrowLeft, Save, Lock, LogOut, User, Bell, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

export default function Settings() {
    const { user, setUser, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('profile')
    const [form, setForm] = useState({
        name: user?.name || '',
        username: user?.username || '',
        status: user?.status || '',
        bio: user?.bio || '',
    })
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState('')
    const [passwords, setPasswords] = useState({
        current_password: '',
        password: '',
        password_confirmation: '',
    })
    const [pwMsg, setPwMsg] = useState('')
    const fileRef = useRef()

    const saveProfile = async () => {
        setError('')
        try {
            const { data } = await api.put('/profile', form)
            setUser(data)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save')
        }
    }

    const uploadAvatar = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const fd = new FormData()
        fd.append('avatar', file)
        try {
            const { data } = await api.post('/profile/avatar', fd)
            setUser(prev => ({ ...prev, avatar_url: data.avatar_url }))
        } catch {
            setError('Failed to upload avatar')
        }
    }

    const changePassword = async () => {
        setPwMsg('')
        try {
            await api.put('/profile/password', passwords)
            setPwMsg('✓ Password updated!')
            setPasswords({ current_password: '', password: '', password_confirmation: '' })
        } catch (err) {
            setPwMsg('✗ ' + (err.response?.data?.message || 'Failed'))
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Shield },
    ]

    return (
        <div className="min-h-screen min-h-dvh bg-[#0d0f14] text-white overflow-y-auto">
            <div className="max-w-2xl mx-auto px-4 py-5">

                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/chat')}
                        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all flex-shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold leading-tight">Settings</h1>
                        <p className="text-gray-500 text-xs">Manage your account</p>
                    </div>
                </div>

                {/* Tabs - horizontal scroll on mobile */}
                <div className="flex gap-1 mb-5 overflow-x-auto pb-1 scrollbar-none">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                                activeTab === id
                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}>
                            <Icon size={14} />
                            {label}
                        </button>
                    ))}
                    <button onClick={handleLogout}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 border border-transparent whitespace-nowrap flex-shrink-0 ml-auto transition-all">
                        <LogOut size={14} /> Sign out
                    </button>
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="space-y-4">
                        {/* Avatar */}
                        <div className="bg-[#111318] rounded-2xl p-4 border border-white/5">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Profile Photo</p>
                            <div className="flex items-center gap-4">
                                <div className="relative flex-shrink-0">
                                    <img src={user?.avatar_url} alt=""
                                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white/10" />
                                    <button onClick={() => fileRef.current.click()}
                                        className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center transition-colors shadow-lg">
                                        <Camera size={13} />
                                    </button>
                                    <input ref={fileRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-white truncate">{user?.name}</p>
                                    <p className="text-sm text-gray-500 truncate">@{user?.username}</p>
                                    <p className="text-xs text-gray-600 mt-0.5">JPG, PNG — max 2MB</p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="bg-[#111318] rounded-2xl p-4 border border-white/5">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Profile Information</p>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Full Name</label>
                                    <input type="text" value={form.name || ''} placeholder="Your full name"
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Username</label>
                                    <input type="text" value={form.username || ''} placeholder="username"
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                                    <input type="text" value={form.status || ''} placeholder="What's on your mind?"
                                        onChange={e => setForm({ ...form, status: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Bio</label>
                                    <input type="text" value={form.bio || ''} placeholder="Tell people about yourself"
                                        onChange={e => setForm({ ...form, bio: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-700"
                                    />
                                </div>
                            </div>

                            <button onClick={saveProfile}
                                className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                    saved
                                        ? 'bg-green-600 text-white'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                                }`}>
                                <Save size={15} />
                                {saved ? 'Saved!' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="bg-[#111318] rounded-2xl p-4 border border-white/5">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Change Password</p>
                        <div className="space-y-3">
                            {[
                                { label: 'Current Password', key: 'current_password' },
                                { label: 'New Password', key: 'password' },
                                { label: 'Confirm New Password', key: 'password_confirmation' },
                            ].map(({ label, key }) => (
                                <div key={key}>
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
                                    <input type="password" value={passwords[key]}
                                        onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                            ))}
                        </div>
                        {pwMsg && (
                            <p className={`text-sm mt-3 ${pwMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                                {pwMsg}
                            </p>
                        )}
                        <button onClick={changePassword}
                            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">
                            <Lock size={14} /> Update Password
                        </button>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <div className="bg-[#111318] rounded-2xl p-4 border border-white/5">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Notifications</p>
                        <div className="space-y-1">
                            {[
                                { label: 'New messages', desc: 'Get notified for new messages' },
                                { label: 'Mentions', desc: 'Get notified when mentioned' },
                                { label: 'Group activity', desc: 'Get notified about groups' },
                            ].map(({ label, desc }) => (
                                <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                    <div className="min-w-0 pr-4">
                                        <p className="text-sm font-medium text-white">{label}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                                    </div>
                                    <div className="w-10 h-6 bg-indigo-600 rounded-full relative flex-shrink-0 cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Privacy Tab */}
                {activeTab === 'privacy' && (
                    <div className="bg-[#111318] rounded-2xl p-4 border border-white/5">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Privacy</p>
                        <div className="space-y-1">
                            {[
                                { label: 'Online status', desc: 'Show when you are online' },
                                { label: 'Last seen', desc: 'Show when you were last active' },
                                { label: 'Read receipts', desc: 'Show when you read messages' },
                            ].map(({ label, desc }) => (
                                <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                    <div className="min-w-0 pr-4">
                                        <p className="text-sm font-medium text-white">{label}</p>
                                        <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                                    </div>
                                    <div className="w-10 h-6 bg-indigo-600 rounded-full relative flex-shrink-0 cursor-pointer">
                                        <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}
