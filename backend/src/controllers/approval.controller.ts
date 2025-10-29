import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { PostStatus } from '@prisma/client';

// Obter post por token de aprovação (sem autenticação)
export const getPostByToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      sendError(res, 'Token de aprovação é obrigatório', 400);
      return;
    }

    const post = await prisma.post.findUnique({
      where: { approvalToken: token },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
        organization: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        instagramAccount: {
          select: {
            id: true,
            username: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!post) {
      sendError(res, 'Post não encontrado ou token inválido', 404);
      return;
    }

    // Remover informações sensíveis
    const publicPost = {
      id: post.id,
      title: post.title,
      caption: post.caption,
      hashtags: post.hashtags,
      status: post.status,
      scheduledFor: post.scheduledFor,
      media: post.media,
      organization: post.organization,
      instagramAccount: {
        username: post.instagramAccount.username,
      },
    };

    sendSuccess(res, publicPost);
  } catch (error) {
    console.error('Error in getPostByToken:', error);
    sendError(res, 'Erro ao buscar post', 500);
  }
};

// Aprovar post (sem autenticação)
export const approvePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    if (!token) {
      sendError(res, 'Token de aprovação é obrigatório', 400);
      return;
    }

    const post = await prisma.post.findUnique({
      where: { approvalToken: token },
      include: {
        organization: {
          include: {
            members: {
              where: {
                role: 'ADMIN',
              },
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      sendError(res, 'Post não encontrado ou token inválido', 404);
      return;
    }

    if (post.status !== 'PENDING_APPROVAL') {
      sendError(res, 'Este post não está aguardando aprovação', 400);
      return;
    }

    // Atualizar status para SCHEDULED
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        status: 'SCHEDULED',
      },
    });

    // Criar histórico de status
    await prisma.postStatusHistory.create({
      data: {
        postId: post.id,
        status: 'SCHEDULED',
        notes: 'Aprovado via link externo',
      },
    });

    // TODO: Enviar notificações por email aos admins
    // TODO: Agendar job de publicação

    sendSuccess(res, { status: 'SCHEDULED' }, 'Post aprovado com sucesso');
  } catch (error) {
    console.error('Error in approvePost:', error);
    sendError(res, 'Erro ao aprovar post', 500);
  }
};

// Rejeitar post (sem autenticação)
export const rejectPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { reason } = req.body;

    if (!token) {
      sendError(res, 'Token de aprovação é obrigatório', 400);
      return;
    }

    if (!reason || reason.trim() === '') {
      sendError(res, 'Motivo da rejeição é obrigatório', 400);
      return;
    }

    const post = await prisma.post.findUnique({
      where: { approvalToken: token },
      include: {
        organization: {
          include: {
            members: {
              where: {
                OR: [
                  { role: 'ADMIN' },
                  { role: 'TEAM' },
                ],
              },
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      sendError(res, 'Post não encontrado ou token inválido', 404);
      return;
    }

    if (post.status !== 'PENDING_APPROVAL') {
      sendError(res, 'Este post não está aguardando aprovação', 400);
      return;
    }

    // Atualizar status para REJECTED
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
    });

    // Criar histórico de status
    await prisma.postStatusHistory.create({
      data: {
        postId: post.id,
        status: 'REJECTED',
        notes: `Rejeitado via link externo. Motivo: ${reason}`,
      },
    });

    // TODO: Enviar notificações por email à equipe

    sendSuccess(res, { status: 'REJECTED' }, 'Post rejeitado');
  } catch (error) {
    console.error('Error in rejectPost:', error);
    sendError(res, 'Erro ao rejeitar post', 500);
  }
};

// Solicitar alteração (sem autenticação)
export const requestChanges = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { changes } = req.body;

    if (!token) {
      sendError(res, 'Token de aprovação é obrigatório', 400);
      return;
    }

    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      sendError(res, 'Lista de alterações é obrigatória', 400);
      return;
    }

    const post = await prisma.post.findUnique({
      where: { approvalToken: token },
      include: {
        organization: {
          include: {
            members: {
              where: {
                OR: [
                  { role: 'ADMIN' },
                  { role: 'TEAM' },
                ],
              },
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      sendError(res, 'Post não encontrado ou token inválido', 404);
      return;
    }

    if (post.status !== 'PENDING_APPROVAL') {
      sendError(res, 'Este post não está aguardando aprovação', 400);
      return;
    }

    // Criar comentários para cada alteração solicitada
    const comments = await Promise.all(
      changes.map(async (change: any) => {
        return prisma.comment.create({
          data: {
            postId: post.id,
            userId: post.createdById, // Usar o criador como fallback
            content: change.content,
            type: change.type === 'VISUAL' ? 'VISUAL' : 'TEXT',
            mediaId: change.mediaId || null,
            posX: change.posX || null,
            posY: change.posY || null,
          },
        });
      })
    );

    // Atualizar status para DRAFT (volta para rascunho)
    const updatedPost = await prisma.post.update({
      where: { id: post.id },
      data: {
        status: 'DRAFT',
      },
    });

    // Criar histórico de status
    await prisma.postStatusHistory.create({
      data: {
        postId: post.id,
        status: 'DRAFT',
        notes: `Alterações solicitadas via link externo (${changes.length} comentário(s))`,
      },
    });

    // TODO: Enviar notificações por email à equipe

    sendSuccess(res, { status: 'DRAFT', commentsCreated: comments.length }, 'Alterações solicitadas com sucesso');
  } catch (error) {
    console.error('Error in requestChanges:', error);
    sendError(res, 'Erro ao solicitar alterações', 500);
  }
};
