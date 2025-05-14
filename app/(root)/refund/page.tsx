import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function RefundPage() {
  return (
    <div className="container max-w-4xl py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Refund Policy</h1>
        <Separator className="my-6" />
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">Subscription Cancellation</h2>
            <p className="text-muted-foreground">
              After the trial period, you may cancel your subscription at any time. 
              Your access will continue until the end of the current billing period, 
              but will not renew for the following month.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold mb-3">Refund Policy</h2>
            <p className="text-muted-foreground">
              All subscription payments are non-refundable. Once a payment is made 
              for a billing period, we do not provide refunds for that period, 
              regardless of actual usage or cancellation date during that period.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold mb-3">How to Cancel</h2>
            <p className="text-muted-foreground">
              You can cancel your subscription at any time through your account settings. 
              The cancellation will take effect at the end of your current billing cycle.
            </p>
          </section>
        </div>
      </Card>
    </div>
  )
}
