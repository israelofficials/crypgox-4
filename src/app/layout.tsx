import { DM_Sans } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from 'next-themes'
import Aoscompo from '@/utils/aos'
import AppShell from '@/components/Layout/AppShell'
import { AuthProvider } from '@/contexts/AuthContext'
const font = DM_Sans({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${font.className}`}>
        <ThemeProvider
          attribute='class'
          enableSystem={true}
          defaultTheme='system'>
          <AuthProvider>
            <Aoscompo>
              <AppShell>{children}</AppShell>
            </Aoscompo>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
