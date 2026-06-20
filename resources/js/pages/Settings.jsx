import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ArrowLeft, Save } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

export default function Settings() {
    const { user, setUser, logout } = useAuth()
    const navigate = useNavigate()
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
        } catch (err) {
            setError('Failed to upload avatar')
        }
    }

    const changePassword = async () => {
        setPwMsg('')
        try {
            await api.put('/profile/password', passwords)
            setPwMsg('Password updated successfully!')
            setPasswords({ current_password: '', password: '', password_confirmation: '' })
        } catch (err) {
            setPwMsg(err.response?.data?.message || 'Failed to change password')
        }
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="max-w-lg mx-auto p-6">
                <button onClick={() => navigate('/chat')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={18} /> Back to Chat
                </button>

                <h1 className="text-xl font-bold mb-6">Settings</h1>

                {/* Avatar */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                        <img src={user?.avatar_url} alt="" className="w-16 h-16 rounded-full object-cover" />
                        <button onClick={() => fileRef.current.click()}
                            className="absolute bottom-0 right-0 bg-indigo-600 text-white p-1.5 rounded-full hover:bg-indigo-700">
                            <Camera size={12} />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" onChange={uploadAvatar} className="hidden" />
                    </div>
                    <div>
                        <p className="font-medium">{user?.name}</p>
                        <p className="text-sm text-gray-400">@{user?.username}</p>
                    </div>
                </div>

                {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                {/* Profile Form */}
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
                    <h2 className="font-semibold mb-4">Profile Information</h2>
                    <div className="space-y-4">
                        {[
                            { label: 'Full Name', key: 'name', type: 'text' },
                            { label: 'Username', key: 'username', type: 'text' },
                            { label: 'Status', key: 'status', type: 'text', placeholder: "What's on your mind?" },
                            { label: 'Bio', key: 'bio', type: 'text', placeholder: 'Tell us about yourself' },
                        ].map(({ label, key, type, placeholder }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                                <input type={type} value={form[key] || ''} placeholder={placeholder}
                                    onChange={e => setForm({ ...form, [key]: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        ))}
                    </div>
                    <button onClick={saveProfile}
                        className={`mt-4 w-full py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 ${saved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                        <Save size={16} />
                        {saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>

                {/* Change Password */}
                <div className="bg-gray-900 rounded-xl p-5 border border-gray-800 mb-6">
                    <h2 className="font-semibold mb-4">Change Password</h2>
                    <div className="space-y-4">
                        {[
                            { label: 'Current Password', key: 'current_password' },
                            { label: 'New Password', key: 'password' },
                            { label: 'Confirm New Password', key: 'password_confirmation' },
                        ].map(({ label, key }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                                <input type="password" value={passwords[key]}
                                    onChange={e => setPasswords({ ...passwords, [key]: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        ))}
                    </div>
                    {pwMsg && <p className={`text-sm mt-2 ${pwMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>{pwMsg}</p>}
                    <button onClick={changePassword} className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium text-sm transition-colors">
                        Update Password
                    </button>
                </div>

                {/* Logout */}
                <button onClick={handleLogout} className="w-full bg-red-600/10 border border-red-600/20 text-red-400 hover:bg-red-600/20 py-2 rounded-lg font-medium text-sm transition-colors">
                    Sign Out
                </button>
            </div>
        </div>
    )
}
