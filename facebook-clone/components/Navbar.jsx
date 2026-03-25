'use client'
// components/Navbar.jsx  (v2 — with Friends link + request badge)
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Avatar from './Avatar'

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [pendingCount, setPendingCount] = useState(0)

  // Poll for pending friend requests every 30s
  useEffect(() => {
    if (!session?.user?.id) return
    const fetch_pending = async () => {
      const res = await fetch('/api/friends?pending=1')
      const data = await res.json()
      if (res.ok) setPendingCount(data.requests?.length || 0)
    }
    fetch_pending()
    const interval = setInterval(fetch_pending, 30000)
    return () => clearInterval(interval)
  }, [session?.user?.id])

  const navLinks = [
    { href: '/', label: '🏠', title: 'Home' },
    { href: '/friends', label: '👥', title: 'Friends', badge: pendingCount },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm h-14 flex items-center px-4">
      <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-3xl font-bold text-blue-600 tracking-tight">
          facebook
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              title={link.title}
              className={`relative px-5 py-2 rounded-lg text-xl transition-colors ${
                pathname === link.href
                  ? 'text-blue-600 border-b-2 border-blue-600 rounded-none'
                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'
              }`}
            >
              {link.label}
              {link.badge > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {link.badge > 9 ? '9+' : link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Right: avatar + logout */}
        <div className="flex items-center gap-2">
          <Link
            href={session?.user?.id ? `/profile/${session.user.id}` : '#'}
            className="flex items-center gap-2 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Avatar user={session?.user} size="sm" />
            <span className="text-sm font-medium text-gray-700 hidden sm:block">
              {session?.user?.name?.split(' ')[0]}
            </span>
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-2 rounded-lg hover:bg-gray-100"
            title="Log out"
          >
            ⏻
          </button>
        </div>
      </div>
    </nav>
  )
}
