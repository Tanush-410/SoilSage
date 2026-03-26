import './globals.css'
import { I18nProvider } from '../lib/i18n'

export const metadata = {
  title: 'SoilSage — Smart Irrigation System',
  description: 'AI-powered FAO-56 based smart irrigation for precision agriculture',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body><I18nProvider>{children}</I18nProvider></body>
    </html>
  )
}
