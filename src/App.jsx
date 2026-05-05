import { useState } from 'react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label
} from './components/ui';

export default function App() {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      setResult({
        tone: response.ok ? 'success' : 'error',
        message: data.message,
        user: data.user ?? null
      });
    } catch (error) {
      setResult({
        tone: 'error',
        message: 'Unable to reach the Node.js backend. Start the API on port 3001.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="app-shell">
        <section className="hero-panel">
          <div className="brand-badge">shadcn/ui</div>
          <h2>Modern login starter</h2>
          <p>
            A Vite frontend with a shadcn-inspired auth screen connected to a Node.js API for
            health checks and login requests.
          </p>
          <div className="demo-credentials">
            <span>Demo credentials</span>
            <strong>demo@example.com / password123</strong>
          </div>
        </section>

        <Card className="login-card">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Enter your email below to sign in to your account.</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="field-grid">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div className="field-grid">
                <div className="label-row">
                  <Label htmlFor="password">Password</Label>
                  <a href="/" onClick={(event) => event.preventDefault()}>
                    Forgot your password?
                  </a>
                </div>
                <div className="password-field">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="ghost-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="form-row">
                <label className="checkbox-row" htmlFor="remember-me">
                  <input id="remember-me" type="checkbox" defaultChecked />
                  <span>Remember me for 30 days</span>
                </label>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>

              <div className="divider">or continue with</div>

              <div className="social-grid">
                <Button type="button" variant="outline">
                  GitHub
                </Button>
                <Button type="button" variant="outline">
                  Google
                </Button>
              </div>
            </form>

            {result ? (
              <div className={`message message-${result.tone}`}>
                <strong>{result.tone === 'success' ? 'Success:' : 'Error:'}</strong>{' '}
                {result.message}
                {result.user ? <span className="user-chip">{result.user.name}</span> : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
