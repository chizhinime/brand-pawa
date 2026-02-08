// src/lib/initDatabase.ts
import { supabase } from './supabase';

export async function initializeDatabase() {
  try {
    // Check if tables exist by trying to select from them
    const tables = ['profiles', 'user_diagnostics', 'user_activity'];
    
    for (const table of tables) {
      try {
        const { error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error && error.code === '42P01') {
          console.warn(`Table ${table} doesn't exist. Please run the SQL schema in Supabase.`);
        }
      } catch (err) {
        console.warn(`Could not check table ${table}:`, err);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}