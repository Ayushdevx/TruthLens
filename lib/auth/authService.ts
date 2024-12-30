import { LoginCredentials, RegisterCredentials, User } from './authTypes';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

// Helper functions
const getUsers = (): User[] => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export async function login({ email, password }: LoginCredentials): Promise<User> {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user || user.password !== password) {
    throw new Error('Invalid email or password');
  }

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  return user;
}

export async function register({ email, password, name }: RegisterCredentials): Promise<User> {
  const users = getUsers();
  
  if (users.some(u => u.email === email)) {
    throw new Error('Email already exists');
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    name,
    password,
    createdAt: new Date(),
  };

  users.push(newUser);
  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
  
  return newUser;
}

export async function logout(): Promise<void> {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export async function getCurrentUser(): Promise<User | null> {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
}