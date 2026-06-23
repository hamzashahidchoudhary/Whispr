import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api/axios'

export function useConversation(conversationId) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [typingUsers, setTypingUsers] = useState([])
    const pollingRef = useRef(null)
    const sendingRef = useRef(false)

    const fetchMessages = useCallback(() => {
        return api.get(`/conversations/${conversationId}/messages`)
            .then(res => {
                const newMsgs = res.data.data.reverse()
                setMessages(prev => {
                    // Build a map of new messages by id
                    const newMap = {}
                    newMsgs.forEach(m => { newMap[m.id] = m })

                    // Update existing messages (reactions, edits etc)
                    // and add any new ones
                    const prevIds = new Set(prev.map(m => m.id))
                    const updated = prev.map(m => newMap[m.id] ? newMap[m.id] : m)
                    const added = newMsgs.filter(m => !prevIds.has(m.id))

                    if (added.length === 0 && JSON.stringify(updated.map(m => m.reactions)) === JSON.stringify(prev.map(m => m.reactions))) {
                        return prev // No changes, avoid re-render
                    }

                    return [...updated, ...added]
                })
                return newMsgs
            })
    }, [conversationId])

    useEffect(() => {
        if (!conversationId) return

        setLoading(true)
        setMessages([])

        // Initial load
        fetchMessages().finally(() => setLoading(false))

        // Poll every 2 seconds - updates messages AND reactions
        pollingRef.current = setInterval(() => {
            if (sendingRef.current) return
            fetchMessages().catch(() => {})
        }, 2000)

        return () => clearInterval(pollingRef.current)
    }, [conversationId, fetchMessages])

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
            setTimeout(() => { sendingRef.current = false }, 1000)
        }
        return data
    }

    const sendTyping = () => {}

    return { messages, loading, typingUsers, sendMessage, sendTyping, setMessages }
}
