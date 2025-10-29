import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/prisma';
import { generateToken } from '../utils/jwt';
import { sendSuccess, sendError } from '../utils/response';
import { validateEmail } from '../utils/helpers';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      sendError(res, 'Email, senha e nome são obrigatórios', 400);
      return;
    }

    if (!validateEmail(email)) {
      sendError(res, 'Email inválido', 400);
      return;
    }

    if (password.length < 6) {
      sendError(res, 'A senha deve ter no mínimo 6 caracteres', 400);
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      sendError(res, 'Email já cadastrado', 409);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'ADMIN', // Primeiro usuário é sempre ADMIN
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    sendSuccess(res, { user, token }, 'Usuário criado com sucesso', 201);
  } catch (error) {
    console.error('Error in register:', error);
    sendError(res, 'Erro ao criar usuário', 500);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      sendError(res, 'Email e senha são obrigatórios', 400);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      sendError(res, 'Credenciais inválidas', 401);
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      sendError(res, 'Credenciais inválidas', 401);
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const { password: _, ...userWithoutPassword } = user;

    sendSuccess(res, { user: userWithoutPassword, token }, 'Login realizado com sucesso');
  } catch (error) {
    console.error('Error in login:', error);
    sendError(res, 'Erro ao fazer login', 500);
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        memberships: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!user) {
      sendError(res, 'Usuário não encontrado', 404);
      return;
    }

    sendSuccess(res, user);
  } catch (error) {
    console.error('Error in getMe:', error);
    sendError(res, 'Erro ao buscar dados do usuário', 500);
  }
};
