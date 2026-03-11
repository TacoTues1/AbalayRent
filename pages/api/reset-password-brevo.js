import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    // 1. Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase credentials for Admin API');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 2. Generate Recovery Link via Admin API (Bypasses email rate limits)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://abalay.vercel.app'}/updatePassword`
      }
    });

    if (linkError) {
      console.error('Failed to generate recovery link:', linkError);
      return res.status(500).json({ error: 'Failed to generate reset link' });
    }

    const { properties: { action_link: recoveryLink } } = linkData;

    // 3. Send the link via Brevo
    let brevo;
    try {
      brevo = await import('@getbrevo/brevo');
    } catch (impErr) {
      console.error('Brevo SDK import failed:', impErr);
      return res.status(500).json({ error: 'Email service not available' });
    }

    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.sender = { name: 'Abalay', email: 'alfnzperez@gmail.com' }; // Ensure this matches a verified sender in Brevo
    sendSmtpEmail.to = [{ email: normalizedEmail }];
    sendSmtpEmail.subject = 'Abalay - Reset Your Password';
    sendSmtpEmail.htmlContent = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1a1a1a; font-size: 24px; margin: 0;">Abalay</h1>
          <p style="color: #666; margin-top: 5px;">Password Reset Request</p>
        </div>
        <div style="background: #f8f8f8; border-radius: 16px; padding: 30px; text-align: center;">
          <p style="color: #333; font-size: 16px; margin: 0 0 20px;">You requested to reset your password. Click the button below to set a new password:</p>
          <a href="${recoveryLink}" style="background: #1a1a1a; color: white; font-size: 16px; font-weight: bold; text-decoration: none; padding: 15px 30px; border-radius: 12px; display: inline-block;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 20px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      </div>
    `;

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    return res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    console.error('Failed to send reset password email via Brevo:', error);
    return res.status(500).json({
      error: 'Failed to send reset link. Please try again.'
    });
  }
}
