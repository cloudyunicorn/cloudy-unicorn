import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import SendMessageButton from '@/components/SendMessageButton'

export default function ContactPage() {
  return (
    <div className="container max-w-4xl py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
        <Separator className="my-6" />

        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <Input id="email" type="email" placeholder="your@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="subject">
                Subject
              </label>
              <Input id="subject" placeholder="How can we help?" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" htmlFor="message">
                Message
              </label>
              <Textarea id="message" placeholder="Your message..." rows={5} />
            </div>

              <SendMessageButton />
            </div>

            <Separator className="my-8" />

            <div className="space-y-2 text-muted-foreground">
              <h2 className="text-lg font-semibold">Other Ways to Reach Us</h2>
              <p>Email: s.rajat55@gmail.com</p>
              <p>Address: 123 Fitness Street, Wellness City</p>
            </div>
        </div>
      </Card>
    </div>
  )
}
