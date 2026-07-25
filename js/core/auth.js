import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { isCloudConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from '../config.js';

let client = null;
let currentUser = null;
const listeners = new Set();

export function getSupabase() {
  if (!isCloudConfigured()) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

export function getUser() {
  return currentUser;
}

export function isLoggedIn() {
  return !!currentUser;
}

function emit() {
  listeners.forEach((fn) => {
    try {
      fn(currentUser);
    } catch {
      /* ignore */
    }
  });
}

export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export async function initAuth() {
  const sb = getSupabase();
  if (!sb) {
    currentUser = null;
    emit();
    return null;
  }

  const { data } = await sb.auth.getSession();
  currentUser = data.session?.user || null;
  emit();

  sb.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    emit();
  });

  return currentUser;
}

export async function signUp(email, password) {
  const sb = getSupabase();
  if (!sb) return { error: 'Chưa cấu hình Supabase (js/config.js).' };
  const { data, error } = await sb.auth.signUp({ email, password });
  if (error) return { error: error.message };
  currentUser = data.user;
  emit();
  return { user: data.user, needsConfirm: !data.session };
}

export async function signIn(email, password) {
  const sb = getSupabase();
  if (!sb) return { error: 'Chưa cấu hình Supabase (js/config.js).' };
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  currentUser = data.user;
  emit();
  return { user: data.user };
}

export async function signOut() {
  const sb = getSupabase();
  if (!sb) return;
  await sb.auth.signOut();
  currentUser = null;
  emit();
}
