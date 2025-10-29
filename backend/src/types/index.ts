import { Request } from 'express';
import { User, UserRole } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
  organizationId?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreatePostDTO {
  organizationId: string;
  instagramAccountId: string;
  title?: string;
  caption: string;
  hashtags?: string;
  scheduledFor?: Date;
  media: {
    url: string;
    type: string;
    order: number;
  }[];
}

export interface UpdatePostDTO {
  title?: string;
  caption?: string;
  hashtags?: string;
  scheduledFor?: Date;
  status?: string;
}

export interface CreateCommentDTO {
  postId: string;
  mediaId?: string;
  content: string;
  type: 'TEXT' | 'VISUAL';
  posX?: number;
  posY?: number;
}

export interface ApprovalActionDTO {
  action: 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';
  reason?: string;
}

export interface InstagramAuthResponse {
  access_token: string;
  user_id: string;
  expires_in: number;
}

export interface InstagramUserProfile {
  id: string;
  username: string;
  account_type: string;
  media_count: number;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface JobData {
  postId: string;
  organizationId: string;
  instagramAccountId: string;
}
