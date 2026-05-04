import { useState } from 'react';

const API_BASE = 'http://localhost:3001';

export default function App() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      setMessage(response.ok ? `Success: ${data.message}` : `Error: ${data.message}`);
    } catch (error) {
      setMessage('Error: Unable to reach backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="login-card">
        <div className="brand-badge">shadcn</div>
        <h1>Welcome back</h1>
        <p>Sign in to continue to your dashboard.</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          <div className="form-row">
            <label className="checkbox-row">
              <input type="checkbox" />
              Remember me
            </label>
            <a href="/">Forgot password?</a>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        {message ? <div className="message">{message}</div> : null}
      </div>
    </div>
  );
}
