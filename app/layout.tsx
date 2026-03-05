import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700'] })

export const metadata: Metadata = {
  title: 'Patchbay',
  description: 'A/V technical documentation and diagramming platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ibmPlexSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
