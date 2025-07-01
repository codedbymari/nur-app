'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import SoknadForm from '@/components/forms/SoknadForm'

export default function SoknadPage() {
  const router = useRouter()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmitSuccess = () => {
    setSubmitted(true)
    setTimeout(() => {
      router.push('/status')
    }, 3000)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-nur-burgundy mb-4">
                Søknad mottatt!
              </h2>
              <p className="text-gray-600">
                Takk for din søknad. Vi vil gjennomgå den og kontakte deg innen 3-5 virkedager.
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Du blir omdirigert til statussiden...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <SoknadForm onSuccess={handleSubmitSuccess} userLogin="codedbymari" submissionDate="2025-06-30 18:59:22" />
        </div>
      </main>
      <Footer />
    </div>
  )
}