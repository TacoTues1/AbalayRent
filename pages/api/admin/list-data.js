import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { table, select, filters, order } = req.body

    const allowedTables = ['properties', 'bookings', 'payment_requests', 'profiles', 'applications', 'available_time_slots', 'tenant_occupancies']
    if (!allowedTables.includes(table)) {
        return res.status(400).json({ error: 'Invalid table' })
    }

    try {
        let query = supabaseAdmin.from(table).select(select || '*')

        if (filters && Array.isArray(filters)) {
            for (const f of filters) {
                if (f.type === 'eq') query = query.eq(f.column, f.value)
                else if (f.type === 'neq') query = query.neq(f.column, f.value)
                else if (f.type === 'in') query = query.in(f.column, f.value)
                else if (f.type === 'is') query = query.is(f.column, f.value)
            }
        }

        if (order) {
            query = query.order(order.column || 'created_at', { ascending: order.ascending ?? false })
        }

        const { data, error } = await query

        if (error) {
            console.error('Admin list-data error:', error)
            return res.status(500).json({ error: error.message })
        }

        return res.status(200).json({ data })
    } catch (err) {
        console.error('Admin list-data exception:', err)
        return res.status(500).json({ error: err.message })
    }
}
