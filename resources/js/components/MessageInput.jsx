import { useState, useRef } from 'react'
import { Paperclip, Send, Smile, Mic, X } from 'lucide-react'
import api from '../api/axios'

export default function MessageInput({ onSend, onTyping, conversationId }) {
    const [text, setText] = useState('')
    const [sending, setSending] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [selectedFiles, setSelectedFiles] = useState([])
    const typingTimeout = useRef(null)
    const fileRef = useRef(null)
    const textareaRef = useRef(null)

    const handleChange = (e) => {
        setText(e.target.value)
        // Auto resize textarea
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
        // Typing indicator
        onTyping(true)
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => onTyping(false), 1500)
    }

    const handleSend = async () => {
        if ((!text.trim() && selectedFiles.length === 0) || sending) return
        setSending(true)
        try {
            if (selectedFiles.length > 0) {
                setUploading(true)
                const formData = new FormData()
                if (text.trim()) formData.append('body', text.trim())
                selectedFiles.forEach(file => formData.append('attachments[]', file))
                const { data } = await api.post(`/conversations/${conversationId}/messages`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                onSend(null, data)
                setSelectedFiles([])
                setUploading(false)
            } else {
                await onSend(text.trim())
            }
            setText('')
            onTyping(false)
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto'
            }
        } finally {
            setSending(false)
            setUploading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        setSelectedFiles(prev => [...prev, ...files].slice(0, 5))
        e.target.value = ''
    }

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    }

    const canSend = (text.trim() || selectedFiles.length > 0) && !sending

    return (
        <div className="border-t border-white/5 bg-[#111318] px-4 py-3">
            {/* File previews */}
            {selectedFiles.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                    {selectedFiles.map((file, i) => (
                        <div key={i} className="relative group">
                            {file.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(file)} alt=""
                                    className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-1">
                                    <span className="text-2xl">📎</span>
                                    <p className="text-[8px] text-gray-500 truncate w-full text-center">{file.name}</p>
                                </div>
                            )}
                            <button onClick={() => removeFile(i)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={10} className="text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-end gap-2">
                <button onClick={() => fileRef.current.click()}
                    className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all flex-shrink-0">
                    <Paperclip size={18} />
                </button>
                <input ref={fileRef} type="file" multiple onChange={handleFileChange} className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.docx,.zip,.txt" />

                <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 focus-within:border-indigo-500/50 transition-all">
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                        rows={1}
                        className="w-full bg-transparent resize-none outline-none text-sm text-white placeholder-gray-600 max-h-32 leading-relaxed"
                        style={{ height: 'auto' }}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all flex-shrink-0 ${
                        canSend
                            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40'
                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                    }`}
                >
                    {uploading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Send size={16} className={canSend ? 'translate-x-0.5' : ''} />
                    )}
                </button>
            </div>
        </div>
    )
}
