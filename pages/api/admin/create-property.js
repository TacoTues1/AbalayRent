import { createClient } from '@supabase/supabase-js'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

const ALLOWED_PROPERTY_FIELDS = [
  'title',
  'description',
  'building_no',
  'street',
  'address',
  'city',
  'state_province',
  'country',
  'zip',
  'location_link',
  'owner_phone',
  'owner_email',
  'price',
  'utilities_cost',
  'internet_cost',
  'association_dues',
  'bedrooms',
  'bathrooms',
  'area_sqft',
  'available',
  'status',
  'property_type',
  'bed_type',
  'max_occupancy',
  'terms_conditions',
  'amenities',
  'has_security_deposit',
  'security_deposit_amount',
  'has_advance',
  'advance_amount',
  'landlord',
  'images'
]

function pickAllowedFields(payload = {}) {
  const clean = {}
  for (const key of ALLOWED_PROPERTY_FIELDS) {
    if (payload[key] !== undefined) {
      clean[key] = payload[key]
    }
  }
  return clean
}

async function getAuthenticatedUser(accessToken) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    throw new Error('Supabase public client is not configured')
  }

  const publicClient = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  const { data, error } = await publicClient.auth.getUser(accessToken)
  if (error || !data?.user) {
    throw new Error('Unauthorized request')
  }

  return data.user
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client is not configured' })
  }

  try {
    const { accessToken, payload } = req.body || {}

    if (!accessToken) {
      return res.status(401).json({ error: 'Missing access token' })
    }

    const cleanPayload = pickAllowedFields(payload || {})

    if (!cleanPayload.title || !cleanPayload.street || !cleanPayload.address || !cleanPayload.city || !cleanPayload.country || !cleanPayload.state_province) {
      return res.status(400).json({ error: 'Missing required property fields' })
    }

    const authUser = await getAuthenticatedUser(accessToken)

    const { data: adminProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, role')
      .eq('id', authUser.id)
      .maybeSingle()

    if (profileError) {
      throw new Error(`Failed loading admin profile: ${profileError.message}`)
    }

    if (!adminProfile || adminProfile.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can use this endpoint' })
    }

    const { data, error } = await supabaseAdmin
      .from('properties')
      .insert(cleanPayload)
      .select('id')
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, propertyId: data?.id || null })
  } catch (error) {
    console.error('Admin create-property error:', error)
    return res.status(500).json({ error: error.message || 'Failed to create property' })
  }
}
