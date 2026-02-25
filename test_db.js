const { createClient } = require('@supabase/supabase-js');

// We need the credentials, let's read them from .env.local
const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'));

const supabase = createClient(envConfig.NEXT_PUBLIC_SUPABASE_URL, envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.from('properties').select('id, title, latitude, longitude, address, lat, lng').limit(3);
    console.log("Error:", error);
    console.log("Data:", data);
}
run();
