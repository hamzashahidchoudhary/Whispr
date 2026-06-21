import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ConversationView from '../components/ConversationView'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle } from 'lucide-react'

export default function ChatLayout() {
    const { id } = useParams()
    const { user } = useAuth()

    return (
        <div className="flex h-screen h-dvh bg-[#0d0f14] overflow-hidden">
            {/* Sidebar - hidden on mobile when conversation is open */}
            <div className={`${id ? 'hidden md:flex' : 'flex'} w-full md:w-[320px] md:min-w-[320px] flex-col h-full`}>
                <Sidebar activeId={id} />
            </div>

            {/* Conversation - full screen on mobile */}
            <main className={`${id ? 'flex' : 'hidden md:flex'} flex-1 flex-col overflow-hidden`}>
                {id ? (
                    <ConversationView />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-[#0d0f14]">
                        <div className="text-center px-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
                                <MessageCircle size={36} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Welcome to Whispr!</h2>
                            <p className="text-gray-500 text-sm max-w-xs">
                                Select a conversation or search for someone to start chatting.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
