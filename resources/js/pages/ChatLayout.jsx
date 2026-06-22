import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ConversationView from '../components/ConversationView'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle } from 'lucide-react'

export default function ChatLayout() {
    const { id } = useParams()
    const { user } = useAuth()

    return (
        <div className="flex h-screen overflow-hidden bg-[#0d0f14]">

            {/* ── SIDEBAR ──────────────────────────────────────────────
                Desktop : always visible, 320 px wide
                Mobile  : visible ONLY when no conversation is open     */}
            <div className={`
                flex-col h-full border-r border-white/5
                w-full md:w-80 md:min-w-[320px] md:max-w-[320px]
                ${id ? 'hidden md:flex' : 'flex'}
            `}>
                <Sidebar activeId={id} />
            </div>

            {/* ── MAIN PANEL ───────────────────────────────────────────
                Desktop : always visible, fills remaining space
                Mobile  : visible ONLY when a conversation is open      */}
            <div className={`
                flex-col flex-1 h-full overflow-hidden min-w-0
                ${id ? 'flex' : 'hidden md:flex'}
            `}>
                {id ? (
                    <ConversationView />
                ) : (
                    <div className="flex-1 flex items-center justify-center h-full">
                        <div className="text-center px-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
                                <MessageCircle size={36} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">
                                Welcome, {user?.name?.split(' ')[0]}!
                            </h2>
                            <p className="text-gray-500 text-sm max-w-[260px] mx-auto">
                                Select a conversation or search for someone to start chatting.
                            </p>
                            <div className="flex gap-3 mt-6 justify-center">
                                {['💬 Chat', '👥 Groups', '📎 Files'].map(item => (
                                    <div key={item} className="bg-white/5 border border-white/5 rounded-xl px-3 py-2 text-xs text-gray-500">
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
