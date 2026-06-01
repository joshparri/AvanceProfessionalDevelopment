'use client';

import { db, initDatabase } from '@/lib/db';
import type { Account } from '@/types';

const USER_SESSION_KEY = 'avancepd.currentUserId';

const encodePassword = async (password: string) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const setCurrentUserId = (id: string | null) => {
  if (typeof window === 'undefined') return;
  if (id) {
    window.localStorage.setItem(USER_SESSION_KEY, id);
  } else {
    window.localStorage.removeItem(USER_SESSION_KEY);
  }
};

export async function registerUser(email: string, password: string) {
  await initDatabase();

  const normalizedEmail = normalizeEmail(email);
  const existing = await db.accounts.where('email').equals(normalizedEmail).first();
  if (existing) {
    throw new Error('An account with this email already exists.');
  }

  const passwordHash = await encodePassword(password);
  const account: Account = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.accounts.put(account);
  setCurrentUserId(account.id);
  return account;
}

export async function authenticateUser(email: string, password: string) {
  await initDatabase();

  const normalizedEmail = normalizeEmail(email);
  const account = await db.accounts.where('email').equals(normalizedEmail).first();
  if (!account) {
    throw new Error('No account found for this email.');
  }

  const passwordHash = await encodePassword(password);
  if (passwordHash !== account.passwordHash) {
    throw new Error('The password is incorrect.');
  }

  setCurrentUserId(account.id);
  return account;
}

export async function getCurrentUser() {
  if (typeof window === 'undefined') {
    return null;
  }

  await initDatabase();

  const userId = window.localStorage.getItem(USER_SESSION_KEY);
  if (!userId) {
    return null;
  }

  const user = await db.accounts.get(userId);
  if (!user) {
    setCurrentUserId(null);
  }

  return user ?? null;
}

export function logoutUser() {
  setCurrentUserId(null);
}
