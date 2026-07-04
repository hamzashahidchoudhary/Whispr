import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { Check, CheckCheck, Trash2, Pencil, X, Send, Reply, Pin } from 'lucide-react'
import api from '../api/axios'

const EMOJIS = ['❤️', '👍', '😂', '😢', '🔥', '😮']

export default function MessageBubble({ message, onReact, onUpdate, onReply, onPin, isPinned }) {
    const { user } = useAuth()
    const isOwn = message.sender_id === user?.id
    const [showMenu, setShowMenu] = useState(false)
    const [editing, setEditing] = useState(false)
    const [editText, setEditText] = useState(message.body || '')
    const [saving, setSaving] = useState(false)
    const menuRef = useRef(null)
    const longPressRef = useRef(null)
    const editRef = useRef(null)

    useEffect(() => {
        if (editing && editRef.current) {
            editRef.current.focus()
            editRef.current.setSelectionRange(editText.length, editText.length)
        }
    }, [editing])

    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
        }
        document.addEventListener('mousedown', handler)
        document.addEventListener('touchstart', handler)
        return () => {
            document.removeEventListener('mousedown', handler)
            document.removeEventListener('touchstart', handler)
        }
    }, [])

    const handleTouchStart = () => { longPressRef.current = setTimeout(() => setShowMenu(true), 500) }
    const handleTouchEnd = () => { if (longPressRef.current) clearTimeout(longPressRef.current) }

    const handleReact = async (emoji) => {
        setShowMenu(false)
        try {
            await api.post(`/messages/${message.id}/react`, { emoji })
            if (onReact) onReact()
        } catch (err) { console.error(err) }
    }

    const handleDelete = async () => {
        setShowMenu(false)
        if (!confirm('Delete this message?')) return
        try {
            await api.delete(`/messages/${message.id}`)
            if (onUpdate) onUpdate()
        } catch (err) { console.error(err) }
    }

    const handleEdit = () => {
        setShowMenu(false)
        setEditText(message.body || '')
        setEditing(true)
    }

    const handleReply = () => {
        setShowMenu(false)
        if (onReply) onReply(message)
    }

    const handlePin = () => {
        setShowMenu(false)
        if (onPin) onPin(message)
    }

    const saveEdit = async () => {
        if (!editText.trim() || saving) return
        setSaving(true)
        try {
            await api.put(`/messages/${message.id}`, { body: editText.trim() })
            setEditing(false)
            if (onUpdate) onUpdate()
        } catch (err) { console.error(err) }
        finally { setSaving(false) }
    }

    const cancelEdit = () => { setEditing(false); setEditText(message.body || '') }

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
                    🚫 This message was deleted
                </span>
            </div>
        )
    }

    return (
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 mb-2 px-3 group`}>
            {!isOwn && (
                <img src={message.sender?.avatar_url} alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1" />
            )}

            <div className={`max-w-[78%] flex flex-col ${isOwn ? 'items-end' : 'items-start'} relative`}
                ref={menuRef}>
                {!isOwn && (
                    <span className="text-xs text-indigo-400 font-medium mb-1 px-1">{message.sender?.name}</span>
                )}

                {/* Reply preview */}
                {message.reply_to && (
                    <div className={`mb-1 px-3 py-1.5 rounded-xl text-xs border-l-2 border-indigo-400 max-w-full ${isOwn ? 'bg-indigo-600/20' : 'bg-white/5'}`}>
                        <p className="text-indigo-400 font-medium mb-0.5 truncate">↩ {message.reply_to.sender?.name}</p>
                        <p className="text-gray-400 truncate">{message.reply_to.body || '📎 Attachment'}</p>
                    </div>
                )}

                {/* Context menu */}
                {showMenu && (
                    <div className={`absolute z-50 bottom-full mb-2 bg-[#1e2130] border border-white/10 rounded-2xl shadow-xl overflow-hidden min-w-[180px] ${isOwn ? 'right-0' : 'left-0'}`}>
                        {/* Quick reactions */}
                        <div className="flex gap-1 p-2 border-b border-white/5">
                            {EMOJIS.map(emoji => (
                                <button key={emoji} onClick={() => handleReact(emoji)}
                                    className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-white/10 active:bg-white/20 text-lg transition-all hover:scale-125"
                                    style={{ WebkitTapHighlightColor: 'transparent' }}>
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        <button onClick={handleReply}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                            <Reply size={14} className="text-gray-500" /> Reply
                        </button>

                        <button onClick={handlePin}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${isPinned ? 'text-indigo-400' : 'text-gray-300'}`}>
                            <Pin size={14} className={isPinned ? 'text-indigo-400' : 'text-gray-500'} />
                            {isPinned ? 'Unpin Message' : 'Pin Message'}
                        </button>

                        {isOwn && (
                            <>
                                <button onClick={handleEdit}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 transition-colors">
                                    <Pencil size={14} className="text-gray-500" /> Edit message
                                </button>
                                <button onClick={handleDelete}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                                    <Trash2 size={14} /> Delete message
                                </button>
                            </>
                        )}

                        <button onClick={() => setShowMenu(false)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-white/5 transition-colors border-t border-white/5">
                            <X size={14} /> Close
                        </button>
                    </div>
                )}

                {/* Editing */}
                {editing ? (
                    <div className="flex flex-col gap-2 w-full">
                        <textarea ref={editRef} value={editText} onChange={e => setEditText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEdit() }
                                if (e.key === 'Escape') cancelEdit()
                            }}
                            className="bg-[#1e2130] border border-indigo-500/50 text-white rounded-xl px-3 py-2 text-sm resize-none outline-none w-full min-w-[200px]"
                            rows={2} />
                        <div className="flex gap-2 justify-end">
                            <button onClick={cancelEdit}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-white/5 rounded-lg">
                                <X size={12} /> Cancel
                            </button>
                            <button onClick={saveEdit} disabled={saving}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50">
                                <Send size={12} /> {saving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} onTouchMove={handleTouchEnd}
                        onContextMenu={(e) => { e.preventDefault(); setShowMenu(true) }}
                        onClick={() => { if (window.innerWidth < 768) setShowMenu(!showMenu) }}
                        className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words select-none cursor-pointer relative ${
                            isOwn
                                ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-sm shadow-md shadow-indigo-500/20'
                                : 'bg-[#1e2130] text-gray-100 rounded-bl-sm border border-white/5'
                        } ${showMenu ? 'ring-2 ring-indigo-500/50' : ''}`}
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                        {isPinned && (
                            <Pin size={10} className="absolute top-1.5 right-1.5 text-indigo-300 opacity-60" />
                        )}
                        {message.body && <p>{message.body}</p>}
                        {message.attachments?.map(att => (
                            <div key={att.id} className="mt-2">
                                {att.mime_type?.startsWith('image/') ? (
                                    <img src={'/storage/' + att.path} alt={att.name} className="rounded-xl max-w-full max-h-48 object-cover" />
                                ) : att.mime_type?.startsWith('video/') ? (
                                    <video controls className="rounded-xl max-w-full max-h-48"><source src={'/storage/' + att.path} /></video>
                                ) : att.mime_type?.startsWith('audio/') ? (
                                    <audio controls className="w-full mt-1 max-w-[220px]"><source src={'/storage/' + att.path} /></audio>
                                ) : (
                                    <a href={'/storage/' + att.path} target="_blank" rel="noreferrer"
                                        className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2 text-xs hover:bg-black/30">
                                        📎 <span className="truncate">{att.name}</span>
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Timestamp */}
                {!editing && (
                    <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                        <span className="text-[10px] text-gray-600">{format(new Date(message.created_at), 'h:mm a')}</span>
                        {message.is_edited && <span className="text-[10px] text-gray-600">· edited</span>}
                        {isOwn && (
                            <span className={message.read_at ? 'text-indigo-400' : 'text-gray-600'}>
                                {message.read_at || message.delivered_at ? <CheckCheck size={11} /> : <Check size={11} />}
                            </span>
                        )}
                    </div>
                )}

                {/* Reactions */}
                {Object.keys(groupedReactions).length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1 px-1">
                        {Object.entries(groupedReactions).map(([emoji, data]) => (
                            <button key={emoji} onClick={() => handleReact(emoji)} title={data.users.join(', ')}
                                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs border transition-all active:scale-95 ${
                                    data.hasOwn
                                        ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                }`}
                                style={{ WebkitTapHighlightColor: 'transparent' }}>
                                {emoji} <span>{data.count}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
