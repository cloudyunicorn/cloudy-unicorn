import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';

export default function PaymentSuccess({
  searchParams,
}: {
  searchParams: { amount: string };
}) {
  const { amount } = searchParams;
  return (
    <main className="flex justify-center p-20">
      <Card>
        <div>
          <CardHeader>Thank You!</CardHeader>
          <CardContent>Your payment was successfull for ₹ {amount}</CardContent>
        </div>
      </Card>
    </main>
  );
}
