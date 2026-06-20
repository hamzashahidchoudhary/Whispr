import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'
import '../echo'

export function useConversation(conversationId) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [typingUsers, setTypingUsers] = useState([])
    const channelRef = useRef(null)

    useEffect(() => {
        if (!conversationId) return

        setLoading(true)
        setMessages([])

        api.get(`/conversations/${conversationId}/messages`)
            .then(res => setMessages(res.data.data.reverse()))
            .finally(() => setLoading(false))

        const echo = window.Echo
        channelRef.current = echo.channel(`conversation.${conversationId}`)
            .listen('.message.sent', ({ message }) => {
                setMessages(prev => [...prev, message])
            })
            .listenForWhisper('typing', ({ user, isTyping }) => {
                setTypingUsers(prev =>
                    isTyping
                        ? [...prev.filter(u => u.id !== user.id), user]
                        : prev.filter(u => u.id !== user.id)
                )
            })

        return () => {
            window.Echo.leave(`conversation.${conversationId}`)
        }
    }, [conversationId])

    const sendMessage = async (body, replyToId = null) => {
        const { data } = await api.post(`/conversations/${conversationId}/messages`, {
            body,
            reply_to_id: replyToId,
        })
        setMessages(prev => [...prev, data])
        return data
    }

    const sendTyping = (isTyping) => {
        channelRef.current?.whisper('typing', { isTyping })
    }

    return { messages, loading, typingUsers, sendMessage, sendTyping, setMessages }
}