// app/api/friends/status/route.js
// GET /api/friends/status?targetId=xxx
// Returns the relationship between logged-in user and targetId

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ status: null })

    const { searchParams } = new URL(request.url)
    const targetId = searchParams.get('targetId')
    const meId = session.user.id

    if (!targetId || meId === targetId) {
      return NextResponse.json({ status: null })
    }

    const { data } = await supabaseAdmin
      .from('friendships')
      .select('*')
      .or(
        `and(requester_id.eq.${meId},addressee_id.eq.${targetId}),` +
        `and(requester_id.eq.${targetId},addressee_id.eq.${meId})`
      )
      .single()

    if (!data) return NextResponse.json({ status: null })

    if (data.status === 'accepted') {
      return NextResponse.json({ status: 'accepted' })
    }

    // pending — determine direction
    if (data.requester_id === meId) {
      return NextResponse.json({ status: 'pending_sent' })
    } else {
      return NextResponse.json({ status: 'pending_received' })
    }
  } catch {
    return NextResponse.json({ status: null })
  }
}
