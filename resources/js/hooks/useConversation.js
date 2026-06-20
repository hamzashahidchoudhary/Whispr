import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

export function useConversation(conversationId) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [typingUsers, setTypingUsers] = useState([])
    const pollingRef = useRef(null)
    const lastMessageId = useRef(null)

    useEffect(() => {
        if (!conversationId) return

        setLoading(true)
        setMessages([])
        lastMessageId.current = null

        // Load initial messages
        api.get(`/conversations/${conversationId}/messages`)
            .then(res => {
                const msgs = res.data.data.reverse()
                setMessages(msgs)
                if (msgs.length > 0) {
                    lastMessageId.current = msgs[msgs.length - 1].id
                }
            })
            .finally(() => setLoading(false))

        // Poll for new messages every 2 seconds
        pollingRef.current = setInterval(() => {
            api.get(`/conversations/${conversationId}/messages`)
                .then(res => {
                    const msgs = res.data.data.reverse()
                    if (msgs.length > 0) {
                        const latest = msgs[msgs.length - 1]
                        if (latest.id !== lastMessageId.current) {
                            lastMessageId.current = latest.id
                            setMessages(msgs)
                        }
                    }
                })
                .catch(() => {})
        }, 2000)

        return () => {
            clearInterval(pollingRef.current)
        }
    }, [conversationId])

    const sendMessage = async (body, formData = null) => {
        let data
        if (formData) {
            const res = await api.post(
                `/conversations/${conversationId}/messages`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            data = res.data
        } else {
            const res = await api.post(`/conversations/${conversationId}/messages`, {
                body,
                reply_to_id: null,
            })
            data = res.data
        }
        // Show own message immediately
        setMessages(prev => {
            if (prev.find(m => m.id === data.id)) return prev
            return [...prev, data]
        })
        lastMessageId.current = data.id
        return data
    }

    const sendTyping = () => {}

    return { messages, loading, typingUsers, sendMessage, sendTyping, setMessages }
}
