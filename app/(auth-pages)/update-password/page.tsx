'use client';

import { UpdatePasswordForm } from './updatePasswordForm';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Suspense } from 'react'; // Import Suspense

// Wrapper component to ensure client-side hooks run within Suspense boundary
function UpdatePasswordPageContent() {
  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  const handleError = (message: string) => {
    toast.error(message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Update Your Password</CardTitle>
        </CardHeader>
        <CardContent>
          <UpdatePasswordForm onSuccess={handleSuccess} onError={handleError} />
        </CardContent>
      </Card>
    </div>
  );
}


export default function UpdatePasswordPage() {
  // Wrap the component using client-side hooks (like useRouter in the form)
  // with Suspense as recommended by Next.js for pages using searchParams or hash
  // Supabase relies on the URL hash fragment for the reset token.
  return (
    <Suspense fallback={<div>Loading...</div>}>
       <UpdatePasswordPageContent />
    </Suspense>
  );
}
