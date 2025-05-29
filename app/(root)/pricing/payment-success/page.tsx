import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';

export default function PaymentSuccess() {
  return (
    <main className="flex justify-center p-20">
      <Card>
        <div>
          <CardHeader>Thank You!</CardHeader>
          <CardContent>Your payment was successfull for ₹ 499</CardContent>
        </div>
      </Card>
    </main>
  );
}
