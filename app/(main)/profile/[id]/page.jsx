'use client'
// app/(main)/profile/[id]/page.jsx  (v2 — with FriendButton + avatar upload)
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import Avatar from '@/components/Avatar'
import PostCard from '@/components/PostCard'
import PostComposer from '@/components/PostComposer'
import FriendButton from '@/components/FriendButton'
import ImageUpload from '@/components/ImageUpload'

export default function ProfilePage() {
  const { id } = useParams()
  const { data: session, update: updateSession } = useSession()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', bio: '' })
  const [newAvatarUrl, setNewAvatarUrl] = useState(null)
  const [saving, setSaving] = useState(false)

  const isOwner = session?.user?.id === id

  useEffect(() => {
    const fetchAll = async () => {
      const [userRes, postsRes, friendsRes] = await Promise.all([
        fetch(`/api/users/${id}`),
        fetch(`/api/posts?userId=${id}`),
        fetch(`/api/friends?userId=${id}`),
      ])
      const [userData, postsData, friendsData] = await Promise.all([
        userRes.json(), postsRes.json(), friendsRes.json(),
      ])
      if (userRes.ok) {
        setUser(userData.user)
        setEditForm({ name: userData.user.name, bio: userData.user.bio || '' })
      }
      if (postsRes.ok) setPosts(postsData.posts)
      if (friendsRes.ok) setFriends(friendsData.friends)
      setLoading(false)
    }
    fetchAll()
  }, [id])

  const handleSaveProfile = async () => {
    setSaving(true)
    const body = { name: editForm.name, bio: editForm.bio }
    if (newAvatarUrl) body.avatar_url = newAvatarUrl

    const res = await fetch(`/api/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      setUser(data.user)
      setEditing(false)
      setNewAvatarUrl(null)
      // Refresh session so navbar avatar updates
      await updateSession({ ...session, user: { ...session.user, ...body } })
    }
  }

  const handlePostCreated = (newPost) => setPosts((prev) => [newPost, ...prev])
  const handlePostDeleted = (postId) => setPosts((prev) => prev.filter((p) => p.id !== postId))

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 animate-pulse">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
          <div className="h-32 bg-gray-200" />
          <div className="px-6 pb-5 -mt-10 flex gap-4">
            <div className="w-20 h-20 bg-gray-300 rounded-full ring-4 ring-white" />
            <div className="pt-12 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-40" />
              <div className="h-3 bg-gray-100 rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-6xl mb-4">👤</p>
        <h2 className="text-xl font-semibold text-gray-700">User not found</h2>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Profile card */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500" />

        <div className="px-6 pb-5">
          {/* Avatar row */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="relative">
              <div className="w-24 h-24 ring-4 ring-white rounded-full overflow-hidden bg-white">
                <Avatar user={newAvatarUrl ? { ...user, avatar_url: newAvatarUrl } : user} size="lg" />
              </div>
              {editing && (
                <label className="absolute bottom-0 right-0 w-7 h-7 bg-gray-700 hover:bg-gray-900 text-white rounded-full flex items-center justify-center cursor-pointer text-sm transition-colors">
                  ✏️
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (!file) return
                      const fd = new FormData()
                      fd.append('file', file)
                      fd.append('type', 'avatar')
                      const res = await fetch('/api/upload', { method: 'POST', body: fd })
                      const data = await res.json()
                      if (res.ok) setNewAvatarUrl(data.url)
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex gap-2 mt-14">
              {isOwner ? (
                <button
                  onClick={() => setEditing((p) => !p)}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                >
                  {editing ? '✕ Cancel' : '✏️ Edit profile'}
                </button>
              ) : (
                <FriendButton targetUserId={id} />
              )}
            </div>
          </div>

          {/* Name / bio / edit form */}
          {editing ? (
            <div className="space-y-3">
              <input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Write something about yourself..."
                rows={3}
                maxLength={200}
              />
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          ) : (
            <div>
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-sm text-gray-400">@{user.username}</p>
              {user.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{user.bio}</p>}
              <p className="text-xs text-gray-400 mt-2">
                📅 Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex border-t border-gray-100 divide-x divide-gray-100">
          <div className="flex-1 py-3 text-center">
            <p className="text-lg font-bold text-gray-900">{posts.length}</p>
            <p className="text-xs text-gray-400">Posts</p>
          </div>
          <div className="flex-1 py-3 text-center">
            <p className="text-lg font-bold text-gray-900">{friends.length}</p>
            <p className="text-xs text-gray-400">Friends</p>
          </div>
        </div>
      </div>

      {/* Friends preview strip */}
      {friends.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Friends</h2>
            <span className="text-sm text-gray-400">{friends.length}</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {friends.slice(0, 6).map((f) => (
              <a key={f.id} href={`/profile/${f.id}`} className="flex flex-col items-center gap-1 text-center group">
                <div className="w-14 h-14 rounded-xl overflow-hidden group-hover:opacity-90 transition-opacity">
                  <Avatar user={f} size="lg" />
                </div>
                <p className="text-xs font-medium text-gray-700 truncate w-full px-1">{f.name}</p>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Composer (own profile only) */}
      {isOwner && <PostComposer onPostCreated={handlePostCreated} />}

      {/* Posts */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-gray-700">No posts yet</p>
          {isOwner && <p className="text-sm text-gray-400 mt-1">Share your first post above!</p>}
        </div>
      ) : (
        posts.map((post) => (
          <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
        ))
      )}
    </div>
  )
}
