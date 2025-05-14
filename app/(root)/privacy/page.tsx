import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl py-12">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <Separator className="my-6" />
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Data Collection</h2>
            <p className="text-muted-foreground">
              We collect personal information you provide when creating an account,
              using our services, or contacting us. This may include name, email,
              and usage data.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Data Usage</h2>
            <p className="text-muted-foreground">
              Your data is used to provide and improve our services, process payments,
              and communicate with you. We do not sell your personal information to
              third parties.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Cookies</h2>
            <p className="text-muted-foreground">
              We use cookies to enhance your experience. You can disable cookies
              in your browser settings, but some features may not work properly.
            </p>
          </section>

          <Separator className="my-6" />

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-muted-foreground">
              We implement security measures to protect your data. However, no
              method of transmission over the internet is 100% secure.
            </p>
          </section>
        </div>
      </Card>
    </div>
  )
}
