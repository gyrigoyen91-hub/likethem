import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Providers from '@/components/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LikeThem - Dress like the ones you admire',
  description: 'Exclusive fashion marketplace curated by influencers. Not everyone can sell here. Not everyone can shop here.',
  keywords: 'fashion, influencers, curated, exclusive, marketplace, style, luxury, editorial',
  authors: [{ name: 'LikeThem' }],
  creator: 'LikeThem',
  publisher: 'LikeThem',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://likethem.com'),
  openGraph: {
    title: 'LikeThem - Dress like the ones you admire',
    description: 'Exclusive fashion marketplace curated by influencers.',
    url: 'https://likethem.com',
    siteName: 'LikeThem',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'LikeThem - Exclusive Fashion Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LikeThem - Dress like the ones you admire',
    description: 'Exclusive fashion marketplace curated by influencers.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>LikeThem - Curated Fashion</title>
        <meta name="description" content="Discover curated fashion pieces from your favorite influencers" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>
          <Header />
          <main className="pt-16">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
} 