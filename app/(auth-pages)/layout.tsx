import Header from '@/components/header';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      <div className="flex justify-center items-center w-full">
        {children}
      </div>
    </>
  );
}
