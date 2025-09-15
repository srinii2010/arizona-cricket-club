import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Arizona Cricket Club - Home of Vipers, Rattlers, Black Mambas & Cobras',
  description: 'Arizona Cricket Club - Promoting cricket in Arizona since 2003. Natural turf wicket, home ground at Nichols Park Basin in Gilbert.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}