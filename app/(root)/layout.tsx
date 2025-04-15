import Footer from '@/components/Footer';
import Header from '@/components/header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen mx-auto">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
