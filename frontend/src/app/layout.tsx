import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/Providers'
import { BackendStatus } from '@/components/BackendStatus'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BePost - Instagram Content Management',
  description: 'Plataforma de colaboração e aprovação de conteúdo para Instagram',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>
          {children}
          <BackendStatus />
        </Providers>
      </body>
    </html>
  )
}
