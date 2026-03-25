'use client'
// components/CommentSection.jsx
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Avatar from './Avatar'
import { formatDistanceToNow } from 'date-fns'

export default function CommentSection({ postId, initialCount }) {
  const { data: session } = useSession()
  const [comments, setComments] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadComments = async () => {
    const res = await fetch(`/api/posts/${postId}/comments`)
    const data = await res.json()
    if (res.ok) {
      setComments(data.comments)
      setLoaded(true)
    }
  }

  useEffect(() => {
    loadComments()
  }, [postId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || submitting) return
    setSubmitting(true)

    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: text }),
    })

    const data = await res.json()
    setSubmitting(false)

    if (res.ok) {
      setComments((prev) => [...prev, data.comment])
      setText('')
    }
  }

  const handleDelete = async (commentId) => {
    const res = await fetch(`/api/posts/${postId}/comments?commentId=${commentId}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== commentId))
    }
  }

  return (
    <div className="px-4 pb-3 pt-2 bg-gray-50 border-t border-gray-100">
      {/* Comment list */}
      <div className="space-y-2 mb-3">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-2 group">
            <Avatar user={comment.profiles} size="sm" />
            <div className="flex-1">
              <div className="bg-white rounded-2xl px-3 py-2 inline-block max-w-full shadow-sm">
                <p className="text-xs font-semibold text-gray-900">{comment.profiles?.name}</p>
                <p className="text-sm text-gray-700 break-words">{comment.content}</p>
              </div>
              <div className="flex items-center gap-3 mt-0.5 ml-2">
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
                {session?.user?.id === comment.profiles?.id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New comment input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Avatar user={session?.user} size="sm" />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!text.trim() || submitting}
          className="text-blue-600 disabled:text-gray-300 font-semibold text-sm transition-colors"
        >
          {submitting ? '...' : 'Post'}
        </button>
      </form>
    </div>
  )
}
