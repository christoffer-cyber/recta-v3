import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Recta - AI-Powered Organizational Intelligence',
  description: 'Smart rekrytering och org-design för växande företag',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
