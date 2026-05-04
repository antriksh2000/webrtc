import express from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  if (email === 'demo@example.com' && password === 'password123') {
    return res.json({
      message: 'Login successful',
      user: {
        id: 1,
        email,
        name: 'Demo User'
      }
    });
  }

  return res.status(401).json({ message: 'Invalid credentials.' });
});

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
