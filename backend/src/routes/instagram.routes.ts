import { Router } from 'express';
import {
  initiateAuth,
  oauthCallback,
  getInstagramAccounts,
  disconnectAccount,
} from '../controllers/instagram.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/instagram/auth
 * @desc    Iniciar autenticação OAuth com Instagram
 * @access  Private
 */
router.get('/auth', authenticate, initiateAuth);

/**
 * @route   GET /api/instagram/callback
 * @desc    Callback do OAuth do Instagram
 * @access  Public
 */
router.get('/callback', oauthCallback);

/**
 * @route   GET /api/instagram/accounts
 * @desc    Listar contas do Instagram conectadas
 * @access  Private
 */
router.get('/accounts', authenticate, getInstagramAccounts);

/**
 * @route   DELETE /api/instagram/accounts/:id
 * @desc    Desconectar conta do Instagram
 * @access  Private (Admin)
 */
router.delete('/accounts/:id', authenticate, disconnectAccount);

export default router;
