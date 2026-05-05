# MERN Login Screen

A minimal MERN starter with a shadcn-inspired login screen on the client and a Mongo-backed Express auth endpoint on the server.

## Stack

- **Client:** React, Vite, Tailwind CSS, shadcn-style UI components
- **Server:** Node.js, Express, MongoDB, Mongoose, JWT

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy the server environment file and fill in values:
   ```bash
   cp server/.env.example server/.env
   ```
3. Seed the demo user:
   ```bash
   npm run seed --workspace server
   ```
4. Start the API and client in separate terminals:
   ```bash
   npm run dev:server
   npm run dev:client
   ```

The client runs on `http://localhost:5173` and posts login requests to `http://localhost:5000/api/auth/login` by default.

## Demo credentials

Use the values configured in `server/.env`, by default:

- `demo@example.com`
- `password123`
