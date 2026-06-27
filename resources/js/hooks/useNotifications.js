import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'

// Simple beep sound using Web Audio API - no external files needed
function playNotificationSound() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.frequency.setValueAtTime(880, ctx.currentTime)
        oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.1)

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.3)
    } catch (e) {
        // Audio not supported
    }
}

// Request browser notification permission
export async function requestNotificationPermission() {
    if (!('Notification' in window)) return false
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    const permission = await Notification.requestPermission()
    return permission === 'granted'
}

// Show a browser notification
function showBrowserNotification(title, body, icon) {
    if (Notification.permission !== 'granted') return
    if (!document.hidden) return // Only show when tab is hidden

    const notification = new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'whispr-message', // Replace previous notification
    })

    notification.onclick = () => {
        window.focus()
        notification.close()
    }

    // Auto close after 4 seconds
    setTimeout(() => notification.close(), 4000)
}

export function useNotifications(conversations, currentConversationId) {
    const { user } = useAuth()
    const prevUnreadRef = useRef({})
    const originalTitle = useRef(document.title)

    const updateTabTitle = useCallback((totalUnread) => {
        if (totalUnread > 0) {
            document.title = `(${totalUnread}) Whispr`
        } else {
            document.title = originalTitle.current
        }
    }, [])

    useEffect(() => {
        if (!conversations || !user) return

        let totalUnread = 0
        const newNotifications = []

        conversations.forEach(conv => {
            const unread = conv.unread_count || 0
            const prevUnread = prevUnreadRef.current[conv.id] || 0
            totalUnread += unread

            // New messages arrived in this conversation
            if (unread > prevUnread && String(conv.id) !== String(currentConversationId)) {
                const other = conv.members?.find(m => m.id !== user.id)
                const name = conv.type === 'group' ? conv.group?.name : other?.name
                const lastMsg = conv.last_message

                newNotifications.push({
                    title: name || 'Whispr',
                    body: lastMsg?.body || 'New message',
                    icon: other?.avatar_url,
                })
            }

            prevUnreadRef.current[conv.id] = unread
        })

        // Update tab title
        updateTabTitle(totalUnread)

        // Show notifications for new messages
        newNotifications.forEach(({ title, body, icon }) => {
            playNotificationSound()
            showBrowserNotification(title, body, icon)
        })
    }, [conversations, currentConversationId, user, updateTabTitle])

    // Reset title when tab becomes visible
    useEffect(() => {
        const handler = () => {
            if (!document.hidden) {
                // Recalculate after a moment
                setTimeout(() => {
                    const total = Object.values(prevUnreadRef.current).reduce((a, b) => a + b, 0)
                    updateTabTitle(total)
                }, 500)
            }
        }
        document.addEventListener('visibilitychange', handler)
        return () => document.removeEventListener('visibilitychange', handler)
    }, [updateTabTitle])

    // Restore title on unmount
    useEffect(() => {
        return () => {
            document.title = originalTitle.current
        }
    }, [])
}
