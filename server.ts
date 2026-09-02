import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './backend/src/app';
import { connectDatabase } from './database/config/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database Connection
  await connectDatabase();

  app.use(express.json());


  // Mount clean modular API Router
  const resolvedApiRouter = (apiRouter && (apiRouter as any).default) || apiRouter;
  app.use('/api', resolvedApiRouter);

  // Vite & Static Server Middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FacilityOps AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start FacilityOps AI server:', err);
});
