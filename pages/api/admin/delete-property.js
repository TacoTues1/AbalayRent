import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { propertyId } = req.body || {}
  if (!propertyId) {
    return res.status(400).json({ error: 'Missing propertyId' })
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const { error } = await supabaseAdmin
      .from('properties')
      .update({ is_deleted: true })
      .eq('id', propertyId)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to delete property' })
  }
}
