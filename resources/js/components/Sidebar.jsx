import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, LogOut, Settings, Users, MessageCircle, Plus, X, Bell, UserPlus } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import api from '../api/axios'
import { useNotifications, requestNotificationPermission } from '../hooks/useNotifications'
import CreateGroupModal from './CreateGroupModal'

export default function Sidebar({ activeId }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [conversations, setConversations] = useState([])
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searching, setSearching] = useState(false)
    const [notifEnabled, setNotifEnabled] = useState(Notification?.permission === 'granted')
    const [showGroupModal, setShowGroupModal] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    useNotifications(conversations, activeId)

    useEffect(() => {
        const load = () => {
            api.get('/conversations').then(res => setConversations(res.data.data || []))
        }
        load()
        const interval = setInterval(load, 3000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!search.trim()) { setSearchResults([]); setSearching(false); return }
        setSearching(true)
        const timer = setTimeout(() => {
            api.get(`/users/search?q=${search}`)
                .then(res => setSearchResults(res.data))
                .finally(() => setSearching(false))
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const startConversation = async (userId) => {
        const { data } = await api.post('/conversations', { user_id: userId })
        setSearch('')
        setSearchResults([])
        navigate(`/chat/${data.id}`)
    }

    const handleLogout = async () => {
        await logout()
        navigate('/login')
    }

    const enableNotifications = async () => {
        const granted = await requestNotificationPermission()
        setNotifEnabled(granted)
    }

    const handleGroupCreated = (group) => {
        setShowGroupModal(false)
        if (group.conversation?.id) {
            navigate(`/chat/${group.conversation.id}`)
        }
        api.get('/conversations').then(res => setConversations(res.data.data || []))
    }

    return (
        <aside className="w-full flex flex-col h-full bg-[#111318] border-r border-white/5">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-white/5">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <MessageCircle size={16} className="text-white" />
                        </div>
                        <span className="text-white font-bold text-lg">Whispr</span>
                    </div>
                    <div className="flex items-center gap-1 relative">
                        <button
                            onClick={enableNotifications}
                            title={notifEnabled ? 'Notifications on' : 'Enable notifications'}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                                notifEnabled ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}>
                            <Bell size={16} />
                        </button>

                        {/* New chat/group plus button */}
                        <div className="relative">
                            <button
                                onClick={() => setShowMenu(!showMenu)}
                                className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                                <Plus size={18} />
                            </button>
                            {showMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                                    <div className="absolute right-0 top-11 z-50 bg-[#1e2130] border border-white/10 rounded-xl shadow-xl overflow-hidden min-w-[180px]">
                                        <button
                                            onClick={() => { setShowMenu(false); setShowGroupModal(true) }}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                                            <UserPlus size={15} className="text-indigo-400" />
                                            New Group
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <Link to="/chat/settings"
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                            <Settings size={16} />
                        </Link>
                        <button onClick={handleLogout}
                            className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all">
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>

                {/* User info */}
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5">
                    <div className="relative">
                        <img src={user?.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#111318] rounded-full" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-gray-500 text-xs truncate">@{user?.username}</p>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-white/5">
                <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2.5 border border-white/5 focus-within:border-indigo-500/50 transition-all">
                    <Search size={15} className="text-gray-500 flex-shrink-0" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search or start new chat..."
                        className="bg-transparent text-sm outline-none w-full text-white placeholder-gray-600"
                    />
                    {search && (
                        <button onClick={() => { setSearch(''); setSearchResults([]) }}
                            className="text-gray-600 hover:text-gray-400 flex-shrink-0">
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="border-b border-white/5">
                    <p className="text-xs text-gray-600 px-4 py-2 font-medium uppercase tracking-wider">People</p>
                    {searchResults.map(u => (
                        <button key={u.id} onClick={() => startConversation(u.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-all">
                            <div className="relative">
                                <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                {u.is_online && (
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#111318] rounded-full" />
                                )}
                            </div>
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{u.name}</p>
                                <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                            </div>
                            <Plus size={16} className="text-gray-600 flex-shrink-0" />
                        </button>
                    ))}
                </div>
            )}

            {searching && (
                <div className="px-4 py-3 text-xs text-gray-600 flex items-center gap-2">
                    <div className="w-3 h-3 border border-gray-600 border-t-gray-400 rounded-full animate-spin" />
                    Searching...
                </div>
            )}

            {!notifEnabled && Notification?.permission !== 'denied' && (
                <div className="mx-3 mt-3 p-3 bg-indigo-600/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                    <Bell size={16} className="text-indigo-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-indigo-300 font-medium">Enable notifications</p>
                        <p className="text-[10px] text-gray-500">Get notified for new messages</p>
                    </div>
                    <button onClick={enableNotifications}
                        className="text-xs text-indigo-400 font-medium hover:text-indigo-300 flex-shrink-0">
                        Enable
                    </button>
                </div>
            )}

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto overscroll-contain mt-1">
                {!search && conversations.length === 0 && (
                    <div className="text-center py-16 px-6">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users size={24} className="text-gray-600" />
                        </div>
                        <p className="text-gray-400 text-sm font-medium">No conversations yet</p>
                        <p className="text-gray-600 text-xs mt-1">Search for someone or create a group</p>
                    </div>
                )}
                {conversations.map(conv => (
                    <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        active={activeId === String(conv.id)}
                        currentUser={user}
                    />
                ))}
            </div>

            {/* Create Group Modal */}
            {showGroupModal && (
                <CreateGroupModal
                    onClose={() => setShowGroupModal(false)}
                    onCreated={handleGroupCreated}
                />
            )}
        </aside>
    )
}

function ConversationItem({ conversation, active, currentUser }) {
    const last = conversation.last_message
    const unread = conversation.unread_count || 0
    const other = conversation.members?.find(m => m.id !== currentUser?.id)
    const isGroup = conversation.type === 'group'
    const title = isGroup ? conversation.group?.name : other?.name
    const avatar = isGroup
        ? (conversation.group?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(title || 'G')}&background=6366f1&color=fff`)
        : other?.avatar_url

    return (
        <Link to={`/chat/${conversation.id}`}
            className={`flex items-center gap-3 px-4 py-3.5 transition-all border-b border-white/3 active:bg-white/10 ${
                active ? 'bg-indigo-600/15 border-l-2 border-l-indigo-500' : 'hover:bg-white/5 border-l-2 border-l-transparent'
            }`}>
            <div className="relative flex-shrink-0">
                <img src={avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                {isGroup ? (
                    <span className="absolute bottom-0 right-0 w-5 h-5 bg-indigo-600 border-2 border-[#111318] rounded-full flex items-center justify-center">
                        <Users size={9} className="text-white" />
                    </span>
                ) : (
                    other?.is_online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#111318] rounded-full" />
                    )
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <p className={`text-sm font-semibold truncate ${active ? 'text-white' : 'text-gray-200'}`}>
                        {title}
                    </p>
                    {last && (
                        <span className="text-[10px] text-gray-600 ml-2 flex-shrink-0">
                            {formatDistanceToNow(new Date(last.created_at), { addSuffix: false })}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between">
                    <p className={`text-xs truncate pr-2 ${unread > 0 && !active ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>
                        {isGroup && last?.sender ? `${last.sender.name?.split(' ')[0]}: ` : ''}
                        {last?.is_deleted ? '🚫 Deleted' : last?.body || (last ? '📎 Attachment' : 'No messages yet')}
                    </p>
                    {unread > 0 && (
                        <span className="bg-indigo-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 flex-shrink-0">
                            {unread > 99 ? '99+' : unread}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}
