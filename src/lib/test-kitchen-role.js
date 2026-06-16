global.WebSocket = class {};
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envPath = path.join(__dirname, '..', '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseAnonKey = env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
  realtime: { transport: null }
});

async function test() {
  console.log("Testing kitchen role insert...");
  const testId = '00000000-0000-0000-0000-000000000000'; // placeholder UUID
  
  // Try to insert a dummy user profile with role 'kitchen'
  const { data, error } = await supabase
    .from('users')
    .insert({
      id: testId,
      full_name: 'Test Kitchen Partner',
      phone: '1234567890',
      role: 'kitchen'
    })
    .select();

  if (error) {
    console.error("❌ Failed to insert role 'kitchen':", error.message);
  } else {
    console.log("✅ Success! Kitchen role is accepted by the database:", data);
    // Cleanup
    await supabase.from('users').delete().eq('id', testId);
  }
}

test();
