import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ceed by BRAIVE — Creative Seed for Ad Agencies',
  description: 'Generate compliant ad creative across 80+ sizes and 13 platforms. Upload once, export everywhere.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
