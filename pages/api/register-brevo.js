// Server-side registration endpoint for Brevo OTP fallback
// Uses Supabase Admin API to bypass email rate limits
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, first_name, middle_name, last_name, birthday, gender } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

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

  try {
    // 1. Create the Auth user via Admin API (bypasses rate limits, auto-confirms email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Email already verified via Brevo OTP
      user_metadata: {
        first_name,
        middle_name: middle_name || 'N/A',
        last_name,
        birthday,
        gender
      }
    });

    if (authError) {
      // If user already exists (e.g. from the initial failed signUp attempt), 
      // try to find and confirm the existing user instead
      if (authError.message?.includes('already been registered') || authError.message?.includes('already exists')) {
        // Look up the existing user
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        if (listError) throw listError;

        const existingUser = users.find(u => u.email === email.toLowerCase().trim());
        if (existingUser) {
          // Update the existing user: confirm email and set password
          const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            existingUser.id,
            {
              email_confirm: true,
              password,
              user_metadata: {
                first_name,
                middle_name: middle_name || 'N/A',
                last_name,
                birthday,
                gender
              }
            }
          );

          if (updateError) throw updateError;

          // Create profile if it doesn't exist
          const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', existingUser.id)
            .maybeSingle();

          if (!existingProfile) {
            const { error: profileError } = await supabaseAdmin.from('profiles').insert({
              id: existingUser.id,
              first_name,
              middle_name: middle_name || 'N/A',
              last_name,
              role: 'tenant',
              email,
              birthday: birthday || null,
              gender: gender || null,
            });

            if (profileError && profileError.code !== '23505') {
              console.error('Profile creation error:', profileError);
            }
          }

          return res.status(200).json({
            success: true,
            userId: existingUser.id,
            message: 'Registration completed successfully'
          });
        }
      }
      throw authError;
    }

    const userId = authData.user.id;

    // 2. Create the profile record
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (!existingProfile) {
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        first_name,
        middle_name: middle_name || 'N/A',
        last_name,
        role: 'tenant',
        email,
        birthday: birthday || null,
        gender: gender || null,
      });

      if (profileError && profileError.code !== '23505') {
        // Rollback: delete the auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw profileError;
      }
    }

    return res.status(200).json({
      success: true,
      userId,
      message: 'Registration completed successfully'
    });

  } catch (error) {
    console.error('Brevo registration error:', error);
    return res.status(500).json({
      error: error.message || 'Registration failed. Please try again.'
    });
  }
}
