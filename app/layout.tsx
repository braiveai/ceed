import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ceed by BRAIVE — Ad Creative at Scale',
  description: 'Generate 80+ compliant ad sizes across every platform from a single upload.',
}

const FONTS = ['Montserrat','Inter','Poppins','Lato','Raleway','Oswald','Merriweather','Playfair+Display','Nunito','Work+Sans','DM+Sans','Outfit','Barlow','Plus+Jakarta+Sans']

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontQuery = FONTS.map(f => `family=${f}:wght@400;600;700`).join('&')
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href={`https://fonts.googleapis.com/css2?${fontQuery}&display=swap`} rel="stylesheet" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
