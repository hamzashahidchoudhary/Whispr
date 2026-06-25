import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../api/axios'

export function useConversation(conversationId) {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [typingUsers, setTypingUsers] = useState([])
    const pollingRef = useRef(null)
    const sendingRef = useRef(false)

    const fetchAndUpdate = useCallback(() => {
        return api.get(`/conversations/${conversationId}/messages`)
            .then(res => {
                const newMsgs = res.data.data.reverse()
                setMessages(prev => {
                    const newMap = {}
                    newMsgs.forEach(m => { newMap[m.id] = m })

                    const prevIds = new Set(prev.map(m => m.id))

                    // Update ALL existing messages (body, reactions, is_edited, is_deleted)
                    const updated = prev.map(m => newMap[m.id] ? { ...newMap[m.id] } : m)

                    // Add any brand new messages
                    const added = newMsgs.filter(m => !prevIds.has(m.id))

                    if (added.length === 0) {
                        // Check if anything actually changed
                        const changed = prev.some(m => {
                            const n = newMap[m.id]
                            if (!n) return false
                            return n.body !== m.body ||
                                n.is_edited !== m.is_edited ||
                                n.is_deleted !== m.is_deleted ||
                                JSON.stringify(n.reactions) !== JSON.stringify(m.reactions)
                        })
                        if (!changed) return prev
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

        fetchAndUpdate().finally(() => setLoading(false))

        pollingRef.current = setInterval(() => {
            if (sendingRef.current) return
            fetchAndUpdate().catch(() => {})
        }, 2000)

        return () => clearInterval(pollingRef.current)
    }, [conversationId, fetchAndUpdate])

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