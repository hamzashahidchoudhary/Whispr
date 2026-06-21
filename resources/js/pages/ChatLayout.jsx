import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ConversationView from '../components/ConversationView'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle } from 'lucide-react'

export default function ChatLayout() {
    const { id } = useParams()
    const { user } = useAuth()

    return (
        <div style={{ height: '100dvh', display: 'flex', overflow: 'hidden', background: '#0d0f14' }}>
            {/* Sidebar - full screen on mobile when no conversation open */}
            <div style={{
                display: id ? 'none' : 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100dvh',
            }}
                className="md:flex md:w-80 md:min-w-80"
            >
                <Sidebar activeId={id} />
            </div>

            {/* On desktop always show sidebar */}
            <div style={{ display: 'none' }}
                className="md:flex md:flex-col md:w-80 md:min-w-80 md:h-full"
                id="desktop-sidebar"
            >
            </div>

            {/* Conversation view */}
            <div style={{
                display: id ? 'flex' : 'none',
                flexDirection: 'column',
                flex: 1,
                height: '100dvh',
                overflow: 'hidden',
            }}
                className="md:flex"
            >
                {id ? (
                    <ConversationView />
                ) : null}
            </div>

            {/* Desktop empty state */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-[#0d0f14]"
                style={{ display: id ? 'none' : undefined }}
            >
                {!id && (
                    <div className="text-center px-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-500/30">
                            <MessageCircle size={36} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Welcome to Whispr!</h2>
                        <p className="text-gray-500 text-sm max-w-xs">
                            Select a conversation or search for someone to start chatting.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
