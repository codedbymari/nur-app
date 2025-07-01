// components/layout/Header.js
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getUser, signOut } from '../../lib/auth';
import Button from '../ui/Button';

// Language content for header
const headerContent = {
  no: {
    dashboard: "Dashboard",
    matches: "Matcher", 
    profile: "Profil",
    logout: "Logg ut",
    checkStatus: "Sjekk status",
    applyMembership: "Søk medlemskap"
  },
  en: {
    dashboard: "Dashboard",
    matches: "Matches",
    profile: "Profile", 
    logout: "Sign out",
    checkStatus: "Check status",
    applyMembership: "Apply membership"
  }
};

export default function Header({ language = 'no', onLanguageChange }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const t = headerContent[language];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await getUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toggleLanguage = () => {
    if (onLanguageChange) {
      onLanguageChange(language === 'no' ? 'en' : 'no');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-[#780000] hover:text-[#C1121F] transition-colors">
            NÜR
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            {loading ? (
              <div className="animate-pulse">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </div>
            ) : user ? (
              <>
                <Link 
                  href="/app" 
                  className="text-gray-700 hover:text-[#780000] transition-colors"
                >
                  {t.dashboard}
                </Link>
                <Link 
                  href="/app/matches" 
                  className="text-gray-700 hover:text-[#780000] transition-colors"
                >
                  {t.matches}
                </Link>
                <Link 
                  href="/app/profil" 
                  className="text-gray-700 hover:text-[#780000] transition-colors"
                >
                  {t.profile}
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                >
                  {t.logout}
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/status" 
                  className="text-gray-700 hover:text-[#780000] transition-colors"
                >
                  {t.checkStatus}
                </Link>
                <Link href="/soknad">
                  <Button size="sm">
                    {t.applyMembership}
                  </Button>
                </Link>
              </>
            )}
            
            {/* Language Toggle */}
            {onLanguageChange && (
              <button
                onClick={toggleLanguage}
                className="ml-4 px-3 py-1 text-sm font-medium text-[#780000] hover:text-[#C1121F] border border-[#780000] hover:border-[#C1121F] rounded transition-colors"
                aria-label={language === 'no' ? 'Switch to English' : 'Bytt til norsk'}
              >
                {language === 'no' ? 'EN' : 'NO'}
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}