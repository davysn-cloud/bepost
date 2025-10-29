import Bull from 'bull';
import { JobData } from '../types';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Criar fila para posts agendados
export const postPublishQueue = new Bull<JobData>('post-publish', REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

// Configurar logs
postPublishQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

postPublishQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed:`, error);
});

postPublishQueue.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

export default postPublishQueue;
