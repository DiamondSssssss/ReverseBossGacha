import { apiUrl } from '../config.js?v=101';

const TOKEN_KEY = 'rbg_token';
const USER_KEY = 'rbg_user';

let currentUser = null;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => {
    try {
      fn(currentUser);
    } catch {
      /* ignore */
    }
  });
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getUser() {
  return currentUser;
}

export function isLoggedIn() {
  return !!currentUser && !!getToken();
}

export function isAdmin() {
  return !!currentUser?.isAdmin;
}

export function onAuthChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(apiUrl(path), { ...options, headers });
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    throw new Error(data?.error || `Lỗi ${res.status}`);
  }
  return data;
}

export async function initAuth() {
  const token = getToken();
  if (!token) {
    currentUser = null;
    emit();
    return null;
  }
  try {
    const data = await api('/api/me');
    currentUser = data.user;
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    emit();
    return currentUser;
  } catch {
    setToken(null);
    localStorage.removeItem(USER_KEY);
    currentUser = null;
    emit();
    return null;
  }
}

export async function signUp(username, password, displayName) {
  try {
    const data = await api('/api/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, displayName }),
    });
    setToken(data.token);
    currentUser = data.user;
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    emit();
    return { user: data.user };
  } catch (e) {
    return { error: e.message };
  }
}

export async function signIn(username, password) {
  try {
    const data = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    currentUser = data.user;
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    emit();
    return { user: data.user };
  } catch (e) {
    return { error: e.message };
  }
}

export async function signOut() {
  setToken(null);
  localStorage.removeItem(USER_KEY);
  currentUser = null;
  emit();
}

export { api };

