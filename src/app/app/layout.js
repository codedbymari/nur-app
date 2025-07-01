// app/app/layout.js (Protected App Layout)
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getUser, getProfile } from '../../lib/auth'
import { blokerSkjermbilder } from '../../lib/utils'

export default function AppLayout({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    blokerSkjermbilder()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await getUser()
      if (!currentUser) {
        router.push('/')
        return
      }

      const userProfile = await getProfile(currentUser.id)
      setUser(currentUser)
      setProfile(userProfile)
    } catch (error) {
      console.error('Feil ved autentisering:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nur-burgundy mx-auto mb-4"></div>
          <p className="text-nur-burgundy">Laster...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="min-h-screen bg-white screenshot-blocked">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/app" className="text-2xl font-bold text-nur-burgundy">
              NÜR
            </Link>
            
            <div className="flex items-center space-x-1">
              <Link 
                href="/app" 
                className="px-3 py-2 rounded-md text-sm font-medium text-nur-burgundy hover:bg-nur-beige"
              >
                Hjem
              </Link>
              <Link 
                href="/app/matches" 
                className="px-3 py-2 rounded-md text-sm font-medium text-nur-burgundy hover:bg-nur-beige"
              >
                Matcher
              </Link>
              <Link 
                href="/app/chat" 
                className="px-3 py-2 rounded-md text-sm font-medium text-nur-burgundy hover:bg-nur-beige"
              >
                Chat
              </Link>
              <Link 
                href="/app/events" 
                className="px-3 py-2 rounded-md text-sm font-medium text-nur-burgundy hover:bg-nur-beige"
              >
                Eventer
              </Link>
              <Link 
                href="/app/profil" 
                className="px-3 py-2 rounded-md text-sm font-medium text-nur-burgundy hover:bg-nur-beige"
              >
                Profil
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 blur-when-hidden">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0">
        <div className="flex justify-around py-2">
          <Link href="/app" className="flex flex-col items-center py-2 px-3">
            <span className="text-xs text-nur-burgundy">Hjem</span>
          </Link>
          <Link href="/app/matches" className="flex flex-col items-center py-2 px-3">
            <span className="text-xs text-nur-burgundy">Matcher</span>
          </Link>
          <Link href="/app/chat" className="flex flex-col items-center py-2 px-3">
            <span className="text-xs text-nur-burgundy">Chat</span>
          </Link>
          <Link href="/app/events" className="flex flex-col items-center py-2 px-3">
            <span className="text-xs text-nur-burgundy">Eventer</span>
          </Link>
          <Link href="/app/profil" className="flex flex-col items-center py-2 px-3">
            <span className="text-xs text-nur-burgundy">Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  )
}