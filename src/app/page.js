// app/page.js 
'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Button from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import './globals.css'

// Language content
const content = {
  no: {
    title: "NÜR",
    heroSubtitle: "Vi er her for å finne din match",
    mission: "Vår misjon er å knytte muslimske singler sammen med potensielle livsledsagere basert på tillit, verdier og respekt. NÜR ble født fra en tro på at alle fortjener en partner som forstår og kompletterer dem. Vi introduserer våre klienter til best mulige match, for å hjelpe deg finne en ektefelle og bygge meningsfulle halal-forhold.",
    applyAccess: "Søk om medlemskap",
    checkStatus: "Sjekk medlemskapsstatus",
    servicesTitle: "Våre halal ekteskapsløsninger",
    servicesDesc: "Vi jobber med deg, ikke for deg. Sammen sikter vi mot å skape halal-partnerskap bygget for å vare og i henhold til dine forventninger.",
    promise1: "Respekterer din individualitet, privatliv og verdier",
    promise2: "Tilbyr en dømningsfri, støttende opplevelse",
    promise3: "Holder din reise 100% privat og sikker",
    promise4: "Matcher deg med omsorg, kompatibilitet og oppmerksomhet på detaljer",
    journeyTitle: "La oss gjøre ditt ekteskap til virkelighet",
    journeyDesc: "Din reise til et tilfredsstillende og velsignet ekteskap starter her, og vi er hedret over å være en del av det. Å finne den rette ektefellen er et viktig skritt, og vi er her for å veilede deg med omsorg, forståelse og diskresjon. Vi tar oss tid til å forstå dine verdier, og kobler deg sammen med likesinnede muslimer som deler dine ambisjoner.",
    howItWorks: "Hvordan matchmaking-tjenesten fungerer",
    step1Title: "Forstå dine verdier",
    step1Desc: "Vår prosess starter med å forstå dine verdier, livsstil og ambisjoner gjennom et detaljert spørreskjema.",
    step2Title: "Algoritmisk analyse",
    step2Desc: "Våre algoritmer vurderer nøye potensielle matcher basert på kompatibilitet, tro og langsiktige mål.",
    step3Title: "Trygg introduksjon",
    step3Desc: "Vi tilrettelegger introduksjoner på en sikker og respektfull måte.",
    step4Title: "Kontinuerlig støtte",
    step4Desc: "Vi følger opp gjennom hele prosessen frem til dere finner hverandre.",
    faqTitle: "Populære spørsmål",
    faq1Q: "Hvordan fungerer matchmaking-tjenesten?",
    faq1A: "Vår prosess starter med å forstå dine verdier, livsstil og ambisjoner gjennom et detaljert spørreskjema. Våre algoritmer vurderer deretter nøye potensielle matcher basert på kompatibilitet, tro og langsiktige mål. Deretter tilrettelegges introduksjoner på en sikker og respektfull måte.",
    faq2Q: "Hva er forskjellen fra dating-apper?",
    faq2A: "I motsetning til sveip-baserte dating-apper, tilbyr vi en personlig, halal og verdibasert tilnærming til matchmaking. Vi fokuserer på å finne meningsfulle og kompatible forbindelser forankret i islamske verdier, uten distraksjoner fra moderne dating-kultur.",
    faq3Q: "Holdes informasjonen min konfidensiell?",
    faq3A: "Ja, ditt privatliv er vår toppprioritet. Vi opprettholder en sikker og konfidensiell prosess, og sikrer at dine detaljer håndteres diskret, noe som gir deg trygghet mens du søker etter din ideelle muslimske partner.",
    faq4Q: "Matcher dere kun muslimer?",
    faq4A: "Ja, våre matchmaking-tjenester er eksklusivt skreddersydd for muslimer. Vårt fokus er å hjelpe single muslimer med å knytte kontakt med likesinnede individer som deler deres tro, verdier og ambisjoner for et halal og tilfredsstillende ekteskap.",
    faq5Q: "Hva gjør en vellykket match?",
    faq5A: "En vellykket match er basert på delte verdier, kompatibilitet og langsiktige mål. Og så selvfølgelig ekteskap!",
    ctaButton: "Start din reise"
  },
  en: {
    title: "NÜR",
    heroSubtitle: "We're Here to Find Your Match",
    mission: "Our mission is to connect Muslim Singles with potential life partners based on trust, values, and respect. NÜR was born from a belief that everyone deserves a partner who understands and complements them. We introduce our clients to the best possible match, to help you find a spouse and build meaningful Halal relationships.",
    applyAccess: "Apply for membership",
    checkStatus: "Check membership status",
    servicesTitle: "Our Halal Matrimonial Services",
    servicesDesc: "We work with you, not for you. Together, we aim to create halal partnerships built to last and according to your expectations.",
    promise1: "Respect your individuality, privacy, and values",
    promise2: "Offer a judgment-free, supportive experience",
    promise3: "Keep your journey 100% private and secure",
    promise4: "Match you with care, compatibility, and attention to detail",
    journeyTitle: "Let's Make Your Marriage a Reality",
    journeyDesc: "Your journey to a fulfilling and blessed marriage starts here, and we are honored to be part of it. Finding the right spouse is a significant step, and we are here to guide you with care, understanding, and discretion. We take the time to understand your values, and connect you with like-minded Muslims who share your aspirations.",
    howItWorks: "How does the matchmaking service work?",
    step1Title: "Understanding your values",
    step1Desc: "Our process starts with understanding your values, lifestyle, and aspirations through a detailed questionnaire.",
    step2Title: "Algorithmic analysis",
    step2Desc: "Our algorithm then carefully vet potential matches based on compatibility, faith, and long-term goals.",
    step3Title: "Secure introductions",
    step3Desc: "Then it's facilitated introductions securely and respectfully.",
    step4Title: "Ongoing support",
    step4Desc: "We continue to guide you through the process until you find each other.",
    faqTitle: "Popular Questions",
    faq1Q: "How does the matchmaking service work?",
    faq1A: "Our process starts with understanding your values, lifestyle, and aspirations through a detailed questionnaire. Our algorithm then carefully vet potential matches based on compatibility, faith, and long-term goals. Then it's facilitated introductions securely and respectfully.",
    faq2Q: "What's your difference to dating apps?",
    faq2A: "Unlike swipe-based dating apps, we provide a personalized, halal, and value-driven approach to matchmaking. We focus on finding meaningful and compatible connections rooted in Islamic values, without the distractions of modern dating culture.",
    faq3Q: "Is my information kept confidential?",
    faq3A: "Yes, your privacy is our top priority. We maintain a secure and confidential process, ensuring that your details are handled discreetly, giving you peace of mind while searching for your ideal Muslim partner.",
    faq4Q: "Do you match only Muslims?",
    faq4A: "Yes, our matchmaking services are exclusively tailored for Muslims. Our focus is on helping single Muslims connect with like-minded individuals who share their faith, values, and aspirations for a halal and fulfilling marriage. By prioritizing Islamic principles and cultural compatibility, we ensure that every match aligns with the unique needs and preferences of our clients.",
    faq5Q: "What makes a successful match?",
    faq5A: "A successful match is based on shared values, compatibility, and long-term goals. And then of course marriage!",
    ctaButton: "Start Your Journey"
  }
}

