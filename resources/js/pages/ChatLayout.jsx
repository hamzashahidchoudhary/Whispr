import { useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ConversationView from '../components/ConversationView'
import { useAuth } from '../contexts/AuthContext'

export default function ChatLayout() {
    const { id } = useParams()
    const { user } = useAuth()

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden">
            <Sidebar activeId={id} />
            <main className="flex-1 flex flex-col overflow-hidden">
                {id ? (
                    <ConversationView />
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-950">
                        <div className="text-center text-gray-600">
                            <p className="text-5xl mb-4">💬</p>
                            <p className="text-lg font-medium text-gray-400">Welcome, {user?.name}!</p>
                            <p className="text-sm mt-1">Select a conversation or search for someone to start chatting.</p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
