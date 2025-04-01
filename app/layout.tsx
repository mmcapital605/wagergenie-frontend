import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'WagerGenie - AI Sports Betting Assistant',
  description: 'Get winning picks backed by advanced AI analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-gradient-to-b from-purple-900 via-blue-900 to-black text-white">
          {children}
        </main>
      </body>
    </html>
  )
} 