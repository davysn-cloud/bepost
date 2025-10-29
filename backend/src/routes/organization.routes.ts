import { Router } from 'express';
import {
  createOrganization,
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  inviteMember,
  removeMember,
} from '../controllers/organization.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * @route   POST /api/organizations
 * @desc    Criar nova organização
 * @access  Private (Admin)
 */
router.post('/', authorize('ADMIN'), createOrganization);

/**
 * @route   GET /api/organizations
 * @desc    Listar organizações do usuário
 * @access  Private
 */
router.get('/', getOrganizations);

/**
 * @route   GET /api/organizations/:id
 * @desc    Obter detalhes de uma organização
 * @access  Private
 */
router.get('/:id', getOrganization);

/**
 * @route   PUT /api/organizations/:id
 * @desc    Atualizar organização
 * @access  Private (Admin da organização)
 */
router.put('/:id', updateOrganization);

/**
 * @route   DELETE /api/organizations/:id
 * @desc    Excluir organização
 * @access  Private (Admin pagante)
 */
router.delete('/:id', deleteOrganization);

/**
 * @route   POST /api/organizations/:id/members
 * @desc    Convidar membro para organização
 * @access  Private (Admin da organização)
 */
router.post('/:id/members', inviteMember);

/**
 * @route   DELETE /api/organizations/:id/members/:memberId
 * @desc    Remover membro da organização
 * @access  Private (Admin da organização)
 */
router.delete('/:id/members/:memberId', removeMember);

export default router;
