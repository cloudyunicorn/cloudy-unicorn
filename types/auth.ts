// src/types/auth.ts
export interface User {
  id: string
  email: string
  createdAt: Date
  subscription?: Subscription
}

export interface Session {
  user: User | null
  isLoading: boolean
}

export interface Subscription {
  tier: 'free' | 'pro' | 'business'
  limits: {
    scheduledPosts: number
    aiCredits: number
  }
  renewsAt: Date
}

export interface AuthError {
  code: string
  message: string
}
