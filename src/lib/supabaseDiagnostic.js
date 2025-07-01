// lib/supabaseDiagnostic.js
import { supabase } from './supabase.js';

export async function runSupabaseDiagnostics() {
  console.group('🔍 SUPABASE DIAGNOSTICS');
  
  const results = {
    connection: null,
    auth: null,
    tableExists: null,
    tableSchema: null,
    permissions: null,
    sampleQuery: null,
    rls: null
  };

  // 1. Test basic connection
  console.log('1️⃣ Testing basic connection...');
  try {
    const { data, error } = await supabase.rpc('version');
    if (error) {
      console.error('❌ Connection failed:', error);
      results.connection = { success: false, error };
    } else {
      console.log('✅ Connection successful');
      results.connection = { success: true };
    }
  } catch (err) {
    console.error('❌ Connection exception:', err);
    results.connection = { success: false, error: err.message };
  }

  // 2. Check authentication
  console.log('2️⃣ Checking authentication...');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error('❌ Auth error:', error);
      results.auth = { authenticated: false, error };
    } else {
      console.log('✅ Auth status:', user ? 'Authenticated' : 'Anonymous');
      results.auth = { 
        authenticated: !!user, 
        user: user ? { id: user.id, email: user.email } : null 
      };
    }
  } catch (err) {
    console.error('❌ Auth exception:', err);
    results.auth = { authenticated: false, error: err.message };
  }

  // 3. Check if table exists
  console.log('3️⃣ Checking if brukere table exists...');
  try {
    // Try to get table info
    const { data, error } = await supabase
      .from('brukere')
      .select('*')
      .limit(0); // Don't return any rows, just test if table exists

    if (error) {
      if (error.code === '42P01') {
        console.error('❌ Table "brukere" does not exist');
        results.tableExists = { exists: false, error: 'Table not found' };
      } else {
        console.log('✅ Table exists (but other error occurred)');
        results.tableExists = { exists: true, error };
      }
    } else {
      console.log('✅ Table "brukere" exists');
      results.tableExists = { exists: true };
    }
  } catch (err) {
    console.error('❌ Table check exception:', err);
    results.tableExists = { exists: false, error: err.message };
  }

  // 4. Get table schema
  console.log('4️⃣ Checking table schema...');
  try {
    // Try a simple select to see what columns are available
    const { data, error } = await supabase
      .from('brukere')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Schema check failed:', error);
      results.tableSchema = { success: false, error };
    } else {
      const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
      console.log('✅ Available columns:', columns);
      results.tableSchema = { 
        success: true, 
        columns,
        hasCreatedAt: columns.includes('created_at')
      };
    }
  } catch (err) {
    console.error('❌ Schema check exception:', err);
    results.tableSchema = { success: false, error: err.message };
  }

  // 5. Test the exact failing query
  console.log('5️⃣ Testing the failing query...');
  try {
    const { data, error } = await supabase
      .from('brukere')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failing query error:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      results.sampleQuery = { success: false, error };
    } else {
      console.log('✅ Query successful, returned', data?.length || 0, 'rows');
      results.sampleQuery = { success: true, rowCount: data?.length || 0 };
    }
  } catch (err) {
    console.error('❌ Query exception:', err);
    results.sampleQuery = { success: false, error: err.message };
  }

  // 6. Alternative query without ordering
  console.log('6️⃣ Testing query without ordering...');
  try {
    const { data, error } = await supabase
      .from('brukere')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Simple query failed:', error);
    } else {
      console.log('✅ Simple query successful, returned', data?.length || 0, 'rows');
      if (data && data.length > 0) {
        console.log('Sample row:', data[0]);
      }
    }
  } catch (err) {
    console.error('❌ Simple query exception:', err);
  }

  // 7. Check RLS status
  console.log('7️⃣ Checking Row Level Security...');
  try {
    // This is a common RLS check query
    const { data, error } = await supabase.rpc('check_table_rls', {
      table_name: 'brukere'
    });
    
    if (error && error.code !== '42883') { // Function doesn't exist is OK
      console.log('ℹ️ RLS check not available or failed:', error.message);
    } else if (data) {
      console.log('🔒 RLS status:', data);
      results.rls = data;
    }
  } catch (err) {
    console.log('ℹ️ RLS check not available');
  }

  // 8. Test with different ordering syntax
  console.log('8️⃣ Testing alternative order syntax...');
  try {
    const { data, error } = await supabase
      .from('brukere')
      .select('*')
      .order('created_at.desc');

    if (error) {
      console.error('❌ Alternative order syntax failed:', error);
    } else {
      console.log('✅ Alternative order syntax worked!');
    }
  } catch (err) {
    console.error('❌ Alternative order exception:', err);
  }

  // Summary
  console.log('📋 DIAGNOSTIC SUMMARY:');
  console.table(results);

  // Recommendations
  console.log('💡 RECOMMENDATIONS:');
  
  if (!results.connection?.success) {
    console.log('🔧 Fix connection issues first - check your Supabase URL and API key');
  }
  
  if (!results.tableExists?.exists) {
    console.log('🔧 Create the "brukere" table in Supabase');
  }
  
  if (results.tableSchema && !results.tableSchema.hasCreatedAt) {
    console.log('🔧 Add "created_at" column to brukere table or use a different column for ordering');
  }
  
  if (results.auth && !results.auth.authenticated) {
    console.log('🔧 Check if RLS is enabled and requires authentication');
  }

  console.groupEnd();
  return results;
}

// Quick test function you can call from console
export async function quickTest() {
  console.log('🚀 Quick Supabase Test');
  
  try {
    const { data, error } = await supabase
      .from('brukere')
      .select('id, created_at')
      .limit(1);
    
    if (error) {
      console.error('❌ Quick test failed:', error);
      return false;
    }
    
    console.log('✅ Quick test passed:', data);
    return true;
  } catch (err) {
    console.error('❌ Quick test exception:', err);
    return false;
  }
}

// Export for easy console access
if (typeof window !== 'undefined') {
  window.supabaseDiagnostics = runSupabaseDiagnostics;
  window.supabaseQuickTest = quickTest;
}