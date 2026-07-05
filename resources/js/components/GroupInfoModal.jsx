import { useState, useEffect, useRef } from 'react'
import { X, Crown, Shield, UserMinus, LogOut, Trash2, Plus, Search, Camera } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../api/axios'

export default function GroupInfoModal({ groupId, onClose, onLeft, onDeleted }) {
    const { user } = useAuth()
    const [group, setGroup] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showAddMember, setShowAddMember] = useState(false)
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const photoRef = useRef(null)

    const loadGroup = () => {
        api.get(`/groups/${groupId}`).then(res => setGroup(res.data)).finally(() => setLoading(false))
    }

    useEffect(() => { loadGroup() }, [groupId])

    useEffect(() => {
        if (!search.trim()) { setSearchResults([]); return }
        const timer = setTimeout(() => {
            api.get(`/users/search?q=${search}`).then(res => setSearchResults(res.data))
        }, 300)
        return () => clearTimeout(timer)
    }, [search])

    const myRole = group?.members?.find(m => m.id === user?.id)?.role || 'member'
    const isAdmin = myRole === 'owner' || myRole === 'admin'
    const isOwner = myRole === 'owner'

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploadingPhoto(true)
        const fd = new FormData()
        fd.append('image', file)
        try {
            await api.post(`/groups/${groupId}?_method=PUT`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            loadGroup()
        } catch (err) {
            console.error('Failed to update group photo', err)
        } finally {
            setUploadingPhoto(false)
            e.target.value = ''
        }
    }

    const addMember = async (userId) => {
        try {
            await api.post(`/groups/${groupId}/members`, { user_id: userId })
            setSearch('')
            setSearchResults([])
            loadGroup()
        } catch (err) { console.error(err) }
    }

    const removeMember = async (userId) => {
        if (!confirm('Remove this member from the group?')) return
        try {
            await api.delete(`/groups/${groupId}/members/${userId}`)
            loadGroup()
        } catch (err) { console.error(err) }
    }

    const promoteMember = async (userId) => {
        try {
            await api.post(`/groups/${groupId}/promote/${userId}`)
            loadGroup()
        } catch (err) { console.error(err) }
    }

    const leaveGroup = async () => {
        if (!confirm('Leave this group?')) return
        try {
            await api.post(`/groups/${groupId}/leave`)
            onLeft()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to leave')
        }
    }

    const deleteGroup = async () => {
        if (!confirm('Delete this group permanently? This cannot be undone.')) return
        try {
            await api.delete(`/groups/${groupId}`)
            onDeleted()
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete')
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#111318] w-full md:w-[420px] md:rounded-2xl rounded-t-3xl border border-white/10 max-h-[85dvh] flex flex-col">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 flex-shrink-0">
                    <h2 className="text-white font-semibold">Group Info</h2>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
                        <X size={18} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-12">
                        <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto">
                        {/* Group header with photo */}
                        <div className="flex flex-col items-center text-center p-6 border-b border-white/5">
                            <div className="relative mb-3">
                                <img src={group?.image_url} alt=""
                                    className="w-20 h-20 rounded-2xl object-cover" />
                                {isAdmin && (
                                    <>
                                        <button
                                            onClick={() => photoRef.current.click()}
                                            disabled={uploadingPhoto}
                                            className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-xl flex items-center justify-center transition-colors shadow-lg"
                                        >
                                            {uploadingPhoto ? (
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Camera size={14} className="text-white" />
                                            )}
                                        </button>
                                        <input
                                            ref={photoRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                        />
                                    </>
                                )}
                            </div>
                            <h3 className="text-white font-bold text-lg">{group?.name}</h3>
                            {group?.description && (
                                <p className="text-gray-500 text-sm mt-1">{group.description}</p>
                            )}
                            <p className="text-gray-600 text-xs mt-2">{group?.members?.length || 0} members</p>
                            {isAdmin && (
                                <p className="text-indigo-400 text-xs mt-1">Tap the camera icon to change group photo</p>
                            )}
                        </div>

                        {/* Add member button */}
                        {isAdmin && (
                            <div className="p-4 border-b border-white/5">
                                {!showAddMember ? (
                                    <button onClick={() => setShowAddMember(true)}
                                        className="w-full flex items-center justify-center gap-2 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 py-2.5 rounded-xl text-sm font-medium transition-all">
                                        <Plus size={15} /> Add Member
                                    </button>
                                ) : (
                                    <div>
                                        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 mb-2">
                                            <Search size={14} className="text-gray-500" />
                                            <input
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                placeholder="Search people..."
                                                className="bg-transparent text-sm outline-none w-full text-white placeholder-gray-600"
                                                autoFocus
                                            />
                                            <button onClick={() => { setShowAddMember(false); setSearch('') }}>
                                                <X size={14} className="text-gray-500" />
                                            </button>
                                        </div>
                                        {searchResults.map(u => (
                                            <button key={u.id} onClick={() => addMember(u.id)}
                                                className="w-full flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg transition-all">
                                                <img src={u.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                <span className="text-sm text-white flex-1 text-left">{u.name}</span>
                                                <Plus size={14} className="text-indigo-400" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Members list */}
                        <div className="p-2">
                            <p className="text-xs text-gray-600 px-3 py-2 font-medium uppercase tracking-wider">Members</p>
                            {group?.members?.map(member => (
                                <div key={member.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl transition-all">
                                    <img src={member.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate flex items-center gap-1.5">
                                            {member.name}
                                            {member.id === user?.id && <span className="text-gray-600">(You)</span>}
                                        </p>
                                        <p className="text-xs text-gray-500">@{member.username}</p>
                                    </div>
                                    {member.role === 'owner' && (
                                        <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
                                            <Crown size={10} /> Owner
                                        </span>
                                    )}
                                    {member.role === 'admin' && (
                                        <span className="flex items-center gap-1 text-[10px] text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded-full">
                                            <Shield size={10} /> Admin
                                        </span>
                                    )}
                                    {isOwner && member.id !== user?.id && member.role === 'member' && (
                                        <button onClick={() => promoteMember(member.id)}
                                            title="Promote to admin"
                                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all">
                                            <Shield size={14} />
                                        </button>
                                    )}
                                    {isAdmin && member.id !== user?.id && member.role !== 'owner' && (
                                        <button onClick={() => removeMember(member.id)}
                                            title="Remove member"
                                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                                            <UserMinus size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-white/5 space-y-2">
                            {isOwner ? (
                                <button onClick={deleteGroup}
                                    className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 py-2.5 rounded-xl text-sm font-medium transition-all">
                                    <Trash2 size={15} /> Delete Group
                                </button>
                            ) : (
                                <button onClick={leaveGroup}
                                    className="w-full flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/20 text-red-400 py-2.5 rounded-xl text-sm font-medium transition-all">
                                    <LogOut size={15} /> Leave Group
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
