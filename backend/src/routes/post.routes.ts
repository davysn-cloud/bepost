import { Router } from 'express';
import {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
  updatePostStatus,
  uploadPostMedia,
  deletePostMedia,
} from '../controllers/post.controller';
import { authenticate } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route   POST /api/posts
 * @desc    Criar novo post
 * @access  Private
 */
router.post('/', createPost);

/**
 * @route   GET /api/posts
 * @desc    Listar posts (com filtros)
 * @access  Private
 */
router.get('/', getPosts);

/**
 * @route   GET /api/posts/:id
 * @desc    Obter detalhes de um post
 * @access  Private
 */
router.get('/:id', getPost);

/**
 * @route   PUT /api/posts/:id
 * @desc    Atualizar post
 * @access  Private
 */
router.put('/:id', updatePost);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Excluir post
 * @access  Private
 */
router.delete('/:id', deletePost);

/**
 * @route   PATCH /api/posts/:id/status
 * @desc    Atualizar status do post
 * @access  Private
 */
router.patch('/:id/status', updatePostStatus);

/**
 * @route   POST /api/posts/:id/media
 * @desc    Upload de mídia para o post
 * @access  Private
 */
router.post('/:id/media', upload.array('media', 10), uploadPostMedia);

/**
 * @route   DELETE /api/posts/:id/media/:mediaId
 * @desc    Excluir mídia do post
 * @access  Private
 */
router.delete('/:id/media/:mediaId', deletePostMedia);

export default router;
