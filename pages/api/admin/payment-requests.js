import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { getAdminProfile, getAuthenticatedUser } from '../../../lib/apiAuth'

const ALLOWED_FIELDS = [
  'landlord',
  'tenant',
  'property_id',
  'occupancy_id',
  'rent_amount',
  'other_bills',
  'security_deposit_amount',
  'advance_amount',
  'bills_description',
  'due_date',
  'status',
  'paid_at',
  'payment_method',
  'payment_id',
  'tenant_reference_number',
  'water_due_date',
  'electrical_due_date',
  'wifi_due_date',
  'wifi_bill',
  'other_due_date',
  'is_first_payment',
  'is_move_in_payment',
  'amount_paid',
  'is_advance_payment'
]

function pickFields(source = {}) {
  const output = {}
  for (const key of ALLOWED_FIELDS) {
    if (source[key] !== undefined) output[key] = source[key]
  }
  return output
}

async function requireAdmin(req) {
  const user = await getAuthenticatedUser(req)
  await getAdminProfile(supabaseAdmin, user.id)
  return user
}

export default async function handler(req, res) {
  if (!['POST', 'PATCH', 'DELETE'].includes(req.method)) {
    res.setHeader('Allow', 'POST, PATCH, DELETE')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client is not configured' })
  }

  try {
    await requireAdmin(req)

    if (req.method === 'POST') {
      const payload = pickFields(req.body || {})
      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: 'Missing payment fields' })
      }

      const { data, error } = await supabaseAdmin
        .from('payment_requests')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error
      return res.status(200).json({ data })
    }

    if (req.method === 'PATCH') {
      const { id } = req.body || {}
      if (!id) return res.status(400).json({ error: 'Payment id is required' })

      const payload = pickFields(req.body || {})
      delete payload.id
      if (Object.keys(payload).length === 0) {
        return res.status(400).json({ error: 'Missing fields to update' })
      }

      const { data, error } = await supabaseAdmin
        .from('payment_requests')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      return res.status(200).json({ data })
    }

    const { id } = req.body || {}
    if (!id) return res.status(400).json({ error: 'Payment id is required' })

    const { error: payoutError } = await supabaseAdmin
      .from('payouts')
      .delete()
      .eq('payment_request_id', id)

    if (payoutError) throw payoutError

    const { error: deleteError } = await supabaseAdmin
      .from('payment_requests')
      .delete()
      .eq('id', id)

    if (deleteError) throw deleteError

    return res.status(200).json({ success: true })
  } catch (error) {
    const message = error?.message || 'Request failed'
    const status = message.includes('Only admins') ? 403 : message.includes('access token') || message.includes('Unauthorized') ? 401 : 500
    return res.status(status).json({ error: message })
  }
}
