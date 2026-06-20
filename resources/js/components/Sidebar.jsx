import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, LogOut, Settings, Users } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { formatDistanceToNow } from 'date-fns'
import api from '../api/axios'

export default function Sidebar({ activeId }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [conversations, setConversations] = useState([])
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])

    useEffect(() => {
        api.get('/conversations').then(res => setConversations(res.data.data))
    }, [])

    useEffect(() => {
        if (!search.trim()) { setSearchResults([]); return }
        const timer = setTimeout(() => {
            api.get(`/users/search?q=${search}`).then(res => setSearchResults(res.data))
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

    return (
        <aside className="w-80 min-w-[320px] border-r border-gray-800 flex flex-col h-full bg-gray-900">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <img
                        src={user?.avatar_url}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover"
                    />
                    <div>
                        <p className="font-semibold text-white text-sm">{user?.name}</p>
                        <p className="text-xs text-gray-400">@{user?.username}</p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Link
                        to="/chat/settings"
                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <Settings size={18} />
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="px-3 py-2">
                <div className="flex items-center gap-2 bg-gray-800 rounded-xl px-3 py-2">
                    <Search size={16} className="text-gray-400 flex-shrink-0" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search or start new chat"
                        className="bg-transparent text-sm outline-none w-full text-white placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
                <div className="border-b border-gray-800 pb-2">
                    <p className="text-xs text-gray-500 px-4 py-1 font-medium uppercase">People</p>
                    {searchResults.map(u => (
                        <button
                            key={u.id}
                            onClick={() => startConversation(u.id)}
                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-800 transition-colors"
                        >
                            <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                            <div className="text-left">
                                <p className="text-sm font-medium text-white">{u.name}</p>
                                <p className="text-xs text-gray-400">@{u.username}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 && !search && (
                    <div className="text-center text-gray-500 text-sm mt-12 px-4">
                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                        <p>No conversations yet.</p>
                        <p className="text-xs mt-1">Search for someone to start chatting.</p>
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
        </aside>
    )
}

function ConversationItem({ conversation, active, currentUser }) {
    const last = conversation.last_message
    const unread = conversation.unread_count || 0
    const other = conversation.members?.find(m => m.id !== currentUser?.id)
    const title = conversation.type === 'group'
        ? conversation.group?.name
        : other?.name

    const avatar = conversation.type === 'group'
        ? `https://ui-avatars.com/api/?name=${title}&background=6366f1&color=fff`
        : other?.avatar_url

    return (
        <Link
            to={`/chat/${conversation.id}`}
            className={`flex items-center gap-3 px-4 py-3 border-b border-gray-800 hover:bg-gray-800 transition-colors ${active ? 'bg-gray-800' : ''}`}
        >
            <div className="relative">
                <img src={avatar} alt="" className="w-11 h-11 rounded-full object-cover" />
                {conversation.type === 'private' && other?.is_online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="font-medium text-white text-sm truncate">{title}</p>
                    {last && (
                        <span className="text-[10px] text-gray-500 ml-2 flex-shrink-0">
                            {formatDistanceToNow(new Date(last.created_at), { addSuffix: false })}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between mt-0.5">
                    <p className="text-xs text-gray-500 truncate">
                        {last?.is_deleted ? 'Message deleted' : last?.body || 'No messages yet'}
                    </p>
                    {unread > 0 && (
                        <span className="ml-2 bg-indigo-600 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                            {unread > 99 ? '99+' : unread}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    )
}