import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { Check, CheckCheck } from 'lucide-react'
import api from '../api/axios'

const EMOJIS = ['❤️', '👍', '😂', '😢', '🔥', '😮']

export default function MessageBubble({ message, onReact }) {
    const { user } = useAuth()
    const isOwn = message.sender_id === user?.id
    const [showPicker, setShowPicker] = useState(false)
    const pickerRef = useRef(null)
    const longPressRef = useRef(null)
    const bubbleRef = useRef(null)

    // Close picker when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target) &&
                bubbleRef.current && !bubbleRef.current.contains(e.target)) {
                setShowPicker(false)
            }
        }
        document.addEventListener('mousedown', handler)
        document.addEventListener('touchstart', handler)
        return () => {
            document.removeEventListener('mousedown', handler)
            document.removeEventListener('touchstart', handler)
        }
    }, [])

    // Long press handlers for mobile
    const handleTouchStart = () => {
        longPressRef.current = setTimeout(() => {
            setShowPicker(true)
        }, 500) // 500ms long press
    }

    const handleTouchEnd = () => {
        if (longPressRef.current) {
            clearTimeout(longPressRef.current)
        }
    }

    const handleReact = async (emoji) => {
        setShowPicker(false)
        try {
            await api.post(`/messages/${message.id}/react`, { emoji })
            if (onReact) onReact()
        } catch (err) {
            console.error('React failed', err)
        }
    }

    // Group reactions by emoji
    const groupedReactions = (message.reactions || []).reduce((acc, r) => {
        if (!acc[r.emoji]) acc[r.emoji] = { count: 0, users: [], hasOwn: false }
        acc[r.emoji].count++
        acc[r.emoji].users.push(r.user?.name)
        if (r.user_id === user?.id) acc[r.emoji].hasOwn = true
        return acc
    }, {})

    if (message.is_deleted) {
        return (
            <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1 px-3`}>
                <span className="text-xs text-gray-600 italic px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                    🚫 Deleted
                </span>
            </div>
        )
    }

    return (
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 mb-2 px-3 group`}>
            {!isOwn && (
                <img
                    src={message.sender?.avatar_url}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                />
            )}

            <div className={`max-w-[78%] flex flex-col ${isOwn ? 'items-end' : 'items-start'} relative`}>
                {!isOwn && (
                    <span className="text-xs text-indigo-400 font-medium mb-1 px-1">
                        {message.sender?.name}
                    </span>
                )}

                {/* Reply preview */}
                {message.reply_to && (
                    <div className={`mb-1 px-3 py-1.5 rounded-xl text-xs border-l-2 border-indigo-400 max-w-full ${
                        isOwn ? 'bg-indigo-600/20' : 'bg-white/5'
                    }`}>
                        <p className="text-indigo-400 font-medium mb-0.5 truncate">{message.reply_to.sender?.name}</p>
                        <p className="text-gray-400 truncate">{message.reply_to.body}</p>
                    </div>
                )}

                {/* Emoji picker popup */}
                {showPicker && (
                    <div
                        ref={pickerRef}
                        className={`absolute z-50 bottom-full mb-2 flex gap-1 bg-[#1e2130] border border-white/10 rounded-2xl p-1.5 shadow-xl ${
                            isOwn ? 'right-0' : 'left-0'
                        }`}
                    >
                        {EMOJIS.map(emoji => (
                            <button
                                key={emoji}
                                onClick={() => handleReact(emoji)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 text-xl transition-all hover:scale-125 active:scale-110"
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                )}

                {/* Message bubble */}
                <div
                    ref={bubbleRef}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onTouchMove={handleTouchEnd}
                    onContextMenu={(e) => { e.preventDefault(); setShowPicker(true) }}
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words select-none cursor-pointer ${
                        isOwn
                            ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-sm shadow-md shadow-indigo-500/20'
                            : 'bg-[#1e2130] text-gray-100 rounded-bl-sm border border-white/5'
                    } ${showPicker ? 'ring-2 ring-indigo-500/50' : ''}`}
                >
                    {message.body && <p>{message.body}</p>}

                    {message.attachments?.map(att => (
                        <div key={att.id} className="mt-2">
                            {att.mime_type?.startsWith('image/') ? (
                                <img src={'/storage/' + att.path} alt={att.name}
                                    className="rounded-xl max-w-full max-h-48 object-cover" />
                            ) : att.mime_type?.startsWith('video/') ? (
                                <video controls className="rounded-xl max-w-full max-h-48">
                                    <source src={'/storage/' + att.path} />
                                </video>
                            ) : att.mime_type?.startsWith('audio/') ? (
                                <audio controls className="w-full mt-1 max-w-[220px]">
                                    <source src={'/storage/' + att.path} />
                                </audio>
                            ) : (
                                <a href={'/storage/' + att.path} target="_blank" rel="noreferrer"
                                    className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 text-xs hover:bg-black/30">
                                    📎 <span className="truncate">{att.name}</span>
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                {/* Timestamp & status */}
                <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-gray-600">
                        {format(new Date(message.created_at), 'h:mm a')}
                    </span>
                    {message.is_edited && <span className="text-[10px] text-gray-600">· edited</span>}
                    {isOwn && (
                        <span className={message.read_at ? 'text-indigo-400' : 'text-gray-600'}>
                            {message.read_at || message.delivered_at ? <CheckCheck size={11} /> : <Check size={11} />}
                        </span>
                    )}
                </div>

                {/* Reactions display */}
                {Object.keys(groupedReactions).length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1 px-1">
                        {Object.entries(groupedReactions).map(([emoji, data]) => (
                            <button
                                key={emoji}
                                onClick={() => handleReact(emoji)}
                                title={data.users.join(', ')}
                                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border transition-all active:scale-95 ${
                                    data.hasOwn
                                        ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                                style={{ WebkitTapHighlightColor: 'transparent' }}
                            >
                                {emoji} <span>{data.count}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
