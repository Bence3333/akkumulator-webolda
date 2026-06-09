import { createClient } from '@supabase/supabase-js';

// External Supabase client for quote requests
// This connects to the main business database
const EXTERNAL_SUPABASE_URL = 'https://llkijsolfyqopbxyjjzk.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsa2lqc29sZnlxb3BieHlqanprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDE1NTksImV4cCI6MjA4MDUxNzU1OX0.tEFDaNly5Nb9QabVMKr1CDNePS4KLRm5yQGDTdPBc_k';

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
