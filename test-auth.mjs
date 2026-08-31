import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tuylqxfpfoqzkevwfwyq.supabase.co',
  'sb_publishable_uvrdmxoHybALTuJkQcbtFw__vW-stOC'
);

async function testGoogleAuth() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/dashboard'
    }
  });

  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Success! OAuth URL generated:', data.url);
  }
}

testGoogleAuth();
