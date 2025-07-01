'use client'

import { useState } from 'react'


// Field mapping from form names to database column names
const FIELD_MAPPING = {
  // Personlig informasjon
  navn: 'navn',
  epost: 'epost',
  telefon: 'telefon',
  alder: 'alder',
  fodested: 'fødested',
  navarende_by: 'nåværende_by',
  nasjonalitet: 'nasjonalitet',
  etnisk_bakgrunn: 'etnisk_bakgrunn',
  
  // Utdanning og karriere
  utdanning_niva: 'utdanning_nivå',
  utdanning_omrade: 'utdanning_område',
  yrke_kategori: 'yrke_kategori',
  yrke_beskrivelse: 'yrke_beskrivelse',
  arlig_inntekt: 'årlig_inntekt',
  karriere_ambisjoner: 'karriere_ambisjoner',
  
  // Språk
  morsmal: 'morsmål',
  andre_sprak: 'andre_språk',
  
  // Familie
  familie_situasjon: 'familie_situasjon',
  sosken_antall: 'søsken_antall',
  foreldre_gift: 'foreldre_gift',
  familie_verdier: 'familie_verdier',
  
  // Religion
  religios_praksis: 'religiøs_praksis',
  bonn_hyppighet: 'bønn_hyppighet',
  moskebesok: 'moskébesøk',
  religios_utdanning: 'religiøs_utdanning',
  religiose_mal: 'religiøse_mål',
  
  // Livsstil
  livsstil_preferanse: 'livsstil_preferanse',
  royker: 'røyker',
  hijab: 'hijab',
  sport_aktiviteter: 'sport_aktiviteter',
  hobbyer: 'hobbyer',
  mat_preferanser: 'mat_preferanser',
  reise_erfaring: 'reise_erfaring',
  
  // Om deg
  om_deg: 'om_deg',
  personlighet: 'personlighet',
  styrker: 'styrker',
  utfordringer: 'utfordringer',
  fremtidsvisjoner: 'fremtidsvisjoner',
  
  // Partner-preferanser
  partner_alder_min: 'partner_alder_min',
  partner_alder_max: 'partner_alder_max',
  partner_utdanning: 'partner_utdanning',
  partner_yrke: 'partner_yrke',
  partner_religiositet: 'partner_religiøsitet',
  partner_etnisitet: 'partner_etnisitet',
  partner_sprak: 'partner_språk',
  partner_bosted: 'partner_bosted',
  partner_barn: 'partner_barn',
  
  // Forhold og ekteskap
  tidligere_forhold: 'tidligere_forhold',
  ekteskaps_forventninger: 'ekteskaps_forventninger',
  konfliktlosning: 'konfliktløsning',
  roller_i_ekteskap: 'roller_i_ekteskap',
  barn_preferanser: 'barn_preferanser',
  
  // Praktisk
  bolig_situasjon: 'bolig_situasjon',
  okonomi_handtering: 'økonomi_håndtering',
  verdier: 'verdier',
  livsmal: 'livsmål',
  dealbreakers: 'dealbreakers',
  helse_forhold: 'helse_forhold',
  andre_kommentarer: 'andre_kommentarer'
};

// Function to convert form data to database format
const mapFormDataToDatabase = (formData) => {
  const mappedData = {};
  
  for (const [formField, dbField] of Object.entries(FIELD_MAPPING)) {
    // Skip if undefined or null
    if (formData[formField] === undefined || formData[formField] === null) continue;
    
    let value = formData[formField];
    
    // Special handling for andre_språk (ARRAY field in your schema)
    if (dbField === 'andre_språk') {
      if (Array.isArray(value)) {
        mappedData[dbField] = value;
      } else if (typeof value === 'string' && value.trim()) {
        // Convert string to array
        mappedData[dbField] = value.split(',')
          .map(s => s.trim())
          .filter(s => s);
      }
      continue;
    }

    // Handle ARRAY fields for etnisk_bakgrunn and verdier
    if (dbField === 'etnisk_bakgrunn' || dbField === 'verdier') {
      if (Array.isArray(value)) {
        mappedData[dbField] = value;
      } else if (typeof value === 'string' && value.trim()) {
        // Convert string to array - split by comma and clean up
        mappedData[dbField] = value.split(',')
          .map(s => s.trim())
          .filter(s => s);
      }
      continue;
    }
    
    // Handle boolean fields
    if (dbField === 'foreldre_gift' || dbField === 'røyker' || dbField === 'hijab') {
      mappedData[dbField] = !!value; // Force boolean conversion
      continue;
    }
    
    // Handle number fields
    if (dbField === 'alder' || dbField === 'søsken_antall' || 
        dbField === 'partner_alder_min' || dbField === 'partner_alder_max') {
      const numValue = parseInt(value);
      mappedData[dbField] = isNaN(numValue) ? null : numValue;
      continue;
    }
    
    // Default case for text fields - skip empty strings if needed
    if (value !== '') {
      mappedData[dbField] = value;
    }
  }
  
  return mappedData;
};


