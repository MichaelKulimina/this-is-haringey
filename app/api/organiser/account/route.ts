import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { z } from 'zod'

const UpdateAccountSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  organisation_name: z.string().nullable().optional(),
  email: z.string().email('Please enter a valid email address'),
})

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.app_metadata?.role === 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = UpdateAccountSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const db = createServiceClient()

  const { error } = await db
    .from('organisers')
    .update({
      full_name: parsed.data.full_name,
      organisation_name: parsed.data.organisation_name ?? null,
      email: parsed.data.email,
    })
    .eq('id', user.id)

  if (error) {
    console.error('[organiser/account PUT]', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }

  // If email changed, update auth user email via admin API
  if (parsed.data.email !== user.email) {
    const { error: authError } = await supabase.auth.updateUser({ email: parsed.data.email })
    if (authError) {
      console.error('[organiser/account PUT] auth email update failed:', authError)
      // Non-fatal — profile updated, auth email may lag
    }
  }

  return NextResponse.json({ success: true })
}
