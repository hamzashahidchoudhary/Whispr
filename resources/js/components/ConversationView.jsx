import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useConversation } from '../hooks/useConversation'
import { useAuth } from '../contexts/AuthContext'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import api from '../api/axios'

export default function ConversationView() {
    const { id } = useParams()
    const { user } = useAuth()
    const { messages, loading, typingUsers, sendMessage, sendTyping } = useConversation(id)
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    useEffect(() => {
        if (id) {
            api.post(`/conversations/${id}/read`).catch(() => {})
        }
    }, [id, messages])

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-gray-950">
                <div className="text-gray-500 text-sm">Loading messages...</div>
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-gray-950">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-600 text-sm mt-12">
                        <p className="text-3xl mb-2">👋</p>
                        <p>No messages yet. Say hello!</p>
                    </div>
                )}
                {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 px-2 mt-2">
                        <div className="flex gap-1">
                            <span className="animate-bounce">•</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>•</span>
                            <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>•</span>
                        </div>
                        <span>{typingUsers[0].name} is typing...</span>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <MessageInput
                onSend={sendMessage}
                onTyping={sendTyping}
                conversationId={id}
            />
        </div>
    )
}