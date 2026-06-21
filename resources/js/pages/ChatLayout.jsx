import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import ConversationView from '../components/ConversationView'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle } from 'lucide-react'

export default function ChatLayout() {
    const { id } = useParams()
    const { user } = useAuth()

    return (
        <div style={{
            display: 'flex',
            height: '100dvh',
            overflow: 'hidden',
            background: '#0d0f14',
        }}>
            {/*
              SIDEBAR:
              - Mobile: show ONLY when no conversation is open
              - Desktop: always show, fixed width 320px
            */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                width: '320px',
                minWidth: '320px',
                height: '100dvh',
                borderRight: '1px solid rgba(255,255,255,0.05)',
                // On mobile hide sidebar when conversation is open
            }} className={id ? 'hidden md:flex' : 'flex w-full md:w-80 md:min-w-80'}>
                <Sidebar activeId={id} />
            </div>

            {/*
              MAIN AREA:
              - Mobile: show ONLY when conversation is open (full screen)
              - Desktop: always show, takes remaining space
            */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100dvh',
                overflow: 'hidden',
                minWidth: 0,
            }} className={id ? 'flex' : 'hidden md:flex'}>
                {id ? (
                    <ConversationView />
                ) : (
                    // Desktop empty state when no conversation selected
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#0d0f14',
                    }}>
                        <div style={{ textAlign: 'center', padding: '0 24px' }}>
                            <div style={{
                                width: 80, height: 80,
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                borderRadius: 24,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 24px',
                                boxShadow: '0 20px 40px rgba(79,70,229,0.3)',
                            }}>
                                <MessageCircle size={36} color="white" />
                            </div>
                            <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: '0 0 8px' }}>
                                Welcome to Whispr, {user?.name?.split(' ')[0]}!
                            </h2>
                            <p style={{ color: '#6b7280', fontSize: 14, margin: 0, maxWidth: 260 }}>
                                Select a conversation from the sidebar or search for someone to start chatting.
                            </p>
                            <div style={{
                                display: 'flex', gap: 12, marginTop: 24,
                                justifyContent: 'center',
                            }}>
                                {['💬 Chat', '👥 Groups', '📎 Files'].map(item => (
                                    <div key={item} style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        borderRadius: 12, padding: '8px 12px',
                                        fontSize: 12, color: '#6b7280',
                                    }}>
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
