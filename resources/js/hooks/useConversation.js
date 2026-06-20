import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api/axios'

export function useConversation(conversationId) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [typingUsers, setTypingUsers] = useState([])
    const pollingRef = useRef(null)
    const messagesRef = useRef([])
    const sendingRef = useRef(false)

    // Keep messagesRef in sync with messages state
    useEffect(() => {
        messagesRef.current = messages
    }, [messages])

    const mergeMessages = useCallback((newMsgs) => {
        setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id))
            const toAdd = newMsgs.filter(m => !existingIds.has(m.id))
            if (toAdd.length === 0) return prev
            return [...prev, ...toAdd].sort((a, b) =>
                new Date(a.created_at) - new Date(b.created_at)
            )
        })
    }, [])

    useEffect(() => {
        if (!conversationId) return

        setLoading(true)
        setMessages([])
        messagesRef.current = []

        // Load initial messages
        api.get(`/conversations/${conversationId}/messages`)
            .then(res => {
                const msgs = res.data.data.reverse()
                setMessages(msgs)
                messagesRef.current = msgs
            })
            .finally(() => setLoading(false))

        // Poll every 2 seconds - only add NEW messages, never replace
        pollingRef.current = setInterval(() => {
            if (sendingRef.current) return
            api.get(`/conversations/${conversationId}/messages`)
                .then(res => {
                    const newMsgs = res.data.data.reverse()
                    mergeMessages(newMsgs)
                })
                .catch(() => {})
        }, 2000)

        return () => {
            clearInterval(pollingRef.current)
        }
    }, [conversationId, mergeMessages])

    const sendMessage = async (body, formData = null) => {
        sendingRef.current = true
        let data
        try {
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
            // Add own message immediately
            setMessages(prev => {
                if (prev.find(m => m.id === data.id)) return prev
                return [...prev, data]
            })
        } finally {
            // Allow polling again after short delay
            setTimeout(() => {
                sendingRef.current = false
            }, 1000)
        }
        return data
    }

    const sendTyping = () => {}

    return { messages, loading, typingUsers, sendMessage, sendTyping, setMessages }
}
