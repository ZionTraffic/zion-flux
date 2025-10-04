import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jezmnlmgtkfrgjtzmpos.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Implem1ubG1ndGtmcmdqdHptcG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNjA3MTMsImV4cCI6MjA1MTgzNjcxM30.KnHI5pVEpY7nXzaMlLKMdwRXl7xpKXI6kkQSxPU0_kY';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true },
  realtime: { 
    params: { 
      eventsPerSecond: 10 
    } 
  }
});

export const WORKSPACE_ID = '3f14bb25-0eda-4c58-8486-16b96dca6f9e';
