import { Router } from 'express';
import { authenticateUser } from '../services/auth-service.js';

const router = Router();

router.post('/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = authenticateUser(email, password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  return res.json({
    message: 'Login successful.',
    user
  });
});

router.post('/logout', (_req, res) => {
  return res.json({ message: 'Logged out successfully.' });
});

export default router;
