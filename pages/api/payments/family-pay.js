import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const {
        memberId,        // The family member's user ID
        paymentRequestId,
        status,
        paymentMethod,
        proofUrl,
        referenceNumber,
        advanceAmount,
        amountPaid,
        paidAt
    } = req.body

    if (!memberId || !paymentRequestId) {
        return res.status(400).json({ error: 'memberId and paymentRequestId required' })
    }

    // 1. Verify the user is actually a family member
    const { data: fmRecord, error: fmErr } = await supabaseAdmin
        .from('family_members')
        .select('parent_occupancy_id')
        .eq('member_id', memberId)
        .maybeSingle()

    if (fmErr) return res.status(500).json({ error: fmErr.message })
    if (!fmRecord) return res.status(403).json({ error: 'User is not a family member' })

    // 2. Get the parent occupancy to verify the payment request belongs to this family
    const { data: parentOcc } = await supabaseAdmin
        .from('tenant_occupancies')
        .select('id, tenant_id, property_id')
        .eq('id', fmRecord.parent_occupancy_id)
        .maybeSingle()

    if (!parentOcc) return res.status(404).json({ error: 'Parent occupancy not found' })

    // 3. Verify the payment request belongs to this family's primary tenant
    const { data: paymentRequest } = await supabaseAdmin
        .from('payment_requests')
        .select('id, tenant, landlord, occupancy_id')
        .eq('id', paymentRequestId)
        .maybeSingle()

    if (!paymentRequest) return res.status(404).json({ error: 'Payment request not found' })
    if (paymentRequest.tenant !== parentOcc.tenant_id) {
        return res.status(403).json({ error: 'Payment request does not belong to this family' })
    }

    // 4. Update the payment request
    const updateData = {}
    if (status) updateData.status = status
    if (paymentMethod) updateData.payment_method = paymentMethod
    if (proofUrl !== undefined) updateData.tenant_proof_url = proofUrl
    if (referenceNumber !== undefined) updateData.tenant_reference_number = referenceNumber || null
    if (advanceAmount !== undefined) updateData.advance_amount = advanceAmount
    if (amountPaid !== undefined) updateData.amount_paid = amountPaid
    if (paidAt) updateData.paid_at = paidAt

    const { error: updateErr } = await supabaseAdmin
        .from('payment_requests')
        .update(updateData)
        .eq('id', paymentRequestId)

    if (updateErr) return res.status(500).json({ error: updateErr.message })

    return res.status(200).json({ success: true })
}
