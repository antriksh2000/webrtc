# Architecture

## Frontend
- Vite + React single-page application.
- A shadcn-style login experience built from reusable card, button, input, and label primitives.
- Responsive split layout with demo credentials, social buttons, and success/error feedback.
- Submits credentials to the backend through `/api/login`.
- Vite dev server proxies `/api` requests to the Node backend in development.

## Backend
- Node.js + Express API server.
- Authentication logic is isolated in `server/services/auth-service.js`.
- Demo user data is isolated in `server/data/users.js`.
- Provides `/api/health` for service checks.
- Provides `/api/login` for credential validation.
- Returns a demo user response for the seeded credentials:
  - `demo@example.com`
  - `password123`

## Notes
- The frontend and backend are separated into different project roots within the same repository.
- This setup is intentionally minimal and can be extended with persistent auth, JWTs, and a database later.