const SoknadForm = () => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [currentSection, setCurrentSection] = useState(0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const REQUIRED_FIELDS = ['navn', 'epost', 'alder']; // Add other required fields

const validateForm = (data) => {
  const missingFields = REQUIRED_FIELDS.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new Error(`Mangler påkrevde felt: ${missingFields.join(', ')}`);
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSubmitError('');

  try {
    // 1. First map the form data
    const mappedData = mapFormDataToDatabase(formData);
    console.log('Form - Mapped data:', mappedData);

    // 2. Then validate the mapped data
    validateForm(mappedData);

    // 3. Submit to your Next.js API route instead of directly to Supabase
    const response = await fetch('/api/soknad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mappedData)
    });

    const result = await response.json();
    
    console.log('Form - API Response:', result);

    if (!response.ok || !result.success) {
      throw new Error(result.details || result.error || 'Submission failed');
    }

    // Success handling
    setSubmitMessage('Søknaden din er sendt inn!');
    setFormData({});
    setCurrentSection(0);

  } catch (error) {
    console.error('Form - Submission error:', error);
    setSubmitError(error.message || 'En feil oppstod ved innsending');
  } finally {
    setIsSubmitting(false);
  }
};

  const sections = [
    'Personlig informasjon',
    'Utdanning og karriere',
    'Språk og familie',
    'Religion',
    'Livsstil',
    'Om deg',
    'Partner-preferanser',
    'Forhold og ekteskap',
    'Praktisk'
  ];

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Søknadsskjema for Gifteklubben</h1>
      
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Steg {currentSection + 1} av {sections.length}</span>
          <span className="text-sm text-gray-600">{Math.round(((currentSection + 1) / sections.length) * 100)}% fullført</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
          ></div>
        </div>
        <h2 className="text-xl font-semibold mt-4">{sections[currentSection]}</h2>
      </div>

      {submitMessage && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {submitMessage}
        </div>
      )}

      {submitError && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 0: Personlig informasjon */}
        {currentSection === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Fullt navn *</label>
                <input
                  type="text"
                  name="navn"
                  value={formData.navn || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">E-post *</label>
                <input
                  type="email"
                  name="epost"
                  value={formData.epost || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Telefonnummer</label>
                <input
                  type="tel"
                  name="telefon"
                  value={formData.telefon || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Alder *</label>
                <input
                  type="number"
                  name="alder"
                  value={formData.alder || ''}
                  onChange={handleInputChange}
                  required
                  min="18"
                  max="99"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Fødested</label>
                <input
                  type="text"
                  name="fodested"
                  value={formData.fodested || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nåværende by</label>
                <input
                  type="text"
                  name="navarende_by"
                  value={formData.navarende_by || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Nasjonalitet</label>
                <input
                  type="text"
                  name="nasjonalitet"
                  value={formData.nasjonalitet || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Etnisk bakgrunn</label>
                <input
                  type="text"
                  name="etnisk_bakgrunn"
                  value={formData.etnisk_bakgrunn || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 1: Utdanning og karriere */}
        {currentSection === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Utdanningsnivå</label>
                <select
                  name="utdanning_niva"
                  value={formData.utdanning_niva || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Velg utdanningsnivå</option>
                  <option value="grunnskole">Grunnskole</option>
                  <option value="videregaende">Videregående</option>
                  <option value="fagskole">Fagskole</option>
                  <option value="bachelor">Bachelor</option>
                  <option value="master">Master</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Utdanningsområde</label>
                <input
                  type="text"
                  name="utdanning_omrade"
                  value={formData.utdanning_omrade || ''}
                  onChange={handleInputChange}
                  placeholder="F.eks. økonomi, ingeniør, helse"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Yrkeskategori</label>
                <select
                  name="yrke_kategori"
                  value={formData.yrke_kategori || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Velg yrkeskategori</option>
                  <option value="student">Student</option>
                  <option value="helsevesen">Helsevesen</option>
                  <option value="utdanning">Utdanning</option>
                  <option value="teknologi">Teknologi/IT</option>
                  <option value="okonomi">Økonomi/Finans</option>
                  <option value="handel">Handel/Service</option>
                  <option value="industri">Industri</option>
                  <option value="offentlig">Offentlig sektor</option>
                  <option value="selvstendig">Selvstendig næringsdrivende</option>
                  <option value="annet">Annet</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Årlig inntekt</label>
                <select
                  name="arlig_inntekt"
                  value={formData.arlig_inntekt || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Velg inntektsgruppe</option>
                  <option value="under_300k">Under 300 000 kr</option>
                  <option value="300k_500k">300 000 - 500 000 kr</option>
                  <option value="500k_700k">500 000 - 700 000 kr</option>
                  <option value="700k_1m">700 000 kr - 1 million kr</option>
                  <option value="over_1m">Over 1 million kr</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Yrkebeskrivelse</label>
              <textarea
                name="yrke_beskrivelse"
                value={formData.yrke_beskrivelse || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Beskriv din nåværende jobb/stilling"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Karriereambisjoner</label>
              <textarea
                name="karriere_ambisjoner"
                value={formData.karriere_ambisjoner || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hva er dine mål for fremtiden?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Section 2: Språk og familie */}
        {currentSection === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Morsmål</label>
                <input
                  type="text"
                  name="morsmal"
                  value={formData.morsmal || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
     <label className="block text-sm font-medium mb-1">Andre språk du snakker</label>
  <input
    type="text"
    name="andre_språk"
    value={formData.andre_språk || ''}
    onChange={(e) => setFormData({
      ...formData,
      andre_språk: e.target.value
    })}
    placeholder="F.eks. Engelsk, Arabisk, Norsk"
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  />
  <p className="text-xs text-gray-500 mt-1">Skriv språkene adskilt med komma</p>
</div>

              <div>
                <label className="block text-sm font-medium mb-1">Familiesituasjon</label>
                <select
                  name="familie_situasjon"
                  value={formData.familie_situasjon || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Velg familiesituasjon</option>
                  <option value="bor_med_foreldre">Bor med foreldre</option>
                  <option value="bor_alene">Bor alene</option>
                  <option value="bor_med_venner">Bor med venner/kollektiv</option>
                  <option value="egen_familie">Har egen familie</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Antall søsken</label>
                <input
                  type="number"
                  name="sosken_antall"
                  value={formData.sosken_antall || ''}
                  onChange={handleInputChange}
                  min="0"
                  max="20"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
  <label className="block text-sm font-medium mb-1">Er foreldrene dine gift?</label>
  <div className="flex space-x-4">
    <label className="flex items-center">
      <input
        type="radio"
        name="foreldre_gift"
        checked={formData.foreldre_gift === true}
        onChange={() => setFormData({...formData, foreldre_gift: true})}
        className="mr-2"
      />
      Ja
    </label>
    <label className="flex items-center">
      <input
        type="radio"
        name="foreldre_gift"
        checked={formData.foreldre_gift === false}
        onChange={() => setFormData({...formData, foreldre_gift: false})}
        className="mr-2"
      />
      Nei
    </label>
  </div>
</div>

            <div>
              <label className="block text-sm font-medium mb-1">Familieverdier</label>
              <textarea
                name="familie_verdier"
                value={formData.familie_verdier || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Beskriv hvilke verdier som er viktige i din familie"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Section 3: Religion */}
        {currentSection === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Religiøs praksis</label>
                <select
                  name="religios_praksis"
                  value={formData.religios_praksis || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Velg praksisnivå</option>
                  <option value="meget_religiøs">Meget religiøs</option>
                  <option value="religiøs">Religiøs</option>
                  <option value="moderat">Moderat religiøs</option>
                  <option value="lite_religiøs">Lite religiøs</option>
                  <option value="ikke_religiøs">Ikke religiøs</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Hvor ofte ber du?</label>
                <select
                  name="bonn_hyppighet"
                  value={formData.bonn_hyppighet || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Velg hyppighet</option>
                  <option value="fem_ganger_daglig">5 ganger daglig</option>
                  <option value="daglig">Daglig</option>
                  <option value="regelmessig">Regelmessig</option>
                  <option value="av_og_til">Av og til</option>
                  <option value="sjelden">Sjelden</option>
                  <option value="aldri">Aldri</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Moskébesøk</label>
                <select
                  name="moskebesok"
                  value={formData.moskebesok || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Velg hyppighet</option>
                  <option value="daglig">Daglig</option>
                  <option value="ukentlig">Ukentlig</option>
                  <option value="fredagsbønn">Kun fredagsbønn</option>
                  <option value="høytider">Kun ved høytider</option>
                  <option value="sjelden">Sjelden</option>
                  <option value="aldri">Aldri</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Religiøs utdanning</label>
                <input
                  type="text"
                  name="religios_utdanning"
                  value={formData.religios_utdanning || ''}
                  onChange={handleInputChange}
                  placeholder="F.eks. Korankurs, islamske studier"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Religiøse mål</label>
              <textarea
                name="religiose_mal"
                value={formData.religiose_mal || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hva er dine mål for din religiøse utvikling?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Section 4: Livsstil */}
        {currentSection === 4 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Livsstilspreferanse</label>
                <select
                  name="livsstil_preferanse"
                  value={formData.livsstil_preferanse || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Velg livsstil</option>
                  <option value="tradisjonell">Tradisjonell</option>
                  <option value="moderne">Moderne</option>
                  <option value="blandet">Blandet tradisjonell/moderne</option>
                  <option value="liberal">Liberal</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Matpreferanser</label>
                <input
                  type="text"
                  name="mat_preferanser"
                  value={formData.mat_preferanser || ''}
                  onChange={handleInputChange}
                  placeholder="F.eks. halal, vegetarianer, spesielle dietter"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="royker"
                    checked={formData.royker || false}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Røyker</span>
                </label>
              </div>
              
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="hijab"
                    checked={formData.hijab || false}
                    onChange={handleInputChange}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Bruker hijab</span>
                </label>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Sport og aktiviteter</label>
              <textarea
                name="sport_aktiviteter"
                value={formData.sport_aktiviteter || ''}
                onChange={handleInputChange}
                rows="2"
                placeholder="Hvilke sportsaktiviteter eller treningsformer liker du?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Hobbyer og interesser</label>
              <textarea
                name="hobbyer"
                value={formData.hobbyer || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hva liker du å gjøre på fritiden?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Reiseerfaring</label>
              <textarea
                name="reise_erfaring"
                value={formData.reise_erfaring || ''}
                onChange={handleInputChange}
                rows="2"
                placeholder="Hvilke steder har du reist til?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Section 5: Om deg */}
        {currentSection === 5 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fortell om deg selv</label>
              <textarea
                name="om_deg"
                value={formData.om_deg || ''}
                onChange={handleInputChange}
                rows="4"
                placeholder="Beskriv deg selv, dine interesser og hva som gjør deg til den du er"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Personlighet</label>
              <textarea
                name="personlighet"
                value={formData.personlighet || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hvordan vil du beskrive din personlighet?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Styrker</label>
              <textarea
                name="styrker"
                value={formData.styrker || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hva er dine største styrker?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Utfordringer du jobber med</label>
              <textarea
                name="utfordringer"
                value={formData.utfordringer || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hvilke områder jobber du med å forbedre?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Fremtidsvisjoner</label>
              <textarea
                name="fremtidsvisjoner"
                value={formData.fremtidsvisjoner || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hvordan ser du for deg fremtiden din om 5-10 år?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Section 6: Partner-preferanser */}
        {currentSection === 6 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Partner alder minimum</label>
                <input
                  type="number"
                  name="partner_alder_min"
                  value={formData.partner_alder_min || ''}
                  onChange={handleInputChange}
                  min="18"
                  max="99"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Partner alder maksimum</label>
                <input
                  type="number"
                  name="partner_alder_max"
                  value={formData.partner_alder_max || ''}
                  onChange={handleInputChange}
                  min="18"
                  max="99"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Ønsket utdanningsnivå hos partner</label>
                <select
                  name="partner_utdanning"
                  value={formData.partner_utdanning || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Ingen preferanse</option>
                  <option value="videregaende">Minimum videregående</option>
                  <option value="fagskole">Minimum fagskole</option>
                  <option value="bachelor">Minimum bachelor</option>
                  <option value="master">Minimum master</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Ønsket yrke hos partner</label>
                <input
                  type="text"
                  name="partner_yrke"
                  value={formData.partner_yrke || ''}
                  onChange={handleInputChange}
                  placeholder="F.eks. helsevesen, utdanning, eller ingen preferanse"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Religiøsitet hos partner</label>
                <select
                  name="partner_religiositet"
                  value={formData.partner_religiositet || ''}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Ingen preferanse</option>
                  <option value="meget_religiøs">Meget religiøs</option>
                  <option value="religiøs">Religiøs</option>
                  <option value="moderat">Moderat religiøs</option>
                  <option value="lite_religiøs">Lite religiøs</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Etnisitet hos partner</label>
                <input
                  type="text"
                  name="partner_etnisitet"
                  value={formData.partner_etnisitet || ''}
                  onChange={handleInputChange}
                  placeholder="F.eks. samme som meg, eller ingen preferanse"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Språk hos partner</label>
                <input
                  type="text"
                  name="partner_sprak"
                  value={formData.partner_sprak || ''}
                  onChange={handleInputChange}
                  placeholder="Hvilke språk bør partneren snakke?"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bosted for partner</label>
                <input
                  type="text"
                  name="partner_bosted"
                  value={formData.partner_bosted || ''}
                  onChange={handleInputChange}
                  placeholder="F.eks. samme by, Norge, eller hvor som helst"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Holdning til partner med barn fra før</label>
              <select
                name="partner_barn"
                value={formData.partner_barn || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Velg holdning</option>
                <option value="ønsker_ikke">Ønsker ikke partner med barn</option>
                <option value="kan_akseptere">Kan akseptere partner med barn</option>
                <option value="ingen_preferanse">Ingen preferanse</option>
                <option value="ønsker_gjerne">Ønsker gjerne partner med barn</option>
              </select>
            </div>
          </div>
        )}

        {/* Section 7: Forhold og ekteskap */}
        {currentSection === 7 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Tidligere forhold</label>
              <textarea
                name="tidligere_forhold"
                value={formData.tidligere_forhold || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Kort om eventuelle tidligere forhold (valgfritt)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Forventninger til ekteskap</label>
              <textarea
                name="ekteskaps_forventninger"
                value={formData.ekteskaps_forventninger || ''}
                onChange={handleInputChange}
                rows="4"
                placeholder="Hva forventer du av et ekteskap?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Konfliktløsning</label>
              <textarea
                name="konfliktlosning"
                value={formData.konfliktlosning || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hvordan håndterer du konflikter i nære relasjoner?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Roller i ekteskap</label>
              <textarea
                name="roller_i_ekteskap"
                value={formData.roller_i_ekteskap || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hvordan ser du på roller og ansvarsfordeling i et ekteskap?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Ønsker om barn</label>
              <textarea
                name="barn_preferanser"
                value={formData.barn_preferanser || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Ønsker du barn? Hvor mange? Når?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Section 8: Praktisk */}
        {currentSection === 8 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Boligsituasjon</label>
              <select
                name="bolig_situasjon"
                value={formData.bolig_situasjon || ''}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Velg boligsituasjon</option>
                <option value="eier">Eier egen bolig</option>
                <option value="leier">Leier bolig</option>
                <option value="bor_hjemme">Bor hjemme hos foreldre</option>
                <option value="kollektiv">Bor i kollektiv</option>
                <option value="annet">Annet</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Økonomihåndtering</label>
              <textarea
                name="okonomi_handtering"
                value={formData.okonomi_handtering || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hvordan håndterer du økonomi? Hvordan ser du på økonomisk samarbeid i et forhold?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Viktige verdier</label>
              <textarea
                name="verdier"
                value={formData.verdier || ''}
                onChange={handleInputChange}
                rows="4"
                placeholder="Hvilke verdier er viktigst for deg i livet?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Livsmål</label>
              <textarea
                name="livsmal"
                value={formData.livsmal || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hva er dine viktigste mål i livet?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Dealbreakers</label>
              <textarea
                name="dealbreakers"
                value={formData.dealbreakers || ''}
                onChange={handleInputChange}
                rows="3"
                placeholder="Hva kan du absolutt ikke akseptere hos en partner?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Helseforhold</label>
              <textarea
                name="helse_forhold"
                value={formData.helse_forhold || ''}
                onChange={handleInputChange}
                rows="2"
                placeholder="Eventuelle helseforhold det er viktig å nevne (valgfritt)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Andre kommentarer</label>
              <textarea
                name="andre_kommentarer"
                value={formData.andre_kommentarer || ''}
                onChange={handleInputChange}
                rows="4"
                placeholder="Er det noe annet du vil legge til?"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center pt-6">
          <button
            type="button"
            onClick={prevSection}
            disabled={currentSection === 0}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-400"
          >
            Forrige
          </button>
          
          <div className="text-sm text-gray-600">
            Side {currentSection + 1} av {sections.length}
          </div>
          
          {currentSection < sections.length - 1 ? (
            <button
              type="button"
              onClick={nextSection}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Neste
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
            >
              {isSubmitting ? 'Sender inn...' : 'Send inn søknad'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SoknadForm;