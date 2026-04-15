import { supabaseAdmin } from '../../lib/supabaseAdmin'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization' })
  }

  const token = authHeader.replace('Bearer ', '')
  const {
    data: { user },
    error: authError
  } = await supabaseAdmin.auth.getUser(token)

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const userId = user.id
  const { action } = req.body

  if (action !== 'send') {
    return res.status(400).json({ error: 'Invalid action' })
  }

  const { conversation_id, message, files } = req.body
  const trimmedMessage = (message || '').trim()
  const safeFiles = Array.isArray(files) ? files.filter(file => file?.url) : []

  if (!conversation_id) {
    return res.status(400).json({ error: 'conversation_id is required' })
  }

  if (!trimmedMessage && safeFiles.length === 0) {
    return res.status(400).json({ error: 'Message or file is required' })
  }

  try {
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from('conversations')
      .select('id, landlord_id, tenant_id')
      .eq('id', conversation_id)
      .maybeSingle()

    if (conversationError) throw conversationError
    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' })
    }

    const isLandlord = conversation.landlord_id === userId
    const isTenant = conversation.tenant_id === userId

    if (!isLandlord && !isTenant) {
      return res.status(403).json({ error: 'You are not part of this conversation' })
    }

    const receiverId = isLandlord ? conversation.tenant_id : conversation.landlord_id

    const inserts = safeFiles.length > 0
      ? safeFiles.map((file, index) => ({
          conversation_id,
          sender_id: userId,
          receiver_id: receiverId,
          message: index === 0 ? trimmedMessage : '',
          file_url: file.url,
          file_name: file.name || null,
          file_type: file.type || null,
          file_size: file.size || null
        }))
      : [
          {
            conversation_id,
            sender_id: userId,
            receiver_id: receiverId,
            message: trimmedMessage,
            file_url: null,
            file_name: null,
            file_type: null,
            file_size: null
          }
        ]

    const { error: insertError } = await supabaseAdmin
      .from('messages')
      .insert(inserts)

    if (insertError) throw insertError

    await supabaseAdmin
      .from('conversations')
      .update({
        updated_at: new Date().toISOString(),
        hidden_by_landlord: false,
        hidden_by_tenant: false
      })
      .eq('id', conversation_id)

    return res.status(200).json({ success: true, sent: inserts.length })
  } catch (err) {
    console.error('Error sending direct message:', err)
    return res.status(500).json({ error: 'Failed to send direct message' })
  }
}
