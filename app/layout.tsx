import type { Metadata } from 'next';
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import Header from "@/components/Header";

export const metadata: Metadata = {
  // Default tab title
  title: {
    default: 'LikeThem',
    template: '%s · LikeThem',
  },
  description:
    'Curated fashion by top influencers. Exclusive access to the pieces that matter.',
  // Nice-to-have preview data
  openGraph: {
    siteName: 'LikeThem',
    title: 'LikeThem',
    description:
      'Curated fashion by top influencers. Exclusive access to the pieces that matter.',
    type: 'website',
    locale: 'en_US',
    url: 'https://likethem.io',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@likethem',
    title: 'LikeThem',
    description:
      'Curated fashion by top influencers. Exclusive access to the pieces that matter.',
  },
  // Tell Next where our icons live (added in step 2)
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' }, // favicon
      { url: '/favicon.ico' },                     // fallback
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-white text-neutral-900 antialiased">
        <ClientProviders>
          <Header />
          {children}
        </ClientProviders>
      </body>
    </html>
  );
} 