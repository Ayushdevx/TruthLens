import { LoginCredentials, RegisterCredentials, User } from './authTypes';

const API_URL = '/api/auth';

export async function login(credentials: LoginCredentials): Promise<User> {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to login');
  }

  return response.json();
}

export async function register(credentials: RegisterCredentials): Promise<User> {
  const response = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to register');
  }

  return response.json();
}

export async function logout(): Promise<void> {
  const response = await fetch(`${API_URL}/logout`, { method: 'POST' });
  
  if (!response.ok) {
    throw new Error('Failed to logout');
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/me`);
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}