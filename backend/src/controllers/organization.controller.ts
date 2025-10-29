import { Response } from 'express';
import { AuthRequest } from '../types';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError, sendPaginatedResponse } from '../utils/response';
import { generateSlug, getPagination } from '../utils/helpers';

export const createOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const userId = req.user!.id;

    if (!name) {
      sendError(res, 'Nome da organização é obrigatório', 400);
      return;
    }

    let slug = generateSlug(name);

    // Verificar se o slug já existe
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      slug = `${slug}-${Date.now()}`;
    }

    const organization = await prisma.organization.create({
      data: {
        name,
        description,
        slug,
        members: {
          create: {
            userId,
            role: 'ADMIN',
            isPaying: true,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    sendSuccess(res, organization, 'Organização criada com sucesso', 201);
  } catch (error) {
    console.error('Error in createOrganization:', error);
    sendError(res, 'Erro ao criar organização', 500);
  }
};

export const getOrganizations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { page, limit } = req.query;
    const pagination = getPagination(page as string, limit as string);

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                  role: true,
                },
              },
            },
          },
          _count: {
            select: {
              posts: true,
              instagramAccount: true,
            },
          },
        },
        skip: pagination.skip,
        take: pagination.limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.organization.count({
        where: {
          members: {
            some: {
              userId,
            },
          },
        },
      }),
    ]);

    sendPaginatedResponse(res, organizations, pagination.page, pagination.limit, total);
  } catch (error) {
    console.error('Error in getOrganizations:', error);
    sendError(res, 'Erro ao buscar organizações', 500);
  }
};

export const getOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const organization = await prisma.organization.findFirst({
      where: {
        id,
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
        },
        instagramAccount: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
    });

    if (!organization) {
      sendError(res, 'Organização não encontrada', 404);
      return;
    }

    sendSuccess(res, organization);
  } catch (error) {
    console.error('Error in getOrganization:', error);
    sendError(res, 'Erro ao buscar organização', 500);
  }
};

export const updateOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, logo } = req.body;
    const userId = req.user!.id;

    // Verificar se o usuário é admin da organização
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    const organization = await prisma.organization.update({
      where: { id },
      data: {
        name,
        description,
        logo,
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                role: true,
              },
            },
          },
        },
      },
    });

    sendSuccess(res, organization, 'Organização atualizada com sucesso');
  } catch (error) {
    console.error('Error in updateOrganization:', error);
    sendError(res, 'Erro ao atualizar organização', 500);
  }
};

export const deleteOrganization = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Verificar se o usuário é admin da organização
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId,
        role: 'ADMIN',
        isPaying: true,
      },
    });

    if (!membership) {
      sendError(res, 'Apenas o administrador pagante pode excluir a organização', 403);
      return;
    }

    await prisma.organization.delete({
      where: { id },
    });

    sendSuccess(res, null, 'Organização excluída com sucesso');
  } catch (error) {
    console.error('Error in deleteOrganization:', error);
    sendError(res, 'Erro ao excluir organização', 500);
  }
};

export const inviteMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user!.id;

    if (!email || !role) {
      sendError(res, 'Email e papel são obrigatórios', 400);
      return;
    }

    // Verificar se o usuário é admin da organização
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    // Buscar ou criar o usuário convidado
    let invitedUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      // Criar usuário temporário (deverá definir senha no primeiro login)
      const tempPassword = Math.random().toString(36).slice(-8);
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      invitedUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: email.split('@')[0],
          role: role,
        },
      });

      // TODO: Enviar email de convite com link para definir senha
    }

    // Verificar se já é membro
    const existingMembership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId: invitedUser.id,
      },
    });

    if (existingMembership) {
      sendError(res, 'Usuário já é membro desta organização', 409);
      return;
    }

    const newMembership = await prisma.organizationMember.create({
      data: {
        organizationId: id,
        userId: invitedUser.id,
        role: role,
        isPaying: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        },
      },
    });

    sendSuccess(res, newMembership, 'Membro convidado com sucesso', 201);
  } catch (error) {
    console.error('Error in inviteMember:', error);
    sendError(res, 'Erro ao convidar membro', 500);
  }
};

export const removeMember = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user!.id;

    // Verificar se o usuário é admin da organização
    const membership = await prisma.organizationMember.findFirst({
      where: {
        organizationId: id,
        userId,
        role: 'ADMIN',
      },
    });

    if (!membership) {
      sendError(res, 'Acesso negado', 403);
      return;
    }

    // Não pode remover o admin pagante
    const memberToRemove = await prisma.organizationMember.findUnique({
      where: { id: memberId },
    });

    if (memberToRemove?.isPaying) {
      sendError(res, 'Não é possível remover o administrador pagante', 400);
      return;
    }

    await prisma.organizationMember.delete({
      where: { id: memberId },
    });

    sendSuccess(res, null, 'Membro removido com sucesso');
  } catch (error) {
    console.error('Error in removeMember:', error);
    sendError(res, 'Erro ao remover membro', 500);
  }
};
