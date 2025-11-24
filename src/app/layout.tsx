import type { Metadata } from 'next'
import './globals.css'

// Fallback font loading to handle build environment without network
let ibmPlexMono: any = {
  className: 'font-mono',
  variable: '--font-ibm-mono'
}

try {
  const { IBM_Plex_Mono } = require('next/font/google')
  ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ibm-mono',
    display: 'swap',
})
} catch (error) {
  console.warn('Google Fonts not available, using fallback font')
}

export const metadata: Metadata = {
  title: 'Major Market Events',
  description: 'AI-powered market events tracker',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${ibmPlexMono.className} min-h-screen bg-background font-mono antialiased`}>
        {children}
      </body>
    </html>
  )
}
