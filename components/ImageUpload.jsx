'use client'
// components/ImageUpload.jsx
import { useState, useRef, useCallback } from 'react'

export default function ImageUpload({ onUpload, onClear, uploadType = 'post', className = '' }) {
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const processFile = useCallback(async (file) => {
    if (!file) return

    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowed.includes(file.type)) {
      setError('Only JPEG, PNG, GIF, WebP allowed')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Max file size is 5 MB')
      return
    }

    setError('')

    // Show local preview immediately
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload to server
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', uploadType)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    setUploading(false)

    if (!res.ok) {
      setError(data.error || 'Upload failed')
      setPreview(null)
      return
    }

    onUpload?.(data.url)
  }, [onUpload, uploadType])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleClear = () => {
    setPreview(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
    onClear?.()
  }

  if (preview) {
    return (
      <div className={`relative rounded-xl overflow-hidden ${className}`}>
        <img src={preview} alt="Preview" className="w-full max-h-72 object-cover" />
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Uploading...
            </div>
          </div>
        )}
        {!uploading && (
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <div className="text-3xl mb-2">📷</div>
        <p className="text-sm font-medium text-gray-600">
          {dragOver ? 'Drop it!' : 'Add a photo'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Drag & drop or click · Max 5 MB</p>
      </div>

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
