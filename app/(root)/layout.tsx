import Footer from '@/components/Footer';
import Header from '@/components/header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Add overflow-x-hidden here
    <div className="flex flex-col h-screen mx-auto overflow-x-hidden">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
