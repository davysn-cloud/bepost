import { Response } from 'express';
import axios from 'axios';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError } from '../utils/response';

const INSTAGRAM_API_URL = 'https://graph.instagram.com';
const INSTAGRAM_AUTH_URL = 'https://api.instagram.com/oauth';

// Iniciar processo de autenticação OAuth
export const initiateAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.query;
    const userId = req.user!.id;

    if (!organizationId) {
      sendError(res, 'ID da organização é obrigatório', 400);
      return;
    }

    // Verificar se o usuário tem acesso à organização
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

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      sendError(res, 'Configuração do Instagram incompleta', 500);
      return;
    }

    const authUrl = `${INSTAGRAM_AUTH_URL}/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user_profile,user_media&response_type=code&state=${organizationId}`;

    sendSuccess(res, { authUrl });
  } catch (error) {
    console.error('Error in initiateAuth:', error);
    sendError(res, 'Erro ao iniciar autenticação', 500);
  }
};

// Callback do OAuth
export const oauthCallback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, state } = req.query;
    const organizationId = state as string;

    if (!code || !organizationId) {
      sendError(res, 'Código ou organização não fornecidos', 400);
      return;
    }

    const clientId = process.env.INSTAGRAM_CLIENT_ID;
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

    // Trocar código por access token
    const tokenResponse = await axios.post(`${INSTAGRAM_AUTH_URL}/access_token`, {
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
      code,
    });

    const { access_token, user_id } = tokenResponse.data;

    // Obter informações do usuário
    const userResponse = await axios.get(`${INSTAGRAM_API_URL}/${user_id}`, {
      params: {
        fields: 'id,username,account_type,media_count',
        access_token: access_token,
      },
    });

    const instagramUser = userResponse.data;

    // Salvar ou atualizar conta do Instagram
    const instagramAccount = await prisma.instagramAccount.upsert({
      where: {
        instagramId: instagramUser.id,
      },
      update: {
        accessToken: access_token,
        username: instagramUser.username,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
      },
      create: {
        organizationId,
        instagramId: instagramUser.id,
        username: instagramUser.username,
        accessToken: access_token,
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
    });

    // Redirecionar para o frontend com sucesso
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/organizations/${organizationId}/settings?instagram=connected`);
  } catch (error) {
    console.error('Error in oauthCallback:', error);
    sendError(res, 'Erro no callback do OAuth', 500);
  }
};

// Listar contas do Instagram conectadas
export const getInstagramAccounts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { organizationId } = req.query;
    const userId = req.user!.id;

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

    const accounts = await prisma.instagramAccount.findMany({
      where: {
        organizationId: organizationId as string,
        isActive: true,
      },
      select: {
        id: true,
        instagramId: true,
        username: true,
        tokenExpiresAt: true,
        isActive: true,
        createdAt: true,
      },
    });

    sendSuccess(res, accounts);
  } catch (error) {
    console.error('Error in getInstagramAccounts:', error);
    sendError(res, 'Erro ao buscar contas', 500);
  }
};

// Desconectar conta do Instagram
export const disconnectAccount = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const account = await prisma.instagramAccount.findUnique({
      where: { id },
    });

    if (!account) {
      sendError(res, 'Conta não encontrada', 404);
      return;
    }

    // Verificar acesso (apenas Admin)
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: account.organizationId,
        userId,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    await prisma.instagramAccount.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    sendSuccess(res, null, 'Conta desconectada com sucesso');
  } catch (error) {
    console.error('Error in disconnectAccount:', error);
    sendError(res, 'Erro ao desconectar conta', 500);
  }
};

// Publicar post no Instagram (usado pelo job scheduler)
export const publishPost = async (postId: string): Promise<boolean> => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        media: {
          orderBy: { order: 'asc' },
        },
        instagramAccount: true,
      },
    });

    if (!post || !post.instagramAccount) {
      console.error('Post ou conta do Instagram não encontrados');
      return false;
    }

    // Preparar mídia
    const mediaUrls = post.media.map((m) => m.url);
    const caption = `${post.caption}\n${post.hashtags || ''}`.trim();

    // Criar container de mídia
    const createMediaResponse = await axios.post(
      `${INSTAGRAM_API_URL}/${post.instagramAccount.instagramId}/media`,
      {
        image_url: mediaUrls[0], // Usar primeira imagem (simplificado)
        caption: caption,
        access_token: post.instagramAccount.accessToken,
      }
    );

    const creationId = createMediaResponse.data.id;

    // Publicar mídia
    const publishResponse = await axios.post(
      `${INSTAGRAM_API_URL}/${post.instagramAccount.instagramId}/media_publish`,
      {
        creation_id: creationId,
        access_token: post.instagramAccount.accessToken,
      }
    );

    const instagramPostId = publishResponse.data.id;

    // Atualizar post
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        instagramPostId,
      },
    });

    // Criar histórico
    await prisma.postStatusHistory.create({
      data: {
        postId,
        status: 'PUBLISHED',
        notes: 'Publicado automaticamente no Instagram',
      },
    });

    // TODO: Enviar notificações

    return true;
  } catch (error) {
    console.error('Error in publishPost:', error);

    // Atualizar post com erro
    await prisma.post.update({
      where: { id: postId },
      data: {
        status: 'DRAFT',
      },
    });

    await prisma.postStatusHistory.create({
      data: {
        postId,
        status: 'DRAFT',
        notes: `Erro ao publicar: ${error}`,
      },
    });

    return false;
  }
};
