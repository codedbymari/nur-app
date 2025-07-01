// src/app/layout.js (Root Layout)
import './globals.css'
import { Inter } from 'next/font/google'
import ClientErrorHandler from '../components/ClientErrorHandler'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'NÜR - Halal Matchmaking',
  description: 'Seriøs matchmakingplattform for muslimer med ærlege intensjoner om ekteskap',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NÜR'
  }
}

export const viewport = {
  themeColor: '#780000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 'no',
}

export default function RootLayout({ children }) {
  return (
    <html lang="no">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={viewport.themeColor} />
        <meta name="viewport" content={`width=${viewport.width}, initial-scale=${viewport.initialScale}, maximum-scale=${viewport.maximumScale}, user-scalable=${viewport.userScalable}`} />
        {/* Fixed typo: puclic -> public */}
        <link rel="apple-touch-icon" href="/public/nur.svg" />
        {/* Updated deprecated meta tag */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NÜR" />
      </head>
      <body className={`${inter.className} min-h-screen bg-white flex flex-col`}>
        <ClientErrorHandler />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(error) {
                    console.log('Service Worker registration failed:', error);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}