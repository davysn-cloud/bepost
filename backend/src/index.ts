import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
import authRoutes from './routes/auth.routes';
import organizationRoutes from './routes/organization.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';
import approvalRoutes from './routes/approval.routes';
import instagramRoutes from './routes/instagram.routes';

// Importar middlewares
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Importar jobs
import { scheduleExistingPosts } from './jobs/worker';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos de upload
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/instagram', instagramRoutes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'BePost API',
    version: '1.0.0',
    description: 'Instagram Content Management SaaS',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      organizations: '/api/organizations',
      posts: '/api/posts',
      comments: '/api/comments',
      approval: '/api/approval',
      instagram: '/api/instagram',
    },
  });
});

// Tratamento de erros
app.use(notFoundHandler);
app.use(errorHandler);

// Iniciar servidor
const startServer = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API URL: http://localhost:${PORT}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);

      // Agendar posts existentes
      scheduleExistingPosts().catch(console.error);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

// Tratamento de sinais
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Iniciar
startServer();

export default app;
