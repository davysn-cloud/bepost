export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'TEAM' | 'APPROVER'
  isActive: boolean
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  createdAt: string
}

export interface Post {
  id: string
  title?: string
  caption: string
  hashtags?: string
  status: PostStatus
  scheduledFor?: string
  publishedAt?: string
  createdAt: string
  media: PostMedia[]
  createdBy: {
    id: string
    name: string
    email: string
  }
  instagramAccount: {
    username: string
  }
}

export type PostStatus =
  | 'DRAFT'
  | 'IN_REVIEW_DESIGN'
  | 'IN_REVIEW_COPY'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'PUBLISHED'
  | 'REJECTED'

export interface PostMedia {
  id: string
  url: string
  type: string
  order: number
}

export interface Comment {
  id: string
  content: string
  type: 'TEXT' | 'VISUAL'
  posX?: number
  posY?: number
  isResolved: boolean
  createdAt: string
  user: {
    id: string
    name: string
    email: string
  }
}

export interface InstagramAccount {
  id: string
  instagramId: string
  username: string
  isActive: boolean
  createdAt: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
