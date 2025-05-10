'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { MessageCircle } from 'lucide-react'
import { submitFeedback } from '@/lib/actions/feedback.action'
import { getUserId } from '@/lib/actions/user.action'

export function FeedbackForm() {
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const userId = await getUserId()
      if (!userId) {
        throw new Error('User not authenticated')
      }
      await submitFeedback(userId, feedback)
      toast.success('Thank you for your feedback!')
      setFeedback('')
    } catch (error) {
      if (error instanceof Error && error.message === 'RATE_LIMIT_EXCEEDED') {
        toast.error('Please wait for some time between feedback submissions')
      } else {
        toast.error('Failed to submit feedback')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Share your feedback..."
          rows={3}
          required
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          <MessageCircle className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </form>
    </div>
  )
}
