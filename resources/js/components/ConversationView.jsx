import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useConversation } from '../hooks/useConversation'
import { useAuth } from '../contexts/AuthContext'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import api from '../api/axios'
import { Phone, Video, MoreVertical, ArrowLeft, Info } from 'lucide-react'

export default function ConversationView() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const { messages, loading, typingUsers, sendMessage, sendTyping } = useConversation(id)
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
                    <p className="text-gray-600 text-sm">Loading messages...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0d0f14]">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-[#111318]">
                <button onClick={() => navigate('/chat')}
                    className="lg:hidden w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                    <ArrowLeft size={18} />
                </button>

                {avatar && (
                    <div className="relative">
                        <img src={avatar} alt="" className="w-9 h-9 rounded-full object-cover" />
                        {conversation?.type === 'private' && other?.is_online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#111318] rounded-full" />
                        )}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{title}</p>
                    <p className="text-xs text-gray-600">
                        {conversation?.type === 'private'
                            ? other?.is_online ? '🟢 Online' : `Last seen ${other?.last_seen_at ? 'recently' : 'a while ago'}`
                            : `${conversation?.members?.length || 0} members`
                        }
                    </p>
                </div>

                <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <Phone size={16} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <Video size={16} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-1">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                            {avatar ? (
                                <img src={avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <span className="text-2xl">👋</span>
                            )}
                        </div>
                        <p className="text-white font-medium mb-1">Start the conversation</p>
                        <p className="text-gray-600 text-sm">Send a message to {title}</p>
                    </div>
                )}

                {messages.map((msg, i) => {
                    const prevMsg = messages[i - 1]
                    const showDate = !prevMsg || new Date(msg.created_at).toDateString() !== new Date(prevMsg.created_at).toDateString()

                    return (
                        <div key={msg.id}>
                            {showDate && (
                                <div className="flex items-center gap-3 px-4 py-2">
                                    <div className="flex-1 h-px bg-white/5" />
                                    <span className="text-xs text-gray-600 bg-white/5 px-3 py-1 rounded-full">
                                        {new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                                    </span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>
                            )}
                            <MessageBubble message={msg} />
                        </div>
                    )
                })}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2">
                        <div className="flex items-center gap-1 bg-[#1e2130] rounded-2xl rounded-bl-sm px-4 py-3 border border-white/5">
                            <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"
                                        style={{ animationDelay: `${i * 0.15}s` }} />
                                ))}
                            </div>
                        </div>
                        <span className="text-xs text-gray-600">{typingUsers[0].name} is typing...</span>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            <MessageInput onSend={sendMessage} onTyping={sendTyping} conversationId={id} />
        </div>
    )
}