export default function HomePage() {
  const [language, setLanguage] = useState('no')
  const t = content[language]

  const toggleLanguage = () => {
    setLanguage(language === 'no' ? 'en' : 'no')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header language={language} onLanguageChange={setLanguage} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="nur-gradient text-white py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-6xl font-bold mb-8 leading-tight">
              {t.title}
            </h1>
            <h2 className="text-3xl font-semibold mb-8 opacity-95">
              {t.heroSubtitle}
            </h2>
            <p className="text-lg mb-10 opacity-90 max-w-4xl mx-auto leading-relaxed">
              {t.mission}
            </p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-6 sm:flex sm:justify-center">
              <Link href="/soknad">
                <Button size="lg" className="bg-white text-nur-burgundy hover:bg-nur-beige px-8 py-4 text-lg font-semibold">
                  {t.applyAccess}
                </Button>
              </Link>
              <Link href="/status">
                <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-nur-burgundy px-8 py-4 text-lg">
                  {t.checkStatus}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Our Services */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-nur-burgundy mb-6">
                {t.servicesTitle}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
                {t.servicesDesc}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-nur-burgundy rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-gray-700 leading-relaxed">
                    {t.promise1}
                  </p>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-nur-burgundy rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-gray-700 leading-relaxed">
                    {t.promise2}
                  </p>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-nur-burgundy rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-gray-700 leading-relaxed">
                    {t.promise3}
                  </p>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-6 h-6 bg-nur-burgundy rounded-full flex-shrink-0 mt-1"></div>
                  <p className="text-gray-700 leading-relaxed">
                    {t.promise4}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* Journey Section */}
        <section className="bg-nur-beige py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-nur-burgundy mb-8">
              {t.journeyTitle}
            </h2>
            <p className="text-xl text-gray-700 leading-relaxed max-w-4xl mx-auto mb-10">
              {t.journeyDesc}
            </p>
            <Link href="/soknad">
              <Button size="lg" className="px-10 py-4 text-lg font-semibold">
                {t.ctaButton}
              </Button>
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-nur-burgundy text-center mb-16">
              {t.howItWorks}
            </h2>
            
            <div className="space-y-12">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-nur-burgundy text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-nur-burgundy mb-3">{t.step1Title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {t.step1Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-nur-burgundy text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-nur-burgundy mb-3">{t.step2Title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {t.step2Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-nur-burgundy text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-nur-burgundy mb-3">{t.step3Title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {t.step3Desc}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-nur-burgundy text-white rounded-full flex items-center justify-center font-bold text-lg">
                  4
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-nur-burgundy mb-3">{t.step4Title}</h3>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {t.step4Desc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-nur-burgundy text-center mb-16">
              {t.faqTitle}
            </h2>
            
            <div className="space-y-8">
              <Card className="p-8">
                <h3 className="text-xl font-semibold text-nur-burgundy mb-4">{t.faq1Q}</h3>
                <p className="text-gray-600 leading-relaxed">{t.faq1A}</p>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-semibold text-nur-burgundy mb-4">{t.faq2Q}</h3>
                <p className="text-gray-600 leading-relaxed">{t.faq2A}</p>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-semibold text-nur-burgundy mb-4">{t.faq3Q}</h3>
                <p className="text-gray-600 leading-relaxed">{t.faq3A}</p>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-semibold text-nur-burgundy mb-4">{t.faq4Q}</h3>
                <p className="text-gray-600 leading-relaxed">{t.faq4A}</p>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-semibold text-nur-burgundy mb-4">{t.faq5Q}</h3>
                <p className="text-gray-600 leading-relaxed">{t.faq5A}</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="py-20 bg-gradient-to-r from-nur-burgundy to-nur-burgundy/90">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-4xl font-bold mb-6">
              {t.journeyTitle}
            </h2>
            <p className="text-xl mb-10 opacity-90 max-w-3xl mx-auto leading-relaxed">
              {t.journeyDesc}
            </p>
            <Link href="/soknad">
              <Button size="lg" className="bg-white text-nur-burgundy hover:bg-nur-beige px-10 py-4 text-xl font-semibold">
                {t.ctaButton}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}