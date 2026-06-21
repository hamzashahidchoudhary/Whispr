import { useState, useRef } from 'react'
import { Paperclip, Send, X } from 'lucide-react'

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
        e.target.style.height = 'auto'
        e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px'
        onTyping(true)
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => onTyping(false), 1500)
    }

    const handleSend = async () => {
        if ((!text.trim() && selectedFiles.length === 0) || sending) return

        const currentText = text.trim()
        const currentFiles = [...selectedFiles]

        setText('')
        setSelectedFiles([])
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'
        }
        onTyping(false)
        clearTimeout(typingTimeout.current)

        setSending(true)
        try {
            if (currentFiles.length > 0) {
                setUploading(true)
                const formData = new FormData()
                formData.append('body', currentText || '')
                currentFiles.forEach(file => formData.append('attachments[]', file))
                await onSend(null, formData)
                setUploading(false)
            } else {
                await onSend(currentText)
            }
        } catch (err) {
            console.error('Send failed', err)
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
        <div
            style={{ flexShrink: 0, background: '#111318', borderTop: '1px solid rgba(255,255,255,0.05)' }}
            className="px-3 py-2"
        >
            {/* File previews */}
            {selectedFiles.length > 0 && (
                <div className="flex gap-2 mb-2 flex-wrap">
                    {selectedFiles.map((file, i) => (
                        <div key={i} className="relative group">
                            {file.type.startsWith('image/') ? (
                                <img src={URL.createObjectURL(file)} alt=""
                                    className="w-14 h-14 rounded-xl object-cover border border-white/10" />
                            ) : (
                                <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-1">
                                    <span className="text-xl">📎</span>
                                    <p className="text-[8px] text-gray-500 truncate w-full text-center">{file.name}</p>
                                </div>
                            )}
                            <button onClick={() => removeFile(i)}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                <X size={10} className="text-white" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex items-end gap-2">
                <button
                    onClick={() => fileRef.current.click()}
                    className="flex items-center justify-center text-gray-500 hover:text-indigo-400 rounded-xl transition-all flex-shrink-0"
                    style={{ width: 38, height: 38, WebkitTapHighlightColor: 'transparent' }}
                >
                    <Paperclip size={19} />
                </button>
                <input ref={fileRef} type="file" multiple onChange={handleFileChange} className="hidden"
                    accept="image/*,video/*,audio/*,.pdf,.docx,.zip,.txt" />

                <div
                    className="flex-1 flex items-end rounded-2xl px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 40 }}
                >
                    <textarea
                        ref={textareaRef}
                        value={text}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        rows={1}
                        className="w-full bg-transparent resize-none outline-none text-white placeholder-gray-600 leading-relaxed"
                        style={{
                            fontSize: 15,
                            height: 'auto',
                            maxHeight: 96,
                            overflowY: 'auto',
                            WebkitAppearance: 'none',
                        }}
                    />
                </div>

                <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className="flex items-center justify-center rounded-xl transition-all flex-shrink-0"
                    style={{
                        width: 38,
                        height: 38,
                        background: canSend
                            ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                            : 'rgba(255,255,255,0.05)',
                        WebkitTapHighlightColor: 'transparent',
                        opacity: canSend ? 1 : 0.5,
                    }}
                >
                    {uploading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Send size={16} color={canSend ? 'white' : '#6b7280'} />
                    )}
                </button>
            </div>
        </div>
    )
}
