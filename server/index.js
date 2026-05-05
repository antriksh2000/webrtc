import express from 'express';
import cors from 'cors';
import { authenticateUser } from './services/auth-service.js';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'login-backend' });
});

app.post('/api/login', (req, res) => {
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

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
