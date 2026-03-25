'use client'
// app/(main)/page.jsx
import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import PostComposer from '@/components/PostComposer'
import PostCard from '@/components/PostCard'
import Avatar from '@/components/Avatar'
import Link from 'next/link'

export default function HomePage() {
  const { data: session } = useSession()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const fetchPosts = useCallback(async (pageNum = 1, replace = false) => {
    setLoading(true)
    const res = await fetch(`/api/posts?page=${pageNum}`)
    const data = await res.json()
    setLoading(false)

    if (res.ok) {
      if (data.posts.length < 10) setHasMore(false)
      setPosts((prev) => replace ? data.posts : [...prev, ...data.posts])
    }
  }, [])

  useEffect(() => {
    fetchPosts(1, true)
  }, [fetchPosts])

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev])
  }

  const handlePostDeleted = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchPosts(nextPage)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-[240px_1fr_220px] gap-4">

      {/* Left sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-16 space-y-1">
          <Link
            href={`/profile/${session?.user?.id}`}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-sm font-medium text-gray-700"
          >
            <Avatar user={session?.user} size="sm" />
            {session?.user?.name}
          </Link>
          {[
            { icon: '👥', label: 'Friends', href: '#' },
            { icon: '📷', label: 'Photos', href: '#' },
            { icon: '🎬', label: 'Videos', href: '#' },
            { icon: '🔖', label: 'Saved', href: '#' },
            { icon: '🗓', label: 'Events', href: '#' },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white hover:shadow-sm transition-all text-sm font-medium text-gray-700"
            >
              <span className="text-lg w-8 text-center">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </div>
      </aside>

      {/* Feed */}
      <div className="space-y-4 min-w-0">
        <PostComposer onPostCreated={handlePostCreated} />

        {loading && posts.length === 0 ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                <div className="flex gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-32" />
                    <div className="h-2 bg-gray-100 rounded w-20" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded" />
                  <div className="h-3 bg-gray-100 rounded w-4/5" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
            <p className="text-4xl mb-3">✍️</p>
            <p className="font-semibold text-gray-700">No posts yet</p>
            <p className="text-sm text-gray-400 mt-1">Be the first to share something!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onDelete={handlePostDeleted} />
            ))}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-3 bg-white rounded-xl border border-gray-200 text-sm font-medium text-blue-600 hover:bg-gray-50 transition-colors"
              >
                {loading ? 'Loading...' : 'Load more posts'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Right sidebar */}
      <aside className="hidden lg:block">
        <div className="sticky top-16">
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3 px-1">
            Contacts
          </p>
          <p className="text-sm text-gray-400 px-1">
            Friend system coming soon — focus on posting for now!
          </p>
        </div>
      </aside>
    </div>
  )
}
