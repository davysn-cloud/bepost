import { Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';
import { CommentType } from '@prisma/client';

export const createComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId, mediaId, content, type, posX, posY } = req.body;
    const userId = req.user!.id;

    if (!postId || !content || !type) {
      sendError(res, 'Post ID, conteúdo e tipo são obrigatórios', 400);
      return;
    }

    // Verificar se o post existe e se o usuário tem acesso
    const post = await prisma.post.findUnique({
      where: { id: postId },
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

    if (!post) {
      sendError(res, 'Post não encontrado', 404);
      return;
    }

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

    // Se for comentário visual, validar coordenadas e mediaId
    if (type === 'VISUAL') {
      if (!mediaId || posX === undefined || posY === undefined) {
        sendError(res, 'Comentários visuais requerem mediaId e coordenadas X,Y', 400);
        return;
      }
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        mediaId: type === 'VISUAL' ? mediaId : null,
        userId,
        content,
        type: type as CommentType,
        posX: type === 'VISUAL' ? posX : null,
        posY: type === 'VISUAL' ? posY : null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        media: true,
      },
    });

    // TODO: Enviar notificação por email aos membros relevantes

    sendSuccess(res, comment, 'Comentário criado com sucesso', 201);
  } catch (error) {
    console.error('Error in createComment:', error);
    sendError(res, 'Erro ao criar comentário', 500);
  }
};

export const getComments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.query;
    const userId = req.user!.id;

    if (!postId) {
      sendError(res, 'Post ID é obrigatório', 400);
      return;
    }

    // Verificar acesso
    const post = await prisma.post.findUnique({
      where: { id: postId as string },
    });

    if (!post) {
      sendError(res, 'Post não encontrado', 404);
      return;
    }

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

    const comments = await prisma.comment.findMany({
      where: {
        postId: postId as string,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        media: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    sendSuccess(res, comments);
  } catch (error) {
    console.error('Error in getComments:', error);
    sendError(res, 'Erro ao buscar comentários', 500);
  }
};

export const updateComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, isResolved } = req.body;
    const userId = req.user!.id;

    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: true,
      },
    });

    if (!existingComment) {
      sendError(res, 'Comentário não encontrado', 404);
      return;
    }

    // Verificar se o usuário é o autor ou tem acesso à organização
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: existingComment.post.organizationId,
        userId,
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    // Apenas o autor pode editar o conteúdo
    if (content && existingComment.userId !== userId) {
      sendError(res, 'Apenas o autor pode editar o conteúdo do comentário', 403);
      return;
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: {
        content: content || undefined,
        isResolved: isResolved !== undefined ? isResolved : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        media: true,
      },
    });

    sendSuccess(res, comment, 'Comentário atualizado com sucesso');
  } catch (error) {
    console.error('Error in updateComment:', error);
    sendError(res, 'Erro ao atualizar comentário', 500);
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const existingComment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: true,
      },
    });

    if (!existingComment) {
      sendError(res, 'Comentário não encontrado', 404);
      return;
    }

    // Verificar se o usuário é o autor ou admin
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: existingComment.post.organizationId,
        userId,
      },
    });

    if (!membership || (membership.role !== 'ADMIN' && existingComment.userId !== userId)) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    await prisma.comment.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Comentário excluído com sucesso');
  } catch (error) {
    console.error('Error in deleteComment:', error);
    sendError(res, 'Erro ao excluir comentário', 500);
  }
};
