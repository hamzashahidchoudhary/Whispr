import { useState, useEffect } from 'react'
import { X, Users, Camera, Check } from 'lucide-react'
import api from '../api/axios'

export default function CreateGroupModal({ onClose, onCreated }) {
    const [step, setStep] = useState(1) // 1 = select members, 2 = group details
    const [search, setSearch] = useState('')
    const [results, setResults] = useState([])
    const [selected, setSelected] = useState([])
    const [groupName, setGroupName] = useState('')
    const [groupDesc, setGroupDesc] = useState('')
    const [groupImage, setGroupImage] = useState(null)
    const [creating, setCreating] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!search.trim()) { setResults([]); return }
        const timer = setTimeout(() => {
            api.get(`/users/search?q=${search}`).then(res => setResults(res.data))
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const toggleUser = (user) => {
        setSelected(prev =>
            prev.find(u => u.id === user.id)
                ? prev.filter(u => u.id !== user.id)
                : [...prev, user]
        )
    }

    const handleCreate = async () => {
        if (!groupName.trim() || creating) return
        setCreating(true)
        setError('')
        try {
            let data
            if (groupImage) {
                const formData = new FormData()
                formData.append('name', groupName.trim())
                if (groupDesc.trim()) formData.append('description', groupDesc.trim())
                selected.forEach(u => formData.append('member_ids[]', u.id))
                formData.append('image', groupImage)
                const res = await api.post('/groups', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                data = res.data
            } else {
                const res = await api.post('/groups', {
                    name: groupName.trim(),
                    description: groupDesc.trim() || null,
                    member_ids: selected.map(u => u.id),
                })
                data = res.data
            }
            onCreated(data)
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create group')
        } finally {
            setCreating(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111318] w-full md:w-[420px] md:rounded-2xl rounded-t-3xl border border-white/10 max-h-[85dvh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                    <h2 className="text-white font-semibold">
                        {step === 1 ? 'New Group' : 'Group Details'}
                    </h2>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <X size={18} />
                    </button>
                </div>

                {step === 1 ? (
                    <>
                        {/* Selected members chips */}
                        {selected.length > 0 && (
                            <div className="flex gap-2 px-5 py-3 flex-wrap border-b border-white/5 flex-shrink-0">
                                {selected.map(u => (
                                    <div key={u.id} className="flex items-center gap-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-full pl-1 pr-2 py-1">
                                        <img src={u.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                                        <span className="text-xs text-indigo-300">{u.name.split(' ')[0]}</span>
                                        <button onClick={() => toggleUser(u)} className="text-indigo-400 hover:text-white">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Search */}
                        <div className="px-5 py-3 flex-shrink-0">
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search people to add..."
                                className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
                            />
                        </div>

                        {/* User list */}
                        <div className="flex-1 overflow-y-auto px-2 pb-2">
                            {results.map(u => {
                                const isSelected = selected.find(s => s.id === u.id)
                                return (
                                    <button key={u.id} onClick={() => toggleUser(u)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-all">
                                        <img src={u.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                                        <div className="flex-1 text-left min-w-0">
                                            <p className="text-sm font-medium text-white truncate">{u.name}</p>
                                            <p className="text-xs text-gray-500 truncate">@{u.username}</p>
                                        </div>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'
                                        }`}>
                                            {isSelected && <Check size={12} className="text-white" />}
                                        </div>
                                    </button>
                                )
                            })}
                            {!search && (
                                <div className="text-center py-8 text-gray-600 text-sm">
                                    Search for people to add to the group
                                </div>
                            )}
                        </div>

                        {/* Next button */}
                        <div className="p-4 border-t border-white/5 flex-shrink-0">
                            <button
                                onClick={() => setStep(2)}
                                disabled={selected.length === 0}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-all"
                            >
                                Next ({selected.length} selected)
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Group image */}
                            <div className="flex justify-center">
                                <label className="relative cursor-pointer">
                                    <div className="w-20 h-20 rounded-2xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden">
                                        {groupImage ? (
                                            <img src={URL.createObjectURL(groupImage)} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={24} className="text-gray-600" />
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" className="hidden"
                                        onChange={e => setGroupImage(e.target.files[0])} />
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Group Name</label>
                                <input
                                    value={groupName}
                                    onChange={e => setGroupName(e.target.value)}
                                    placeholder="e.g. Weekend Squad"
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1.5">Description (optional)</label>
                                <input
                                    value={groupDesc}
                                    onChange={e => setGroupDesc(e.target.value)}
                                    placeholder="What's this group about?"
                                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-600"
                                />
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-2">{selected.length} Members</p>
                                <div className="flex -space-x-2">
                                    {selected.slice(0, 6).map(u => (
                                        <img key={u.id} src={u.avatar_url} alt=""
                                            className="w-8 h-8 rounded-full object-cover border-2 border-[#111318]" />
                                    ))}
                                    {selected.length > 6 && (
                                        <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#111318] flex items-center justify-center text-[10px] text-gray-400">
                                            +{selected.length - 6}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/5 flex gap-2 flex-shrink-0">
                            <button onClick={() => setStep(1)}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-xl font-semibold text-sm transition-all">
                                Back
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!groupName.trim() || creating}
                                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                <Users size={16} />
                                {creating ? 'Creating...' : 'Create Group'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
