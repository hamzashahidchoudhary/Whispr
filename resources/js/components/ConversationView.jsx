import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useConversation } from '../hooks/useConversation'
import { useAuth } from '../contexts/AuthContext'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import api from '../api/axios'
import { Phone, MoreVertical, ArrowLeft } from 'lucide-react'

export default function ConversationView() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { messages, loading, typingUsers, sendMessage, sendTyping, setMessages } = useConversation(id)
    const [conversation, setConversation] = useState(null)
    const bottomRef = useRef(null)

    useEffect(() => {
        if (id) {
            api.get(`/conversations/${id}`).then(res => setConversation(res.data))
            api.post(`/conversations/${id}/read`).catch(() => {})
        }
    }, [id])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Refresh messages after a reaction
    const handleReact = useCallback(() => {
        api.get(`/conversations/${id}/messages`)
            .then(res => setMessages(res.data.data.reverse()))
    }, [id, setMessages])

    const other = conversation?.members?.find(m => m.id !== user?.id)
    const title = conversation?.type === 'group'
        ? conversation?.group?.name
        : other?.name
    const avatar = conversation?.type === 'group'
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(title || 'G')}&background=6366f1&color=fff`
        : other?.avatar_url

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
        <div
            className="flex flex-col bg-[#0d0f14]"
            style={{ height: '100dvh', maxHeight: '100dvh' }}
        >
            {/* Header */}
            <div className="flex items-center gap-3 px-3 py-3 border-b border-white/5 bg-[#111318]" style={{ flexShrink: 0 }}>
                <button onClick={() => navigate('/chat')}
                    className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-white rounded-xl transition-all flex-shrink-0">
                    <ArrowLeft size={20} />
                </button>

                {avatar && (
                    <div className="relative flex-shrink-0">
                        <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        {conversation?.type === 'private' && other?.is_online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#111318] rounded-full" />
                        )}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{title}</p>
                    <p className="text-xs text-gray-600">{other?.is_online ? '🟢 Online' : 'Offline'}</p>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                    <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-white rounded-xl">
                        <Phone size={17} />
                    </button>
                    <button className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-white rounded-xl">
                        <MoreVertical size={17} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="overflow-y-auto overscroll-contain py-3" style={{ flex: '1 1 0', minHeight: 0 }}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8 py-12">
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-3">
                            {avatar
                                ? <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                                : <span className="text-2xl">👋</span>
                            }
                        </div>
                        <p className="text-white font-medium text-sm mb-1">Start the conversation</p>
                        <p className="text-gray-600 text-xs">Say hi to {title}!</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const prevMsg = messages[i - 1]
                    const showDate = !prevMsg ||
                        new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString()

                    return (
                        <div key={msg.id}>
                            {showDate && (
                                <div className="flex items-center gap-3 px-4 py-2 my-1">
                                    <div className="flex-1 h-px bg-white/5" />
                                    <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-1 rounded-full whitespace-nowrap">
                                        {new Date(msg.created_at).toLocaleDateString('en-US', {
                                            weekday: 'short', month: 'short', day: 'numeric'
                                        })}
                                    </span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>
                            )}
                            <MessageBubble
                                message={msg}
                                onReact={handleReact}
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

            {/* Input */}
            <div style={{ flexShrink: 0 }}>
                <MessageInput onSend={sendMessage} onTyping={sendTyping} conversationId={id} />
            </div>
        </div>
    )
}
