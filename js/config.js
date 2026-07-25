/**
 * Cấu hình cloud save (Supabase).
 *
 * Cách bật tài khoản + lưu đám mây:
 * 1. Tạo project miễn phí tại https://supabase.com
 * 2. SQL Editor → chạy file supabase/schema.sql
 * 3. Project Settings → API → copy URL và anon key vào bên dưới
 * 4. Authentication → Providers → Email: bật (tắt "Confirm email" khi test cho nhanh)
 *
 * Để trống = chỉ chơi Guest (localStorage trên từng máy).
 */
export const SUPABASE_URL = '';
export const SUPABASE_ANON_KEY = '';

export function isCloudConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
