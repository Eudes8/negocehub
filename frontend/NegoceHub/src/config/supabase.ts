import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sertxnyxwcnzqghmwtbt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlcnR4bnl4d2NuenFnaG13dGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNDQ2NDEsImV4cCI6MjA2ODkyMDY0MX0.6Fv4LHw7DxRgBUO1BfIwPEr9Y5jhv4yx_HAx76TUyAY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
