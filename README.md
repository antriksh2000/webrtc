# MERN Auth + Dashboard

A minimal MERN starter with shadcn-inspired sign-in and sign-up flows, a dashboard workspace, camera preview controls, and Mongo-backed Express auth and user endpoints on the server.

## Stack

- **Client:** React, Vite, Tailwind CSS, shadcn-style UI components, camera preview dashboard
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

The client runs on `http://localhost:5173` and posts auth requests to `http://localhost:5000/api/auth` by default.

## Dashboard experience

After authentication, the app redirects into a dashboard screen that includes:

- A shadcn-style sidebar that only shows registered database users
- A live camera preview panel on the right with a camera on/off toggle
- A confirmation popup before starting a video call
- An in-app conference state that highlights the selected participant and active call timer

## Demo credentials

Use the values configured in `server/.env`, by default:

- `demo@example.com`
- `password123`
