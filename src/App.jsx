import { useEffect, useState } from 'react';
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

const demoCredentials = {
  email: 'demo@example.com',
  password: 'password123'
};

const benefits = [
  'Reusable shadcn-style card, button, input, and label primitives',
  'Node.js API health checks and login validation wired into the UI',
  'Responsive Vite layout with status feedback and demo account shortcuts'
];

const providers = [
  { name: 'GitHub', icon: GitHubIcon },
  { name: 'Google', icon: GoogleIcon }
];

export default function App() {
  const [email, setEmail] = useState(demoCredentials.email);
  const [password, setPassword] = useState(demoCredentials.password);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    let ignore = false;

    async function checkApiHealth() {
      try {
        const response = await fetch('/api/health');

        if (!ignore) {
          setApiStatus(response.ok ? 'online' : 'offline');
        }
      } catch (_error) {
        if (!ignore) {
          setApiStatus('offline');
        }
      }
    }

    checkApiHealth();

    return () => {
      ignore = true;
    };
  }, []);

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
        user: data.user ?? null,
        rememberMe
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
          <div className="hero-topbar">
            <div className="brand-badge">shadcn/ui</div>
            <span className={`status-pill status-${apiStatus}`}>
              <span className="status-dot" />
              API {apiStatus}
            </span>
          </div>
          <h2>Regenerated login experience for Vite + Node.js</h2>
          <p>
            A clean sign-in screen inspired by shadcn/ui, backed by a Node.js API that exposes
            health, login, and logout endpoints for local development.
          </p>
          <div className="benefits-list">
            {benefits.map((item) => (
              <div key={item} className="benefit-item">
                <CheckIcon />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="demo-credentials">
            <span>Demo credentials</span>
            <strong>
              {demoCredentials.email} / {demoCredentials.password}
            </strong>
          </div>
          <div className="trust-grid">
            <div>
              <strong>Ready to extend</strong>
              <span>Add JWT auth, persistence, or provider login later.</span>
            </div>
            <div>
              <strong>Fast local setup</strong>
              <span>Vite proxies API requests to the Express backend in development.</span>
            </div>
          </div>
        </section>

        <Card className="login-card">
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Enter your email below to sign in to your account.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="card-banner">
                <div>
                  <strong>Use the seeded demo account</strong>
                  <span>Pre-filled credentials are ready for the Express API.</span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="demo-button"
                  onClick={() => {
                    setEmail(demoCredentials.email);
                    setPassword(demoCredentials.password);
                    setResult(null);
                  }}
                >
                  Fill demo
                </Button>
              </div>

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
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                  />
                  <span>Remember me for 30 days</span>
                </label>
                <span className="form-status">
                  {apiStatus === 'online'
                    ? 'Backend connected'
                    : apiStatus === 'checking'
                      ? 'Checking backend'
                      : 'Backend offline'}
                </span>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>

              <div className="divider">or continue with</div>

              <div className="social-grid">
                {providers.map(({ name, icon: Icon }) => (
                  <Button key={name} type="button" variant="outline" className="social-button">
                    <Icon />
                    {name}
                  </Button>
                ))}
              </div>
            </form>

            {result ? (
              <div className={`message message-${result.tone}`}>
                <strong>{result.tone === 'success' ? 'Success:' : 'Error:'}</strong>{' '}
                {result.message}
                {result.user ? (
                  <span className="user-chip">
                    {result.user.name} · {result.user.role}
                  </span>
                ) : null}
                {result.tone === 'success' ? (
                  <span className="remember-chip">
                    {result.rememberMe ? 'Remembered session enabled' : 'Session only'}
                  </span>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="benefit-icon">
      <path
        d="M20 7 9 18l-5-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="social-icon">
      <path
        d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.5v-1.76c-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.12-1.49-1.12-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.05 1.53 1.05.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.1 0-1.12.39-2.03 1.02-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.3 9.3 0 0 1 12 6.9c.85 0 1.7.12 2.5.36 1.9-1.33 2.74-1.05 2.74-1.05.56 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.97-2.35 4.83-4.58 5.08.36.32.68.95.68 1.92v2.84c0 .28.18.6.69.5A10.23 10.23 0 0 0 22 12.22C22 6.58 17.52 2 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="social-icon">
      <path
        d="M21.81 12.23c0-.72-.06-1.25-.2-1.8H12.2v3.4h5.52c-.11.84-.7 2.1-2.02 2.95l-.02.11 2.97 2.35.21.02c1.92-1.81 2.95-4.47 2.95-7.03Z"
        fill="#4285F4"
      />
      <path
        d="M12.2 22c2.7 0 4.98-.9 6.64-2.45l-3.16-2.48c-.85.6-1.98 1.02-3.48 1.02-2.64 0-4.87-1.8-5.67-4.28l-.1.01-3.09 2.44-.03.1A10.03 10.03 0 0 0 12.2 22Z"
        fill="#34A853"
      />
      <path
        d="M6.53 13.8a6.26 6.26 0 0 1-.3-1.89c0-.66.11-1.3.29-1.9l-.01-.13-3.12-2.48-.1.05A10.42 10.42 0 0 0 2.2 11.9c0 1.64.38 3.2 1.08 4.56l3.25-2.66Z"
        fill="#FBBC05"
      />
      <path
        d="M12.2 5.72c1.9 0 3.19.85 3.92 1.55l2.86-2.86C17.17 2.7 14.9 1.8 12.2 1.8a10.03 10.03 0 0 0-8.9 5.55l3.23 2.56c.81-2.48 3.04-4.2 5.68-4.2Z"
        fill="#EA4335"
      />
    </svg>
  );
}
