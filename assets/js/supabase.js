import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export const requireSupabase = () => {
  if (!supabase) throw new Error('ยังไม่ได้ตั้งค่า Supabase URL และ Anon Key');
  return supabase;
};
