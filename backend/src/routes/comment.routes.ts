import { Router } from 'express';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route   POST /api/comments
 * @desc    Criar novo comentário
 * @access  Private
 */
router.post('/', createComment);

/**
 * @route   GET /api/comments
 * @desc    Listar comentários de um post
 * @access  Private
 */
router.get('/', getComments);

/**
 * @route   PUT /api/comments/:id
 * @desc    Atualizar comentário
 * @access  Private
 */
router.put('/:id', updateComment);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Excluir comentário
 * @access  Private
 */
router.delete('/:id', deleteComment);

export default router;
