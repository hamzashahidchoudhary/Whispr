import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ArrowLeft, Save, Lock, LogOut, Trash2, User, Bell, Shield } from 'lucide-react'
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
            setPwMsg('✓ Password updated successfully!')
            setPasswords({ current_password: '', password: '', password_confirmation: '' })
        } catch (err) {
            setPwMsg('✗ ' + (err.response?.data?.message || 'Failed to change password'))
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
        <div className="min-h-screen bg-[#0d0f14] text-white">
            <div className="max-w-2xl mx-auto p-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => navigate('/chat')}
                        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold">Settings</h1>
                        <p className="text-gray-500 text-sm">Manage your account preferences</p>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Tabs */}
                    <div className="w-44 flex-shrink-0">
                        <div className="space-y-1">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button key={id} onClick={() => setActiveTab(id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                        activeTab === id
                                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                                            : 'text-gray-500 hover:text-white hover:bg-white/5'
                                    }`}>
                                    <Icon size={16} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-white/5 space-y-1">
                            <button onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
                                <LogOut size={16} /> Sign out
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Avatar */}
                                <div className="bg-[#111318] rounded-2xl p-6 border border-white/5">
                                    <h2 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-wider">Profile Photo</h2>
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <img src={user?.avatar_url} alt=""
                                                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/10" />
                                            <button onClick={() => fileRef.current.click()}
                                                className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center transition-colors shadow-lg">
                                                <Camera size={14} />
                                            </button>
                                            <input ref={fileRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{user?.name}</p>
                                            <p className="text-sm text-gray-500">@{user?.username}</p>
                                            <p className="text-xs text-gray-600 mt-1">JPG, PNG, WebP — max 2MB</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Info */}
                                <div className="bg-[#111318] rounded-2xl p-6 border border-white/5">
                                    <h2 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-wider">Profile Information</h2>

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-sm">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Full Name', key: 'name', placeholder: 'Your name' },
                                                { label: 'Username', key: 'username', placeholder: 'username' },
                                            ].map(({ label, key, placeholder }) => (
                                                <div key={key}>
                                                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">{label}</label>
                                                    <input type="text" value={form[key] || ''} placeholder={placeholder}
                                                        onChange={e => setForm({ ...form, [key]: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-700 transition-all"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {[
                                            { label: 'Status', key: 'status', placeholder: "What's on your mind?" },
                                            { label: 'Bio', key: 'bio', placeholder: 'Tell people about yourself' },
                                        ].map(({ label, key, placeholder }) => (
                                            <div key={key}>
                                                <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">{label}</label>
                                                <input type="text" value={form[key] || ''} placeholder={placeholder}
                                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-700 transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <button onClick={saveProfile}
                                        className={`mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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

                        {activeTab === 'security' && (
                            <div className="bg-[#111318] rounded-2xl p-6 border border-white/5">
                                <h2 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-wider">Change Password</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Current Password', key: 'current_password' },
                                        { label: 'New Password', key: 'password' },
                                        { label: 'Confirm New Password', key: 'password_confirmation' },
                                    ].map(({ label, key }) => (
                                        <div key={key}>
                                            <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">{label}</label>
                                            <input type="password" value={passwords[key]}
                                                onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    ))}
                                </div>
                                {pwMsg && (
                                    <p className={`text-sm mt-3 ${pwMsg.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>{pwMsg}</p>
                                )}
                                <button onClick={changePassword}
                                    className="mt-5 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20">
                                    <Lock size={15} /> Update Password
                                </button>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="bg-[#111318] rounded-2xl p-6 border border-white/5">
                                <h2 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-wider">Notification Preferences</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'New messages', desc: 'Get notified when you receive a new message' },
                                        { label: 'Mentions', desc: 'Get notified when someone mentions you' },
                                        { label: 'Group activity', desc: 'Get notified about group chat activity' },
                                    ].map(({ label, desc }) => (
                                        <div key={label} className="flex items-center justify-between py-2">
                                            <div>
                                                <p className="text-sm font-medium text-white">{label}</p>
                                                <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                                            </div>
                                            <button className="w-11 h-6 bg-indigo-600 rounded-full relative transition-colors">
                                                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'privacy' && (
                            <div className="bg-[#111318] rounded-2xl p-6 border border-white/5">
                                <h2 className="font-semibold mb-4 text-sm text-gray-400 uppercase tracking-wider">Privacy Settings</h2>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Show online status', desc: 'Let others see when you are online' },
                                        { label: 'Show last seen', desc: 'Let others see when you were last active' },
                                        { label: 'Read receipts', desc: 'Show when you have read messages' },
                                    ].map(({ label, desc }) => (
                                        <div key={label} className="flex items-center justify-between py-2">
                                            <div>
                                                <p className="text-sm font-medium text-white">{label}</p>
                                                <p className="text-xs text-gray-600 mt-0.5">{desc}</p>
                                            </div>
                                            <button className="w-11 h-6 bg-indigo-600 rounded-full relative transition-colors">
                                                <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 transition-transform" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
