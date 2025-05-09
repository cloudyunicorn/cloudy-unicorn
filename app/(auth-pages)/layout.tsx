import Header from '@/components/header';
import Modetoggle from '@/components/header/mode-toggle';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="flex justify-end pr-6 pt-2">
        <Modetoggle />
      </div>
      <div className="flex justify-center items-center w-full">{children}</div>
    </>
  );
}
