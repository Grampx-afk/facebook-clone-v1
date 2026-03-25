'use client'
// app/(main)/friends/page.jsx
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

function FriendCard({ user, onAction, actionLabel, actionStyle }) {
  const [acting, setActing] = useState(false)

  const handleAction = async () => {
    setActing(true)
    await onAction()
    setActing(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
      <Link href={`/profile/${user.id}`}>
        <div className="h-20 bg-gradient-to-br from-blue-400 to-blue-600" />
        <div className="px-4 pt-0 pb-3 -mt-8">
          <div className="w-14 h-14 ring-3 ring-white rounded-full overflow-hidden mb-2">
            <Avatar user={user} size="lg" />
          </div>
          <p className="font-semibold text-gray-900 text-sm leading-tight">{user.name}</p>
          <p className="text-xs text-gray-400">@{user.username}</p>
        </div>
      </Link>
      {onAction && (
        <div className="px-4 pb-4">
          <button
            onClick={handleAction}
            disabled={acting}
            className={`w-full py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 ${actionStyle}`}
          >
            {acting ? '...' : actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export default function FriendsPage() {
  const { data: session } = useSession()
  const [tab, setTab] = useState('friends') // 'friends' | 'requests'
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFriends = async () => {
    const res = await fetch(`/api/friends?userId=${session?.user?.id}`)
    const data = await res.json()
    if (res.ok) setFriends(data.friends)
  }

  const fetchRequests = async () => {
    const res = await fetch('/api/friends?pending=1')
    const data = await res.json()
    if (res.ok) setRequests(data.requests)
  }

  useEffect(() => {
    if (!session?.user?.id) return
    setLoading(true)
    Promise.all([fetchFriends(), fetchRequests()]).finally(() => setLoading(false))
  }, [session?.user?.id])

  const handleAccept = async (requesterId) => {
    const res = await fetch(`/api/friends/${requesterId}`, { method: 'PATCH' })
    if (res.ok) {
      setRequests((prev) => prev.filter((r) => r.requester.id !== requesterId))
      fetchFriends()
    }
  }

  const handleDecline = async (requesterId) => {
    const res = await fetch(`/api/friends/${requesterId}`, { method: 'DELETE' })
    if (res.ok) setRequests((prev) => prev.filter((r) => r.requester.id !== requesterId))
  }

  const handleUnfriend = async (friendId) => {
    const res = await fetch(`/api/friends/${friendId}`, { method: 'DELETE' })
    if (res.ok) setFriends((prev) => prev.filter((f) => f.id !== friendId))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setTab('friends')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === 'friends' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            My Friends {friends.length > 0 && `(${friends.length})`}
          </button>
          <button
            onClick={() => setTab('requests')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
              tab === 'requests' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
            }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
              <div className="h-20 bg-gray-200" />
              <div className="p-4 space-y-2">
                <div className="w-14 h-14 bg-gray-200 rounded-full -mt-8 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-24" />
                <div className="h-3 bg-gray-200 rounded w-16" />
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'friends' ? (
        friends.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">👥</p>
            <p className="font-semibold text-gray-700 text-lg">No friends yet</p>
            <p className="text-gray-400 text-sm mt-1">Visit someone's profile and add them as a friend!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {friends.map((friend) => (
              <FriendCard
                key={friend.id}
                user={friend}
                onAction={() => handleUnfriend(friend.id)}
                actionLabel="Unfriend"
                actionStyle="bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-700"
              />
            ))}
          </div>
        )
      ) : (
        requests.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📭</p>
            <p className="font-semibold text-gray-700 text-lg">No pending requests</p>
            <p className="text-gray-400 text-sm mt-1">When someone adds you, you'll see them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                <Link href={`/profile/${req.requester.id}`}>
                  <div className="h-20 bg-gradient-to-br from-purple-400 to-purple-600" />
                  <div className="px-4 pt-0 pb-3 -mt-8">
                    <div className="w-14 h-14 ring-3 ring-white rounded-full overflow-hidden mb-2">
                      <Avatar user={req.requester} size="lg" />
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{req.requester.name}</p>
                    <p className="text-xs text-gray-400">@{req.requester.username}</p>
                  </div>
                </Link>
                <div className="px-4 pb-4 flex flex-col gap-2">
                  <button
                    onClick={() => handleAccept(req.requester.id)}
                    className="w-full py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => handleDecline(req.requester.id)}
                    className="w-full py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
