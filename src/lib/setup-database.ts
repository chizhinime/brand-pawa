import { supabase } from './supabase';

export async function setupDatabase() {
  try {
    // Check if tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (error) {
      console.error('Error checking tables:', error);
      return false;
    }
    
    const tableNames = tables?.map(t => t.table_name) || [];
    
    if (!tableNames.includes('profiles')) {
      console.log('Database tables not found. Please run the SQL schema in Supabase dashboard.');
      return false;
    }
    
    console.log('Database setup complete');
    return true;
  } catch (error) {
    console.error('Database setup error:', error);
    return false;
  }
}