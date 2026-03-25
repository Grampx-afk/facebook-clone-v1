'use client'
// components/FriendButton.jsx
import { useFriendship } from '@/lib/hooks/useFriendship'
import { useSession } from 'next-auth/react'

export default function FriendButton({ targetUserId }) {
  const { data: session } = useSession()
  const { status, loading, acting, sendRequest, acceptRequest, removeRelationship } = useFriendship(targetUserId)

  // Don't show button for yourself
  if (!session || session.user.id === targetUserId) return null

  if (loading) {
    return (
      <div className="px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-400 animate-pulse w-32">
        Loading...
      </div>
    )
  }

  if (status === 'accepted') {
    return (
      <div className="flex gap-2">
        <span className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium flex items-center gap-1">
          ✓ Friends
        </span>
        <button
          onClick={removeRelationship}
          disabled={acting}
          className="px-3 py-2 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {acting ? '...' : 'Unfriend'}
        </button>
      </div>
    )
  }

  if (status === 'pending_sent') {
    return (
      <button
        onClick={removeRelationship}
        disabled={acting}
        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
      >
        {acting ? '...' : '⏳ Request sent — Cancel'}
      </button>
    )
  }

  if (status === 'pending_received') {
    return (
      <div className="flex gap-2">
        <button
          onClick={acceptRequest}
          disabled={acting}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
        >
          {acting ? '...' : '✓ Accept request'}
        </button>
        <button
          onClick={removeRelationship}
          disabled={acting}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          Decline
        </button>
      </div>
    )
  }

  // No relationship — show Add Friend
  return (
    <button
      onClick={sendRequest}
      disabled={acting}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-1"
    >
      {acting ? '...' : '👥 Add friend'}
    </button>
  )
}
