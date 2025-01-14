import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || "https://extannpqxoeznkrpgfsa.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dGFubnBxeG9lem5rcnBnZnNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY4NDE3MjgsImV4cCI6MjA1MjQxNzcyOH0.WwVttq7ftzxKlyCyRj4cmJBs3zuDIAHU_sUkXxVAinA";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default supabase;
