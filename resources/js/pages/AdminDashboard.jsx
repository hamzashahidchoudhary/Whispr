import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowLeft, Users, MessageSquare, FolderOpen, HardDrive,
    Ban, Shield, Trash2, Search, UserCheck, Crown, MoreVertical
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

export default function AdminDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [tab, setTab] = useState('overview')
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [groups, setGroups] = useState([])
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('all')
    const [loading, setLoading] = useState(true)
    const [menuOpenId, setMenuOpenId] = useState(null)
    const [menuPos, setMenuPos] = useState({ top: 0, right: 0 })

    useEffect(() => {
        if (user && user.role !== 'admin') navigate('/chat')
    }, [user, navigate])

    const loadStats = () => api.get('/admin/stats').then(res => setStats(res.data))
    const loadUsers = () => {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        if (filter !== 'all') params.append('filter', filter)
        api.get(`/admin/users?${params}`).then(res => setUsers(res.data.data || []))
    }
    const loadMessages = () => {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        api.get(`/admin/messages?${params}`).then(res => setMessages(res.data.data || []))
    }
    const loadGroups = () => {
        const params = new URLSearchParams()
        if (search) params.append('search', search)
        api.get(`/admin/groups?${params}`).then(res => setGroups(res.data.data || []))
    }

    useEffect(() => {
        setLoading(true)
        if (tab === 'overview') loadStats()
        if (tab === 'users') loadUsers()
        if (tab === 'messages') loadMessages()
        if (tab === 'groups') loadGroups()
        setTimeout(() => setLoading(false), 300)
    }, [tab])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (tab === 'users') loadUsers()
            if (tab === 'messages') loadMessages()
            if (tab === 'groups') loadGroups()
        }, 300)
        return () => clearTimeout(timer)
    }, [search, filter])

    const openMenu = (e, id) => {
        if (menuOpenId === id) { setMenuOpenId(null); return }
        const rect = e.currentTarget.getBoundingClientRect()
        setMenuPos({
            top: rect.top + window.scrollY,
            right: window.innerWidth - rect.right,
        })
        setMenuOpenId(id)
    }

    const banUser = async (id) => {
        if (!confirm('Ban this user?')) return
        await api.post(`/admin/users/${id}/ban`)
        setMenuOpenId(null)
        loadUsers()
    }
    const unbanUser = async (id) => {
        await api.post(`/admin/users/${id}/unban`)
        setMenuOpenId(null)
        loadUsers()
    }
    const makeAdmin = async (id) => {
        if (!confirm('Make this user an admin?')) return
        await api.post(`/admin/users/${id}/make-admin`)
        setMenuOpenId(null)
        loadUsers()
    }
    const removeAdmin = async (id) => {
        await api.post(`/admin/users/${id}/remove-admin`)
        setMenuOpenId(null)
        loadUsers()
    }
    const deleteUser = async (id) => {
        if (!confirm('Permanently delete this user?')) return
        await api.delete(`/admin/users/${id}`)
        setMenuOpenId(null)
        loadUsers()
    }
    const deleteMessage = async (id) => {
        if (!confirm('Delete this message?')) return
        await api.delete(`/admin/messages/${id}`)
        loadMessages()
    }
    const deleteGroup = async (id) => {
        if (!confirm('Delete this group permanently?')) return
        await api.delete(`/admin/groups/${id}`)
        loadGroups()
    }

    if (!user || user.role !== 'admin') return null

    const tabs = [
        { id: 'overview', label: 'Overview', icon: HardDrive },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'messages', label: 'Messages', icon: MessageSquare },
        { id: 'groups', label: 'Groups', icon: FolderOpen },
    ]

    return (
        <div className="min-h-screen min-h-dvh bg-[#0d0f14] text-white">
            {/* Fixed dropdown portal */}
            {menuOpenId && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
                    <div
                        className="fixed z-50 bg-[#1e2130] border border-white/10 rounded-xl shadow-2xl overflow-hidden min-w-[170px]"
                        style={{ top: menuPos.top, right: menuPos.right + 36 }}
                    >
                        {users.find(u => u.id === menuOpenId)?.is_banned ? (
                            <button onClick={() => unbanUser(menuOpenId)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-green-400 hover:bg-white/5 text-left">
                                <UserCheck size={14} /> Unban User
                            </button>
                        ) : users.find(u => u.id === menuOpenId)?.role !== 'admin' ? (
                            <button onClick={() => banUser(menuOpenId)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 text-left">
                                <Ban size={14} /> Ban User
                            </button>
                        ) : null}

                        {users.find(u => u.id === menuOpenId)?.role === 'admin' ? (
                            <button onClick={() => removeAdmin(menuOpenId)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 text-left">
                                <Shield size={14} /> Remove Admin
                            </button>
                        ) : (
                            <button onClick={() => makeAdmin(menuOpenId)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-indigo-400 hover:bg-white/5 text-left">
                                <Crown size={14} /> Make Admin
                            </button>
                        )}

                        {users.find(u => u.id === menuOpenId)?.role !== 'admin' && (
                            <button onClick={() => deleteUser(menuOpenId)}
                                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 text-left border-t border-white/5">
                                <Trash2 size={14} /> Delete User
                            </button>
                        )}
                    </div>
                </>
            )}

            <div className="max-w-5xl mx-auto px-4 py-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={() => navigate('/chat')}
                        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all flex-shrink-0">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold leading-tight flex items-center gap-2">
                            Admin Dashboard <Shield size={16} className="text-indigo-400" />
                        </h1>
                        <p className="text-gray-500 text-xs">Manage users, messages, and groups</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-5 overflow-x-auto pb-1">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                                tab === id
                                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}>
                            <Icon size={14} /> {label}
                        </button>
                    ))}
                </div>

                {/* OVERVIEW TAB */}
                {tab === 'overview' && stats && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <StatCard label="Total Users" value={stats.total_users} icon={Users} color="indigo" />
                            <StatCard label="Online Now" value={stats.online_users} icon={UserCheck} color="green" />
                            <StatCard label="Banned" value={stats.banned_users} icon={Ban} color="red" />
                            <StatCard label="New Today" value={stats.new_users_today} icon={Users} color="purple" />
                            <StatCard label="Total Messages" value={stats.total_messages} icon={MessageSquare} color="indigo" />
                            <StatCard label="Today's Messages" value={stats.messages_today} icon={MessageSquare} color="green" />
                            <StatCard label="Groups" value={stats.total_groups} icon={FolderOpen} color="purple" />
                            <StatCard label="Storage Used" value={`${stats.storage_used_mb} MB`} icon={HardDrive} color="indigo" />
                        </div>

                        {stats.messages_per_day?.length > 0 && (
                            <div className="bg-[#111318] rounded-2xl p-4 border border-white/5">
                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Messages — Last 7 Days</p>
                                <div className="flex items-end gap-2 h-32">
                                    {stats.messages_per_day.map(d => {
                                        const max = Math.max(...stats.messages_per_day.map(x => x.count), 1)
                                        const height = (d.count / max) * 100
                                        return (
                                            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
                                                <span className="text-[10px] text-gray-500">{d.count}</span>
                                                <div className="w-full bg-gradient-to-t from-indigo-600 to-purple-600 rounded-t-lg"
                                                    style={{ height: `${height}%`, minHeight: 4 }} />
                                                <span className="text-[9px] text-gray-600">
                                                    {new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Search bar */}
                {tab !== 'overview' && (
                    <div className="flex gap-2 mb-4">
                        <div className="flex-1 flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 border border-white/5">
                            <Search size={15} className="text-gray-500 flex-shrink-0" />
                            <input value={search} onChange={e => setSearch(e.target.value)}
                                placeholder={`Search ${tab}...`}
                                className="bg-transparent text-sm outline-none w-full text-white placeholder-gray-600" />
                        </div>
                        {tab === 'users' && (
                            <div className="flex gap-1">
                                {['all', 'online', 'banned', 'admins'].map(f => (
                                    <button key={f} onClick={() => setFilter(f)}
                                    className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                                        filter === f
                                        ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/20'
                                        : 'text-gray-500 hover:text-white bg-white/5 border border-white/5'
                                    }`}>
                                    {f}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* USERS TAB */}
                {tab === 'users' && (
                    <div className="bg-[#111318] rounded-2xl border border-white/5 overflow-hidden">
                        {users.map(u => (
                            <div key={u.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                                <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                                        {u.name}
                                        {u.role === 'admin' && <Crown size={11} className="text-yellow-400" />}
                                        {u.is_banned && <span className="text-[10px] text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded-full">Banned</span>}
                                        {u.is_online && !u.is_banned && <span className="w-2 h-2 bg-green-400 rounded-full" />}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">@{u.username} · {u.email}</p>
                                    <p className="text-[10px] text-gray-600">{u.messages_count || 0} messages</p>
                                </div>
                                <button
                                    onClick={(e) => openMenu(e, u.id)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all flex-shrink-0">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        ))}
                        {users.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-600 text-sm">No users found</div>
                        )}
                    </div>
                )}

                {/* MESSAGES TAB */}
                {tab === 'messages' && (
                    <div className="bg-[#111318] rounded-2xl border border-white/5 overflow-hidden">
                        {messages.map(msg => (
                            <div key={msg.id} className="flex items-start gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                                <img src={msg.sender?.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-gray-500 mb-0.5">
                                        <span className="text-white font-medium">{msg.sender?.name}</span> · {new Date(msg.created_at).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-300 break-words">{msg.body}</p>
                                </div>
                                <button onClick={() => deleteMessage(msg.id)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {messages.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-600 text-sm">No messages found</div>
                        )}
                    </div>
                )}

                {/* GROUPS TAB */}
                {tab === 'groups' && (
                    <div className="bg-[#111318] rounded-2xl border border-white/5 overflow-hidden">
                        {groups.map(g => (
                            <div key={g.id} className="flex items-center gap-3 px-4 py-3 border-b border-white/5 last:border-0">
                                <img src={g.image_url} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{g.name}</p>
                                    <p className="text-xs text-gray-500">Owner: {g.owner?.name} · {g.members_count} members</p>
                                </div>
                                <button onClick={() => deleteGroup(g.id)}
                                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all flex-shrink-0">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        {groups.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-600 text-sm">No groups found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

function StatCard({ label, value, icon: Icon, color }) {
    const colors = {
        indigo: 'from-indigo-600/20 to-indigo-600/5 text-indigo-400 border-indigo-500/20',
        green: 'from-green-600/20 to-green-600/5 text-green-400 border-green-500/20',
        red: 'from-red-600/20 to-red-600/5 text-red-400 border-red-500/20',
        purple: 'from-purple-600/20 to-purple-600/5 text-purple-400 border-purple-500/20',
    }
    return (
        <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl p-4 border`}>
            <Icon size={18} className="mb-2 opacity-80" />
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        </div>
    )
}
