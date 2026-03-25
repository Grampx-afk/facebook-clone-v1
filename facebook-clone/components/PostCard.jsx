'use client'
// components/PostCard.jsx
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Avatar from './Avatar'
import CommentSection from './CommentSection'
import { formatDistanceToNow } from 'date-fns'

export default function PostCard({ post, onDelete }) {
  const { data: session } = useSession()

  const userLiked = post.likes?.some((l) => l.user_id === session?.user?.id)
  const [liked, setLiked] = useState(userLiked)
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0)
  const [showComments, setShowComments] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleLike = async () => {
    // Optimistic update
    setLiked((prev) => !prev)
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1))

    const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' })
    if (!res.ok) {
      // Revert on failure
      setLiked((prev) => !prev)
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1))
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return
    setDeleting(true)
    const res = await fetch(`/api/posts/${post.id}`, { method: 'DELETE' })
    if (res.ok) onDelete?.(post.id)
    else setDeleting(false)
  }

  const author = post.profiles
  const isOwner = session?.user?.id === author?.id
  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 pb-3">
        <Link href={`/profile/${author?.id}`}>
          <Avatar user={author} size="md" />
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/profile/${author?.id}`} className="font-semibold text-gray-900 hover:underline text-sm">
            {author?.name}
          </Link>
          <p className="text-xs text-gray-400">{timeAgo} · 🌍</p>
        </div>
        {isOwner && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-gray-400 hover:text-red-500 text-xs px-2 py-1 rounded hover:bg-gray-100 transition-colors"
          >
            {deleting ? '...' : '🗑 Delete'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">{post.content}</p>
      </div>

      {/* Image */}
      {post.image_url && (
        <img
          src={post.image_url}
          alt="Post image"
          className="w-full max-h-96 object-cover"
        />
      )}

      {/* Stats row */}
      {(likeCount > 0 || post.comments?.length > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-100">
          {likeCount > 0 && (
            <span className="flex items-center gap-1">
              <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px]">👍</span>
              {likeCount}
            </span>
          )}
          {post.comments?.length > 0 && (
            <button
              onClick={() => setShowComments((prev) => !prev)}
              className="ml-auto hover:underline"
            >
              {post.comments.length} comment{post.comments.length !== 1 ? 's' : ''}
            </button>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={handleLike}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 ${
            liked ? 'text-blue-600' : 'text-gray-500'
          }`}
        >
          {liked ? '👍' : '👍'} <span>{liked ? 'Liked' : 'Like'}</span>
        </button>

        <button
          onClick={() => setShowComments((prev) => !prev)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
        >
          💬 <span>Comment</span>
        </button>

        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
          ↗ <span>Share</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection postId={post.id} initialCount={post.comments?.length} />
      )}
    </div>
  )
}
