import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ConversationView from '../components/ConversationView'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle } from 'lucide-react'

export default function ChatLayout() {
    const { id } = useParams()
    const { user } = useAuth()

    return (
        <div className="flex h-screen bg-[#0d0f14] overflow-hidden">
            <Sidebar activeId={id} />
            <main className="flex-1 flex flex-col overflow-hidden">
                {id ? (
                    <ConversationView />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-[#0d0f14]">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
                                <MessageCircle size={36} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Welcome to Whispr, {user?.name?.split(' ')[0]}!</h2>
                            <p className="text-gray-500 text-sm max-w-xs">
                                Select a conversation from the sidebar or search for someone to start chatting.
                            </p>
                            <div className="mt-8 grid grid-cols-3 gap-3 max-w-xs mx-auto">
                                {['💬 Chat', '👥 Groups', '📎 Files'].map(item => (
                                    <div key={item} className="bg-white/5 border border-white/5 rounded-xl p-3 text-center">
                                        <p className="text-xs text-gray-500">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
