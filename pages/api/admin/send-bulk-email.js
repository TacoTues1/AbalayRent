import { sendNotificationEmail } from '../../../lib/email'

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function buildEmailHtml(subject, body) {
  const safeSubject = escapeHtml(subject)
  const safeBody = escapeHtml(body).replace(/\n/g, '<br />')

  return `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 40px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td align="center">
              <div style="background-color: #ffffff; max-width: 640px; width: 100%; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background-color: #1f2937; height: 6px;"></div>
                <div style="padding: 32px;">
                  <h1 style="margin: 0 0 16px; color: #111827; font-size: 24px;">${safeSubject}</h1>
                  <div style="font-size: 15px; line-height: 1.8; color: #374151; white-space: normal;">${safeBody}</div>
                  <p style="font-size: 12px; color: #9ca3af; margin-top: 28px;">This message was sent by the Abalay Admin.</p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  const { emails, subject, body } = req.body || {}

  if (!Array.isArray(emails) || emails.length === 0) {
    return res.status(400).json({ success: false, error: 'At least one recipient email is required' })
  }

  const uniqueEmails = Array.from(new Set(emails.map((e) => String(e || '').trim().toLowerCase()).filter(Boolean)))

  if (uniqueEmails.length > 200) {
    return res.status(400).json({ success: false, error: 'Maximum 200 recipients per send' })
  }

  const invalidEmails = uniqueEmails.filter((email) => !isValidEmail(email))
  if (invalidEmails.length > 0) {
    return res.status(400).json({ success: false, error: 'Invalid email address detected', invalidEmails })
  }

  if (!subject || !String(subject).trim()) {
    return res.status(400).json({ success: false, error: 'Subject is required' })
  }

  if (!body || !String(body).trim()) {
    return res.status(400).json({ success: false, error: 'Body is required' })
  }

  const trimmedSubject = String(subject).trim()
  const trimmedBody = String(body).trim()
  const htmlContent = buildEmailHtml(trimmedSubject, trimmedBody)

  let sent = 0
  const failed = []

  for (const email of uniqueEmails) {
    try {
      const result = await sendNotificationEmail({
        to: email,
        subject: trimmedSubject,
        message: htmlContent
      })

      if (result.success) {
        sent += 1
      } else {
        failed.push({ email, error: result.error?.message || String(result.error || 'Send failed') })
      }
    } catch (err) {
      failed.push({ email, error: err.message || 'Send failed' })
    }
  }

  return res.status(200).json({
    success: true,
    attempted: uniqueEmails.length,
    sent,
    failed
  })
}
