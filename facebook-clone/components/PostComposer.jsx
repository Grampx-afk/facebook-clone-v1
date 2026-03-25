'use client'
// components/PostComposer.jsx  (v2 — with image upload)
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Avatar from './Avatar'
import ImageUpload from './ImageUpload'

export default function PostComposer({ onPostCreated }) {
  const { data: session } = useSession()
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!content.trim() && !imageUrl) return
    setLoading(true)
    setError('')

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, image_url: imageUrl }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to create post')
      return
    }

    setContent('')
    setImageUrl(null)
    setShowImageUpload(false)
    setOpen(false)
    onPostCreated?.(data.post)
  }

  const handleCancel = () => {
    setOpen(false)
    setContent('')
    setImageUrl(null)
    setShowImageUpload(false)
    setError('')
  }

  const charCount = content.length
  const maxChars = 2000
  const canPost = (content.trim() || imageUrl) && !loading

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center gap-3">
        <Avatar user={session?.user} size="md" />
        <button
          onClick={() => setOpen(true)}
          className="flex-1 text-left bg-gray-100 hover:bg-gray-200 transition-colors rounded-full px-4 py-2.5 text-gray-500 text-sm"
        >
          What's on your mind, {session?.user?.name?.split(' ')[0]}?
        </button>
      </div>

      {open && (
        <div className="mt-4">
          <textarea
            autoFocus
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind, ${session?.user?.name?.split(' ')[0]}?`}
            className="w-full border-0 outline-none resize-none text-gray-800 text-lg placeholder-gray-400 min-h-[80px]"
            maxLength={maxChars}
          />

          {showImageUpload && (
            <ImageUpload
              uploadType="post"
              onUpload={(url) => setImageUrl(url)}
              onClear={() => setImageUrl(null)}
              className="mt-2 mb-2"
            />
          )}

          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

          <div className="flex items-center justify-between border border-gray-200 rounded-xl px-3 py-2 mb-3">
            <span className="text-sm font-medium text-gray-600">Add to post</span>
            <div className="flex gap-1">
              <button
                onClick={() => setShowImageUpload((p) => !p)}
                className={`p-2 rounded-lg text-lg transition-colors ${
                  showImageUpload ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100 text-gray-500'
                }`}
                title="Add photo"
              >
                📷
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-lg" title="Tag feeling">😊</button>
              <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-lg" title="Add location">📍</button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className={`text-xs ${charCount > maxChars * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
              {charCount}/{maxChars}
            </span>
            <div className="flex gap-2">
              <button onClick={handleCancel} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canPost}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!open && (
        <div className="flex items-center justify-around mt-3 pt-3 border-t border-gray-100">
          <button onClick={() => { setOpen(true); setShowImageUpload(true) }} className="flex items-center gap-2 text-sm text-gray-600 font-medium hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
            📷 <span>Photo</span>
          </button>
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-sm text-gray-600 font-medium hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
            😊 <span>Feeling</span>
          </button>
          <button onClick={() => setOpen(true)} className="flex items-center gap-2 text-sm text-gray-600 font-medium hover:bg-gray-100 px-4 py-2 rounded-lg transition-colors">
            📍 <span>Location</span>
          </button>
        </div>
      )}
    </div>
  )
}
