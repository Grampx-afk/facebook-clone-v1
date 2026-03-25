// app/api/friends/route.js
// GET /api/friends?userId=xxx  → accepted friends of a user
// GET /api/friends?pending=1   → incoming requests for the logged-in user

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const pending = searchParams.get('pending')

    if (pending) {
      // Incoming pending requests for logged-in user
      const session = await getServerSession(authOptions)
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

      const { data, error } = await supabaseAdmin
        .from('friendships')
        .select(`
          id, status, created_at,
          requester:profiles!friendships_requester_id_fkey (id, name, username, avatar_url)
        `)
        .eq('addressee_id', session.user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ requests: data })
    }

    if (userId) {
      // Accepted friends of a specific user
      const { data, error } = await supabaseAdmin
        .from('friendships')
        .select(`
          id,
          requester:profiles!friendships_requester_id_fkey (id, name, username, avatar_url),
          addressee:profiles!friendships_addressee_id_fkey (id, name, username, avatar_url)
        `)
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })

      // Flatten: return the "other" person in each friendship
      const friends = data.map((f) =>
        f.requester.id === userId ? f.addressee : f.requester
      )

      return NextResponse.json({ friends })
    }

    return NextResponse.json({ error: 'Missing userId or pending param' }, { status: 400 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
