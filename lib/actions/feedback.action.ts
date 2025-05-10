'use server'

import { FeedbackStatus } from '@prisma/client'
import prisma from '@/lib/prisma'

export async function submitFeedback(authId: string, content: string) {
  console.log('Submitting feedback for auth user:', authId)
  try {
    // Check rate limit (1 feedback per minute)
    const user = await prisma.user.findUnique({
      where: { authId }
    })
    if (!user) {
      throw new Error('User record not found in database')
    }

    const lastFeedback = await prisma.feedback.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    if (lastFeedback) {
      const timeSinceLastFeedback = Date.now() - lastFeedback.createdAt.getTime()
      if (timeSinceLastFeedback < 60000) { // 60,000ms = 1 minute
        throw new Error('RATE_LIMIT_EXCEEDED')
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: user.id,
        content,
        status: FeedbackStatus.OPEN,
        metadata: {
          browser: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
        }
      }
    })
    console.log('Feedback saved successfully:', feedback)
    return feedback
  } catch (error) {
    console.error('Error submitting feedback:', error)
    throw error
  }
}
