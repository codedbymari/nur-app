// components/layout/Footer.js
export default function Footer() {
    return (
      <footer className="bg-nur-burgundy text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">NÜR</p>
            <p className="text-sm opacity-90 mb-4">
              Seriøs matchmaking for muslimer med ærlege intensjoner
            </p>
            <div className="flex justify-center space-x-6 text-sm">
              <a href="#" className="hover:text-nur-beige">Personvern</a>
              <a href="#" className="hover:text-nur-beige">Vilkår</a>
              <a href="#" className="hover:text-nur-beige">Kontakt</a>
            </div>
            <p className="text-xs opacity-75 mt-4">
              © 2025 NÜR. Alle rettigheter reservert.
            </p>
          </div>
        </div>
      </footer>
    )
  }