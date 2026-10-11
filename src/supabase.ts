/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim();
const normalizedSupabaseUrl = rawSupabaseUrl
  .replace(/\/+(rest|auth|storage|functions)\/v1\/?$/i, '')
  .replace(/\/+$/, '');

export const supabase = createClient(
  normalizedSupabaseUrl || 'https://placeholder.supabase.co',
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);
