import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function TermsPage() {
  return (
    <div className="container max-w-4xl py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
        <Separator className="my-6" />
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using our services, you agree to be bound by these terms. 
              If you disagree with any part, you may not access the service.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Subscription Terms</h2>
            <p className="text-muted-foreground">
              Subscriptions are billed monthly. You can cancel anytime but no refunds 
              are provided for partial months. We reserve the right to modify subscription 
              fees with 30 days notice.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Responsibilities</h2>
            <p className="text-muted-foreground">
              You are responsible for maintaining the confidentiality of your account and 
              password. You agree to notify us immediately of any unauthorized access.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              We are not liable for any indirect, incidental, or consequential damages 
              arising from your use of our services.
            </p>
          </section>
        </div>
      </Card>
    </div>
  )
}
