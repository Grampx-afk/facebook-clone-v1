// lib/hooks/useFriendship.js
'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

// Returns friendship state + actions between logged-in user and targetUserId
export function useFriendship(targetUserId) {
  const { data: session } = useSession()
  const [status, setStatus] = useState(null)
  // null = no relationship
  // 'pending_sent'     = I sent a request, waiting
  // 'pending_received' = they sent a request, I can accept
  // 'accepted'         = we are friends
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  const fetchStatus = useCallback(async () => {
    if (!session?.user?.id || !targetUserId || session.user.id === targetUserId) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      // Fetch all friendships involving current user with this target
      const res = await fetch(`/api/friends/status?targetId=${targetUserId}`)
      const data = await res.json()
      setStatus(data.status || null)
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id, targetUserId])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  const sendRequest = async () => {
    setActing(true)
    const res = await fetch(`/api/friends/${targetUserId}`, { method: 'POST' })
    if (res.ok) setStatus('pending_sent')
    setActing(false)
  }

  const acceptRequest = async () => {
    setActing(true)
    const res = await fetch(`/api/friends/${targetUserId}`, { method: 'PATCH' })
    if (res.ok) setStatus('accepted')
    setActing(false)
  }

  const removeRelationship = async () => {
    setActing(true)
    const res = await fetch(`/api/friends/${targetUserId}`, { method: 'DELETE' })
    if (res.ok) setStatus(null)
    setActing(false)
  }

  return { status, loading, acting, sendRequest, acceptRequest, removeRelationship, refetch: fetchStatus }
}
