const { createClient } = require('@supabase/supabase-js');

// We need the credentials, let's read them from .env.local
const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data: fm, error: fmErr } = await supabase.from('family_members').select('*')
    console.log("FM:", fm);
    const { data: occ, error: occErr } = await supabase.from('tenant_occupancies').select('*')
    console.log("OCC:", occ);
}
run();
