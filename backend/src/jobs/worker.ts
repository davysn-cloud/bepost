import { Job } from 'bull';
import { JobData } from '../types';
import { postPublishQueue } from './queue';
import { publishPost } from '../controllers/instagram.controller';
import { prisma } from '../utils/prisma';

// Processar job de publicação
postPublishQueue.process(async (job: Job<JobData>) => {
  console.log(`Processing job ${job.id} for post ${job.data.postId}`);

  try {
    const { postId } = job.data;

    // Verificar se o post ainda está agendado
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error('Post não encontrado');
    }

    if (post.status !== 'SCHEDULED') {
      console.log(`Post ${postId} não está mais agendado. Status atual: ${post.status}`);
      return { success: false, reason: 'Post não está mais agendado' };
    }

    // Publicar no Instagram
    const success = await publishPost(postId);

    if (!success) {
      throw new Error('Falha ao publicar post no Instagram');
    }

    console.log(`Post ${postId} publicado com sucesso`);
    return { success: true, postId };
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error);
    throw error;
  }
});

// Agendar posts existentes ao iniciar o worker
export const scheduleExistingPosts = async (): Promise<void> => {
  try {
    const scheduledPosts = await prisma.post.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledFor: {
          gte: new Date(),
        },
      },
      include: {
        instagramAccount: true,
      },
    });

    for (const post of scheduledPosts) {
      if (post.scheduledFor) {
        const delay = post.scheduledFor.getTime() - Date.now();

        if (delay > 0) {
          await postPublishQueue.add(
            {
              postId: post.id,
              organizationId: post.organizationId,
              instagramAccountId: post.instagramAccountId,
            },
            {
              delay,
              jobId: `post-${post.id}`,
            }
          );

          console.log(`Post ${post.id} agendado para ${post.scheduledFor}`);
        }
      }
    }

    console.log(`${scheduledPosts.length} posts agendados`);
  } catch (error) {
    console.error('Error scheduling existing posts:', error);
  }
};

// Agendar um post específico
export const schedulePost = async (
  postId: string,
  organizationId: string,
  instagramAccountId: string,
  scheduledFor: Date
): Promise<void> => {
  const delay = scheduledFor.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error('Data de agendamento deve ser no futuro');
  }

  await postPublishQueue.add(
    {
      postId,
      organizationId,
      instagramAccountId,
    },
    {
      delay,
      jobId: `post-${postId}`,
    }
  );

  console.log(`Post ${postId} agendado para ${scheduledFor}`);
};

// Cancelar agendamento de um post
export const cancelScheduledPost = async (postId: string): Promise<void> => {
  try {
    const job = await postPublishQueue.getJob(`post-${postId}`);

    if (job) {
      await job.remove();
      console.log(`Agendamento do post ${postId} cancelado`);
    }
  } catch (error) {
    console.error(`Error canceling scheduled post ${postId}:`, error);
  }
};

export default postPublishQueue;
