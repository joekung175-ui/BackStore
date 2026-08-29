import { supabase } from './supabase.js';

async function backofficeRole(user) {
  if (user?.app_metadata?.role === 'owner') return 'owner';
  const { data, error } = await supabase.rpc('current_backoffice_role');
  return error ? null : data;
}

export async function requireAdmin() {
  if (!supabase) return false;
  const { data: { session } } = await supabase.auth.getSession();
  const role = await backofficeRole(session?.user);
  if (!session || !role) { if (session) await supabase.auth.signOut(); location.assign('login.html'); return false; }
  document.body.dataset.backofficeRole = role;
  return true;
}

export async function login(email, password) {
  if (!supabase) throw new Error('กรุณาตั้งค่า Supabase ก่อนเข้าสู่ระบบ');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const role = await backofficeRole(data.user);
  if (!role) { await supabase.auth.signOut(); throw new Error('บัญชีนี้ไม่มีสิทธิ์เข้าระบบหลังบ้าน'); }
  location.assign('dashboard.html');
}

export async function logout() { if (supabase) await supabase.auth.signOut(); location.assign('login.html'); }
