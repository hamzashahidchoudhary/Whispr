import { useState, useRef } from 'react'
import { Paperclip, Send, Smile } from 'lucide-react'
import api from '../api/axios'

export default function MessageInput({ onSend, onTyping, conversationId }) {
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const typingTimeout = useRef(null)
    const fileRef = useRef(null)

    const handleChange = (e) => {
        setText(e.target.value)
        onTyping(true)
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => onTyping(false), 1500)
    }

    const handleSend = async () => {
        if (!text.trim() || sending) return
        setSending(true)
        try {
            await onSend(text.trim())
            setText('')
            onTyping(false)
        } finally {
            setSending(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files)
        if (!files.length) return

        const formData = new FormData()
        formData.append('body', '')
        files.forEach(file => formData.append('attachments[]', file))

        try {
            const { data } = await api.post(
                `/conversations/${conversationId}/messages`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            )
            onSend(null, data)
        } catch (err) {
            console.error('File upload failed', err)
        }

        e.target.value = ''
    }

    return (
        <div className="border-t border-gray-800 p-3">
            <div className="flex items-end gap-2 bg-gray-800 rounded-2xl px-3 py-2">
                <button
                    onClick={() => fileRef.current.click()}
                    className="text-gray-400 hover:text-gray-200 p-1 transition-colors"
                >
                    <Paperclip size={20} />
                </button>
                <input
                    ref={fileRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.docx,.zip"
                />
                <textarea
                    value={text}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder-gray-500 max-h-32"
                />
                <button
                    onClick={handleSend}
                    disabled={!text.trim() || sending}
                    className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    )
}