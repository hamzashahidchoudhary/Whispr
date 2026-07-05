import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useConversation } from '../hooks/useConversation'
import { useAuth } from '../contexts/AuthContext'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import GroupInfoModal from './GroupInfoModal'
import api from '../api/axios'
import { Phone, MoreVertical, ArrowLeft, X, Users, Search, Pin } from 'lucide-react'

export default function ConversationView() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { messages, loading, typingUsers, sendMessage, sendTyping, setMessages } = useConversation(id)
    const [conversation, setConversation] = useState(null)
    const [replyTo, setReplyTo] = useState(null)
    const [showGroupInfo, setShowGroupInfo] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [searchLoading, setSearchLoading] = useState(false)
    const [highlightedId, setHighlightedId] = useState(null)
    const [pinnedMessage, setPinnedMessage] = useState(null)
    const bottomRef = useRef(null)
    const searchInputRef = useRef(null)
    const messageRefs = useRef({})

    const loadConversation = () => {
        if (id) {
            api.get(`/conversations/${id}`).then(res => {
                setConversation(res.data)
                if (res.data.pinned_message_id) {
                    const pinned = messages.find(m => m.id === res.data.pinned_message_id)
                    if (pinned) setPinnedMessage(pinned)
                    else {
                        // fetch pinned message separately
                        api.get(`/conversations/${id}/messages`).then(r => {
                            const all = r.data.data
                            const p = all.find(m => m.id === res.data.pinned_message_id)
                            if (p) setPinnedMessage(p)
                        })
                    }
                } else {
                    setPinnedMessage(null)
                }
            })
            api.post(`/conversations/${id}/read`).catch(() => {})
        }
    }

    useEffect(() => {
    loadConversation()
    // Refresh every 10 seconds to update online status
    const interval = setInterval(loadConversation, 10000)
    return () => clearInterval(interval)
}, [id])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (showSearch && searchInputRef.current) searchInputRef.current.focus()
    }, [showSearch])

    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return }
        setSearchLoading(true)
        const timer = setTimeout(() => {
            const q = searchQuery.toLowerCase()
            const results = messages.filter(m => m.body && m.body.toLowerCase().includes(q) && !m.is_deleted)
            setSearchResults(results)
            setSearchLoading(false)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery, messages])

    const scrollToMessage = (msgId) => {
        setHighlightedId(msgId)
        const el = messageRefs.current[msgId]
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' })
            setTimeout(() => setHighlightedId(null), 2000)
        }
    }

    const handleUpdate = useCallback(() => {
        api.get(`/conversations/${id}/messages`)
            .then(res => setMessages(res.data.data.reverse()))
    }, [id, setMessages])

    const handlePin = useCallback(async (message) => {
    try {
        await api.post(`/messages/${message.id}/pin`)
        // Reload conversation to get updated pinned_message_id
        const res = await api.get(`/conversations/${id}`)
        setConversation(res.data)
        // Find pinned message
        if (res.data.pinned_message_id) {
            const pinned = messages.find(m => m.id === res.data.pinned_message_id)
            setPinnedMessage(pinned || null)
        } else {
            setPinnedMessage(null)
        }
    } catch (err) {
        console.error('Pin failed', err)
    }
}, [id, messages])

    const handleReply = (message) => setReplyTo(message)

    const handleSendWithReply = async (body, formData = null) => {
        if (formData) {
            if (replyTo) formData.append('reply_to_id', replyTo.id)
            await sendMessage(null, formData)
        } else {
            const res = await api.post(`/conversations/${id}/messages`, {
                body,
                reply_to_id: replyTo?.id || null,
            })
            setMessages(prev => {
                if (prev.find(m => m.id === res.data.id)) return prev
                return [...prev, res.data]
            })
        }
        setReplyTo(null)
    }

    const isGroup = conversation?.type === 'group'
    const other = conversation?.members?.find(m => m.id !== user?.id)
    const title = isGroup ? conversation?.group?.name : other?.name
    const avatar = isGroup
        ? (conversation?.group?.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(title || 'G')}&background=6366f1&color=fff`)
        : other?.avatar_url

    const handleGroupLeft = () => { setShowGroupInfo(false); navigate('/chat') }
    const handleGroupDeleted = () => { setShowGroupInfo(false); navigate('/chat') }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#0d0f14]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    <p className="text-gray-600 text-sm">Loading...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col bg-[#0d0f14]" style={{ height: '100dvh', maxHeight: '100dvh' }}>
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-3 border-b border-white/5 bg-[#111318]" style={{ flexShrink: 0 }}>
                <button onClick={() => navigate('/chat')}
                    className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white rounded-xl transition-all flex-shrink-0">
                    <ArrowLeft size={20} />
                </button>
                <button onClick={() => isGroup && setShowGroupInfo(true)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    {avatar && (
                        <div className="relative flex-shrink-0">
                            <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                            {!isGroup && other?.is_online && (
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#111318] rounded-full" />
                            )}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{title}</p>
                        <p className="text-xs text-gray-600">
                            {isGroup ? `${conversation?.members?.length || 0} members` : (other?.is_online ? '🟢 Online' : 'Offline')}
                        </p>
                    </div>
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => { setShowSearch(!showSearch); setSearchQuery(''); setSearchResults([]) }}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${showSearch ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-white'}`}>
                        <Search size={17} />
                    </button>
                    {!isGroup && (
                        <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-white rounded-xl">
                            <Phone size={17} />
                        </button>
                    )}
                    <button onClick={() => isGroup ? setShowGroupInfo(true) : null}
                        className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-white rounded-xl">
                        {isGroup ? <Users size={17} /> : <MoreVertical size={17} />}
                    </button>
                </div>
            </div>

            {/* Pinned Message Banner */}
            {pinnedMessage && !showSearch && (
                <div
                    className="flex items-center gap-3 px-4 py-2 bg-indigo-600/10 border-b border-indigo-500/20 cursor-pointer hover:bg-indigo-600/15 transition-all"
                    style={{ flexShrink: 0 }}
                    onClick={() => scrollToMessage(pinnedMessage.id)}
                >
                    <Pin size={13} className="text-indigo-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-indigo-400 font-medium mb-0.5">Pinned Message</p>
                        <p className="text-xs text-gray-300 truncate">{pinnedMessage.body || '📎 Attachment'}</p>
                    </div>
                    <button
                        onClick={e => { e.stopPropagation(); handlePin(pinnedMessage) }}
                        className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-white rounded-lg flex-shrink-0">
                        <X size={12} />
                    </button>
                </div>
            )}

            {/* Search bar */}
            {showSearch && (
                <div className="bg-[#111318] border-b border-white/5 px-3 py-2" style={{ flexShrink: 0 }}>
                    <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/10 focus-within:border-indigo-500/50 transition-all">
                        <Search size={14} className="text-gray-500 flex-shrink-0" />
                        <input ref={searchInputRef} value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search messages..."
                            className="bg-transparent text-sm outline-none w-full text-white placeholder-gray-600" />
                        {searchQuery && (
                            <button onClick={() => { setSearchQuery(''); setSearchResults([]) }}
                                className="text-gray-500 hover:text-gray-300 flex-shrink-0">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    {searchQuery && (
                        <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                            {searchLoading && <p className="text-xs text-gray-600 px-2 py-1">Searching...</p>}
                            {!searchLoading && searchResults.length === 0 && (
                                <p className="text-xs text-gray-600 px-2 py-2">No messages found</p>
                            )}
                            {!searchLoading && searchResults.map(msg => (
                                <button key={msg.id} onClick={() => scrollToMessage(msg.id)}
                                    className="w-full flex items-start gap-2 px-2 py-2 hover:bg-white/5 rounded-lg transition-all text-left">
                                    <img src={msg.sender?.avatar_url} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-indigo-400">{msg.sender?.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{msg.body}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-600 flex-shrink-0">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </span>
                                </button>
                            ))}
                            {!searchLoading && searchResults.length > 0 && (
                                <p className="text-[10px] text-gray-600 px-2 py-1">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Messages */}
            <div className="overflow-y-auto overscroll-contain py-3" style={{ flex: '1 1 0', minHeight: 0 }}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                            {avatar ? <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover" /> : <span className="text-2xl">👋</span>}
                        </div>
                        <p className="text-white font-medium text-sm mb-1">Start the conversation</p>
                        <p className="text-gray-600 text-xs">Say hi to {title}!</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const prevMsg = messages[i - 1]
                    const showDate = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString()
                    const isHighlighted = highlightedId === msg.id
                    const isPinned = conversation?.pinned_message_id === msg.id

                    return (
                        <div key={msg.id} ref={el => messageRefs.current[msg.id] = el}
                            className={`transition-all duration-500 ${isHighlighted ? 'bg-indigo-500/10 rounded-xl' : ''}`}>
                            {showDate && (
                                <div className="flex items-center gap-3 px-4 py-2 my-1">
                                    <div className="flex-1 h-px bg-white/5" />
                                    <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-1 rounded-full whitespace-nowrap">
                                        {new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>
                            )}
                            <MessageBubble
                                message={msg}
                                onReact={handleUpdate}
                                onUpdate={handleUpdate}
                                onReply={handleReply}
                                onPin={handlePin}
                                isPinned={isPinned}
                            />
                        </div>
                    )
                })}

                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2">
                        <div className="flex items-center gap-1 bg-[#1e2130] rounded-2xl rounded-bl-sm px-4 py-3 border border-white/5">
                            {[0, 1, 2].map(i => (
                                <div key={i} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                                    style={{ animationDelay: `${i * 0.15}s` }} />
                            ))}
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            {/* Reply preview */}
            {replyTo && (
                <div className="flex items-center gap-3 px-4 py-2 bg-[#111318] border-t border-white/5" style={{ flexShrink: 0 }}>
                    <div className="flex-1 border-l-2 border-indigo-500 pl-3 min-w-0">
                        <p className="text-xs text-indigo-400 font-medium">↩ Replying to {replyTo.sender?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{replyTo.body || '📎 Attachment'}</p>
                    </div>
                    <button onClick={() => setReplyTo(null)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg flex-shrink-0">
                        <X size={16} />
                    </button>
                </div>
            )}

            <div style={{ flexShrink: 0 }}>
                <MessageInput onSend={handleSendWithReply} onTyping={sendTyping} conversationId={id} />
            </div>

            {showGroupInfo && conversation?.group && (
                <GroupInfoModal groupId={conversation.group.id}
                    onClose={() => setShowGroupInfo(false)}
                    onLeft={handleGroupLeft} onDeleted={handleGroupDeleted} />
            )}
        </div>
    )
}
