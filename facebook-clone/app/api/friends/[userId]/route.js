// app/api/friends/[userId]/route.js
// POST   → send friend request to userId
// PATCH  → accept incoming request from userId
// DELETE → decline / cancel / unfriend userId

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// Helper: find any friendship row between two users (either direction)
async function findFriendship(userA, userB) {
  const { data } = await supabaseAdmin
    .from('friendships')
    .select('*')
    .or(
      `and(requester_id.eq.${userA},addressee_id.eq.${userB}),` +
      `and(requester_id.eq.${userB},addressee_id.eq.${userA})`
    )
    .single()
  return data
}

// POST /api/friends/[userId] — send a friend request
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId: targetId } = params
    const meId = session.user.id

    if (meId === targetId) {
      return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 })
    }

    // Check if already exists
    const existing = await findFriendship(meId, targetId)
    if (existing) {
      return NextResponse.json({ error: 'Request already exists' }, { status: 409 })
    }

    const { data, error } = await supabaseAdmin
      .from('friendships')
      .insert({ requester_id: meId, addressee_id: targetId, status: 'pending' })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ friendship: data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/friends/[userId] — accept incoming request from userId
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId: requesterId } = params
    const meId = session.user.id

    const { data, error } = await supabaseAdmin
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('requester_id', requesterId)
      .eq('addressee_id', meId)
      .eq('status', 'pending')
      .select()
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json({ friendship: data })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/friends/[userId] — cancel request / decline / unfriend
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId: targetId } = params
    const meId = session.user.id

    const existing = await findFriendship(meId, targetId)
    if (!existing) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 })
    }

    await supabaseAdmin.from('friendships').delete().eq('id', existing.id)

    return NextResponse.json({ deleted: true })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
