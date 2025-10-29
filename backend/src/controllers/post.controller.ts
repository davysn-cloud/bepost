import { Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { getPagination } from '../utils/helpers';
import { PostStatus } from '@prisma/client';

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { organizationId, instagramAccountId, title, caption, hashtags, scheduledFor } = req.body;
    const userId = req.user!.id;

    if (!organizationId || !instagramAccountId || !caption) {
      sendError(res, 'Organização, conta do Instagram e legenda são obrigatórios', 400);
      return;
    }

    // Verificar se o usuário tem acesso à organização
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId,
        userId,
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    const post = await prisma.post.create({
      data: {
        organizationId,
        instagramAccountId,
        createdById: userId,
        title,
        caption,
        hashtags,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
        status: 'DRAFT',
      },
      include: {
        media: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instagramAccount: true,
      },
    });

    // Criar histórico de status
    await prisma.postStatusHistory.create({
      data: {
        postId: post.id,
        status: 'DRAFT',
        changedBy: userId,
        notes: 'Post criado',
      },
    });

    sendSuccess(res, post, 'Post criado com sucesso', 201);
  } catch (error) {
    console.error('Error in createPost:', error);
    sendError(res, 'Erro ao criar post', 500);
  }
};

export const getPosts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.query;
    const { page, limit, status, startDate, endDate } = req.query;
    const userId = req.user!.id;
    const pagination = getPagination(page as string, limit as string);

    if (!organizationId) {
      sendError(res, 'ID da organização é obrigatório', 400);
      return;
    }

    // Verificar acesso
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: organizationId as string,
        userId,
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    const where: any = {
      organizationId: organizationId as string,
    };

    if (status) {
      where.status = status as PostStatus;
    }

    if (startDate || endDate) {
      where.scheduledFor = {};
      if (startDate) {
        where.scheduledFor.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.scheduledFor.lte = new Date(endDate as string);
      }
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          media: true,
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          instagramAccount: true,
          _count: {
            select: {
              comments: true,
            },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: [
          { scheduledFor: 'asc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.post.count({ where }),
    ]);

    sendPaginatedResponse(res, posts, pagination.page, pagination.limit, total);
  } catch (error) {
    console.error('Error in getPosts:', error);
    sendError(res, 'Erro ao buscar posts', 500);
  }
};

export const getPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instagramAccount: true,
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        organization: true,
      },
    });

    if (!post) {
      sendError(res, 'Post não encontrado', 404);
      return;
    }

    // Verificar acesso
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: post.organizationId,
        userId,
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    sendSuccess(res, post);
  } catch (error) {
    console.error('Error in getPost:', error);
    sendError(res, 'Erro ao buscar post', 500);
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, caption, hashtags, scheduledFor } = req.body;
    const userId = req.user!.id;

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      sendError(res, 'Post não encontrado', 404);
      return;
    }

    // Verificar acesso
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: existingPost.organizationId,
        userId,
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        caption,
        hashtags,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      },
      include: {
        media: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instagramAccount: true,
      },
    });

    sendSuccess(res, post, 'Post atualizado com sucesso');
  } catch (error) {
    console.error('Error in updatePost:', error);
    sendError(res, 'Erro ao atualizar post', 500);
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      sendError(res, 'Post não encontrado', 404);
      return;
    }

    // Verificar acesso (apenas Admin ou criador)
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: existingPost.organizationId,
        userId,
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && existingPost.createdById !== userId)) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    await prisma.post.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Post excluído com sucesso');
  } catch (error) {
    console.error('Error in deletePost:', error);
    sendError(res, 'Erro ao excluir post', 500);
  }
};

export const updatePostStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.user!.id;

    if (!status) {
      sendError(res, 'Status é obrigatório', 400);
      return;
    }

    const existingPost = await prisma.post.findUnique({
      where: { id },
      include: {
        organization: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!existingPost) {
      sendError(res, 'Post não encontrado', 404);
      return;
    }

    // Verificar acesso
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: existingPost.organizationId,
        userId,
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    const oldStatus = existingPost.status;

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: status as PostStatus,
      },
      include: {
        media: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        instagramAccount: true,
      },
    });

    // Criar histórico de status
    await prisma.postStatusHistory.create({
      data: {
        postId: id,
        status: status as PostStatus,
        changedBy: userId,
        notes,
      },
    });

    // TODO: Enviar notificações por email para os membros relevantes

    sendSuccess(res, post, 'Status atualizado com sucesso');
  } catch (error) {
    console.error('Error in updatePostStatus:', error);
    sendError(res, 'Erro ao atualizar status', 500);
  }
};

export const uploadPostMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const files = req.files as Express.Multer.File[];
    const userId = req.user!.id;

    if (!files || files.length === 0) {
      sendError(res, 'Nenhum arquivo foi enviado', 400);
      return;
    }

    const existingPost = await prisma.post.findUnique({
      where: { id },
    });

    if (!existingPost) {
      sendError(res, 'Post não encontrado', 404);
      return;
    }

    // Verificar acesso
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: existingPost.organizationId,
        userId,
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    const mediaItems = await Promise.all(
      files.map(async (file, index) => {
        const { getFileUrl } = require('../utils/upload');
        const url = getFileUrl(file.filename);

        return prisma.postMedia.create({
          data: {
            postId: id,
            url,
            type: file.mimetype,
            order: index,
          },
        });
      })
    );

    sendSuccess(res, mediaItems, 'Mídia enviada com sucesso', 201);
  } catch (error) {
    console.error('Error in uploadPostMedia:', error);
    sendError(res, 'Erro ao enviar mídia', 500);
  }
};

export const deletePostMedia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, mediaId } = req.params;
    const userId = req.user!.id;

    const media = await prisma.postMedia.findUnique({
      where: { id: mediaId },
      include: {
        post: true,
      },
    });

    if (!media) {
      sendError(res, 'Mídia não encontrada', 404);
      return;
    }

    // Verificar acesso
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: media.post.organizationId,
        userId,
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    await prisma.postMedia.delete({
      where: { id: mediaId },
    });

    // TODO: Deletar arquivo físico

    sendSuccess(res, null, 'Mídia excluída com sucesso');
  } catch (error) {
    console.error('Error in deletePostMedia:', error);
    sendError(res, 'Erro ao excluir mídia', 500);
  }
};
