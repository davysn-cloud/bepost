import { PaginationParams } from '../types';

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

export const getPagination = (page?: string | number, limit?: string | number): PaginationParams => {
  const parsedPage = typeof page === 'string' ? parseInt(page) : (page || 1);
  const parsedLimit = typeof limit === 'string' ? parseInt(limit) : (limit || 10);

  const validPage = Math.max(1, parsedPage);
  const validLimit = Math.min(100, Math.max(1, parsedLimit));

  return {
    page: validPage,
    limit: validLimit,
    skip: (validPage - 1) * validLimit,
  };
};

export const formatPostStatus = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    DRAFT: 'Rascunho',
    IN_REVIEW_DESIGN: 'Em Revisão (Design)',
    IN_REVIEW_COPY: 'Em Revisão (Copy)',
    PENDING_APPROVAL: 'Aprovação Final',
    APPROVED: 'Aprovado',
    SCHEDULED: 'Agendado',
    PUBLISHED: 'Publicado',
    REJECTED: 'Rejeitado',
  };
  return statusMap[status] || status;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
