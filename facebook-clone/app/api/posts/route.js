// app/api/posts/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/posts — fetch feed (all posts, newest first)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')  // optional: filter by user
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabaseAdmin
      .from('posts')
      .select(`
        id, content, image_url, created_at,
        profiles!posts_user_id_fkey (id, name, username, avatar_url),
        likes (id, user_id),
        comments (id)
      `)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ posts: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/posts — create a new post
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { content, image_url } = await request.json()

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Post too long (max 2000 chars)' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('posts')
      .insert({ user_id: session.user.id, content: content.trim(), image_url })
      .select(`
        id, content, image_url, created_at,
        profiles!posts_user_id_fkey (id, name, username, avatar_url)
      `)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Return post with empty likes/comments arrays
    return NextResponse.json({ post: { ...data, likes: [], comments: [] } }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
