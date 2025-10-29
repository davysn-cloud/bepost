import { Router } from 'express';
import {
  getPostByToken,
  approvePost,
  rejectPost,
  requestChanges,
} from '../controllers/approval.controller';

const router = Router();

// Rotas públicas (sem autenticação) - usam token de aprovação

/**
 * @route   GET /api/approval/:token
 * @desc    Obter post por token de aprovação
 * @access  Public (com token)
 */
router.get('/:token', getPostByToken);

/**
 * @route   POST /api/approval/:token/approve
 * @desc    Aprovar post
 * @access  Public (com token)
 */
router.post('/:token/approve', approvePost);

/**
 * @route   POST /api/approval/:token/reject
 * @desc    Rejeitar post
 * @access  Public (com token)
 */
router.post('/:token/reject', rejectPost);

/**
 * @route   POST /api/approval/:token/request-changes
 * @desc    Solicitar alterações no post
 * @access  Public (com token)
 */
router.post('/:token/request-changes', requestChanges);

export default router;
