// app/layout.jsx
import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Facebook Clone',
  description: 'A Facebook clone built with Next.js and Supabase',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
