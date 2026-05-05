import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth-routes.js';
import healthRoutes from './routes/health-routes.js';

const app = express();
const port = process.env.PORT || 3001;

app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use('/api', healthRoutes);
app.use('/api', authRoutes);

app.listen(port, () => {
  console.log(`Backend API listening on http://localhost:${port}`);
});
