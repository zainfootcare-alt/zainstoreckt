import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fcgtjbmrguziyctvqfjr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjZ3RqYm1yZ3V6aXljdHZxZmpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyODUzOTUsImV4cCI6MjEwMTg2MTM5NX0.2p6EwBWYKxAcGR9HP6iRn21DruUeizSm3gLYt_FW3pQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing Supabase Connection to:', supabaseUrl);
  try {
    const { data, error } = await supabase.from('payment_accounts').select('*');
    if (error) {
      console.log('Supabase Query Response (Error/Table Status):', error.message);
    } else {
      console.log('SUCCESS! Supabase Connected & Tables Accessible. Rows found:', data ? data.length : 0);
    }
  } catch (err) {
    console.error('Connection Error:', err);
  }
}

testConnection();
