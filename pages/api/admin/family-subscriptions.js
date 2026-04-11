import { supabaseAdmin } from '../../../lib/supabaseAdmin'

const FREE_SLOTS = 1
const MAX_FAMILY_MEMBERS = 4

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { action } = req.body || {}

  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Supabase admin client is not configured' })
  }

  try {
    if (action === 'stats') {
      const tenantIds = Array.from(new Set((req.body.tenantIds || []).filter(Boolean)))
      if (!tenantIds.length) {
        return res.status(200).json({ stats: {} })
      }

      const { data: subscriptions, error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .select('tenant_id, plan_type, total_slots, paid_slots, status')
        .in('tenant_id', tenantIds)

      if (subscriptionError) {
        return res.status(500).json({ error: subscriptionError.message })
      }

      const { data: occupancies, error: occupancyError } = await supabaseAdmin
        .from('tenant_occupancies')
        .select('id, tenant_id, created_at')
        .in('tenant_id', tenantIds)
        .in('status', ['active', 'pending_end'])
        .order('created_at', { ascending: false })

      if (occupancyError) {
        return res.status(500).json({ error: occupancyError.message })
      }

      const latestOccupancyByTenant = {}
      for (const occ of occupancies || []) {
        if (!latestOccupancyByTenant[occ.tenant_id]) {
          latestOccupancyByTenant[occ.tenant_id] = occ.id
        }
      }

      const parentOccIds = Object.values(latestOccupancyByTenant)
      let familyMembers = []
      if (parentOccIds.length) {
        const { data: familyData, error: familyError } = await supabaseAdmin
          .from('family_members')
          .select('id, parent_occupancy_id')
          .in('parent_occupancy_id', parentOccIds)

        if (familyError) {
          return res.status(500).json({ error: familyError.message })
        }
        familyMembers = familyData || []
      }

      const usedByParentOcc = {}
      for (const member of familyMembers) {
        usedByParentOcc[member.parent_occupancy_id] = (usedByParentOcc[member.parent_occupancy_id] || 0) + 1
      }

      const subscriptionByTenant = Object.fromEntries((subscriptions || []).map((s) => [s.tenant_id, s]))

      const stats = {}
      for (const tenantId of tenantIds) {
        const subscription = subscriptionByTenant[tenantId] || null
        const parentOccId = latestOccupancyByTenant[tenantId]
        const usedSlots = parentOccId ? (usedByParentOcc[parentOccId] || 0) : 0
        const totalSlots = subscription?.total_slots || FREE_SLOTS
        stats[tenantId] = {
          has_subscription: !!subscription,
          plan_type: subscription?.plan_type || 'free',
          status: subscription?.status || 'active',
          total_slots: totalSlots,
          paid_slots: subscription?.paid_slots || 0,
          used_slots: usedSlots,
          available_slots: Math.max(0, totalSlots - usedSlots),
          max_slots: MAX_FAMILY_MEMBERS
        }
      }

      return res.status(200).json({ stats })
    }

    if (action === 'add-slot') {
      const { tenantId } = req.body || {}
      if (!tenantId) {
        return res.status(400).json({ error: 'tenantId is required' })
      }

      let { data: subscription, error: subscriptionError } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle()

      if (subscriptionError) {
        return res.status(500).json({ error: subscriptionError.message })
      }

      if (!subscription) {
        const { data: createdSubscription, error: createError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            tenant_id: tenantId,
            plan_type: 'free',
            total_slots: FREE_SLOTS,
            paid_slots: 0,
            status: 'active'
          })
          .select()
          .single()

        if (createError) {
          return res.status(500).json({ error: createError.message })
        }

        subscription = createdSubscription
      }

      if ((subscription.total_slots || FREE_SLOTS) >= MAX_FAMILY_MEMBERS) {
        return res.status(400).json({ error: `Maximum ${MAX_FAMILY_MEMBERS} slots reached` })
      }

      const updatedTotalSlots = Math.min(MAX_FAMILY_MEMBERS, (subscription.total_slots || FREE_SLOTS) + 1)
      const updatedPaidSlots = (subscription.paid_slots || 0) + 1

      const { data: updatedSubscription, error: updateError } = await supabaseAdmin
        .from('subscriptions')
        .update({
          total_slots: updatedTotalSlots,
          paid_slots: updatedPaidSlots,
          plan_type: updatedPaidSlots > 0 ? 'paid' : 'free',
          status: 'active'
        })
        .eq('id', subscription.id)
        .select()
        .single()

      if (updateError) {
        return res.status(500).json({ error: updateError.message })
      }

      return res.status(200).json({
        success: true,
        subscription: updatedSubscription,
        message: `Family slot added. Total slots: ${updatedTotalSlots}`
      })
    }

    return res.status(400).json({ error: 'Invalid action' })
  } catch (error) {
    console.error('admin/family-subscriptions error:', error)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}
