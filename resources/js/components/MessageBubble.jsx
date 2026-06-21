import { format } from 'date-fns'
import { useAuth } from '../contexts/AuthContext'
import { Check, CheckCheck } from 'lucide-react'

export default function MessageBubble({ message }) {
    const { user } = useAuth()
    const isOwn = message.sender_id === user?.id

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
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 mb-1.5 px-3 group`}>
            {!isOwn && (
                <img
                    src={message.sender?.avatar_url}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-1"
                />
            )}
            <div className={`max-w-[78%] flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                {!isOwn && (
                    <span className="text-xs text-indigo-400 font-medium mb-1 px-1">
                        {message.sender?.name}
                    </span>
                )}

                {message.reply_to && (
                    <div className={`mb-1 px-3 py-1.5 rounded-xl text-xs border-l-2 border-indigo-400 max-w-full ${
                        isOwn ? 'bg-indigo-600/20' : 'bg-white/5'
                    }`}>
                        <p className="text-indigo-400 font-medium mb-0.5 truncate">{message.reply_to.sender?.name}</p>
                        <p className="text-gray-400 truncate">{message.reply_to.body}</p>
                    </div>
                )}

                <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed break-words ${
                    isOwn
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-sm shadow-md shadow-indigo-500/20'
                        : 'bg-[#1e2130] text-gray-100 rounded-bl-sm border border-white/5'
                }`}>
                    {message.body && <p>{message.body}</p>}

                    {message.attachments?.map(att => (
                        <div key={att.id} className="mt-2">
                            {att.mime_type?.startsWith('image/') ? (
                                <img
                                    src={'/storage/' + att.path}
                                    alt={att.name}
                                    className="rounded-xl max-w-full max-h-48 object-cover"
                                />
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

                <div className={`flex items-center gap-1 mt-0.5 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                    <span className="text-[10px] text-gray-600">
                        {format(new Date(message.created_at), 'h:mm a')}
                    </span>
                    {message.is_edited && (
                        <span className="text-[10px] text-gray-600">· edited</span>
                    )}
                    {isOwn && (
                        <span className={message.read_at ? 'text-indigo-400' : 'text-gray-600'}>
                            {message.read_at || message.delivered_at
                                ? <CheckCheck size={11} />
                                : <Check size={11} />
                            }
                        </span>
                    )}
                </div>

                {message.reactions?.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                        {Object.entries(
                            message.reactions.reduce((acc, r) => {
                                acc[r.emoji] = (acc[r.emoji] || 0) + 1
                                return acc
                            }, {})
                        ).map(([emoji, count]) => (
                            <span key={emoji}
                                className="bg-white/10 border border-white/10 rounded-full px-2 py-0.5 text-xs">
                                {emoji} {count}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
