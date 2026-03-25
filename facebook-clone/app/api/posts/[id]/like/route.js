// app/api/posts/[id]/like/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// POST /api/posts/[id]/like — toggle like on/off
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id: postId } = params
    const userId = session.user.id

    // Check if already liked
    const { data: existing } = await supabaseAdmin
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single()

    if (existing) {
      // Unlike
      await supabaseAdmin.from('likes').delete().eq('id', existing.id)
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await supabaseAdmin.from('likes').insert({ user_id: userId, post_id: postId })
      return NextResponse.json({ liked: true })
    }
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
