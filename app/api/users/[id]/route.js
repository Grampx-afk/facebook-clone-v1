// app/api/users/[id]/route.js
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/users/[id]
export async function GET(request, { params }) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, name, username, avatar_url, bio, created_at')
      .eq('id', params.id)
      .single()

    if (error || !data) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    return NextResponse.json({ user: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/users/[id] — update profile
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.id !== params.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, bio, avatar_url } = await request.json()

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ name, bio, avatar_url })
      .eq('id', params.id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ user: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
