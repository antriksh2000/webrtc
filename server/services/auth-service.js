import { users } from '../data/users.js';

export function authenticateUser(email, password) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((entry) => entry.email === normalizedEmail);

  if (!user || user.password !== password) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
}

