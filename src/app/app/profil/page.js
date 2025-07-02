// app/app/profil/page.js


'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';


export default function ProfilPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    navn: '',
    alder: '',
    by: '',
    om_meg: '',
    verdier: [],
    utdanning: '',
    yrke: '',
    sivilstatus: '',
    ser_etter: ''
  });
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const verdierOptions = [
    'Familie', 'Tro', 'Utdanning', 'Karriere', 'Reise', 'Sport', 'Lesing',
    'Matlaging', 'Musikk', 'Kunst', 'Frivillighet', 'Natur', 'Teknologi',
    'Helse', 'Humor', 'Ærlighet', 'Respekt', 'Generøsitet', 'Tålmodighet'
  ];

  const utdanningOptions = [
    'Videregående', 'Fagbrev', 'Bachelor', 'Master', 'PhD', 'Annet'
  ];

  const sivilstatusOptions = [
    'Ugift', 'Skilt', 'Enke/enkemann'
  ];

  const serEtterOptions = [
    'Seriøst forhold', 'Ekteskap', 'Vennskap først', 'Åpen for det meste'
  ];

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/');
        return;
      }
      
      setUser(user);
    } catch (error) {
      console.error('Feil ved sjekk av bruker:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('brukere')
        .select('*')
        .eq('id', user.id,)
        .single();

      if (error) throw error;
      
      setProfile(data);
      setFormData({
        navn: data.navn || '',
        alder: data.alder || '',
        by: data.by || '',
        om_meg: data.om_meg || '',
        verdier: data.verdier || [],
        utdanning: data.utdanning || '',
        yrke: data.yrke || '',
        sivilstatus: data.sivilstatus || '',
        ser_etter: data.ser_etter || ''
      });
    } catch (error) {
      console.error('Feil ved lasting av profil:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Fjern feilmelding når bruker begynner å skrive
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleVerdierChange = (verdi) => {
    setFormData(prev => ({
      ...prev,
      verdier: prev.verdier.includes(verdi)
        ? prev.verdier.filter(v => v !== verdi)
        : [...prev.verdier, verdi]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.navn.trim()) {
      newErrors.navn = 'Navn er påkrevd';
    }

    if (!formData.alder || formData.alder < 18 || formData.alder > 100) {
      newErrors.alder = 'Alder må være mellom 18 og 100 år';
    }

    if (!formData.by.trim()) {
      newErrors.by = 'By er påkrevd';
    }

    if (!formData.om_meg.trim()) {
      newErrors.om_meg = 'Fortell litt om deg selv';
    } else if (formData.om_meg.length < 50) {
      newErrors.om_meg = 'Beskrivelsen må være minst 50 tegn';
    }

    if (formData.verdier.length < 3) {
      newErrors.verdier = 'Velg minst 3 verdier';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('brukere')
        .update({
          navn: formData.navn.trim(),
          alder: parseInt(formData.alder),
          by: formData.by.trim(),
          om_meg: formData.om_meg.trim(),
          verdier: formData.verdier,
          utdanning: formData.utdanning,
          yrke: formData.yrke.trim(),
          sivilstatus: formData.sivilstatus,
          ser_etter: formData.ser_etter
        })
        .eq('id', user.id);

      if (error) throw error;

      await loadProfile();
      setEditing(false);
      alert('Profil oppdatert!');
    } catch (error) {
      console.error('Feil ved lagring av profil:', error);
      alert('Feil ved lagring av profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form til original data
    setFormData({
      navn: profile.navn || '',
      alder: profile.alder || '',
      by: profile.by || '',
      om_meg: profile.om_meg || '',
      verdier: profile.verdier || [],
      utdanning: profile.utdanning || '',
      yrke: profile.yrke || '',
      sivilstatus: profile.sivilstatus || '',
      ser_etter: profile.ser_etter || ''
    });
    setErrors({});
    setEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Feil ved utlogging:', error);
    }
  };

  const deaktiverKonto = async () => {
    if (!confirm('Er du sikker på at du vil deaktivere kontoen din? Dette kan ikke angres.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('brukere')
        .update({ aktiv: false })
        .eq('id', user.id);

      if (error) throw error;

      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Feil ved deaktivering av konto:', error);
      alert('Feil ved deaktivering av konto');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#780000] text-xl">Laster profil...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#780000] text-xl mb-4">Profilen din kunne ikke lastes</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#780000] text-white px-6 py-2 rounded-lg hover:bg-[#C1121F] transition-colors"
          >
            Prøv igjen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#780000] mb-2">Min profil</h1>
            <p className="text-gray-600">
              {editing ? 'Rediger informasjonen din' : 'Her er informasjonen andre kan se om deg'}
            </p>
          </div>
          
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-[#780000] text-white px-6 py-2 rounded-lg hover:bg-[#C1121F] transition-colors"
            >
              Rediger profil
            </button>
          )}
        </div>

        {editing ? (
          /* Redigeringsmodus */
          <div className="space-y-6">
            {/* Grunnleggende informasjon */}
            <div className="bg-[#FDF0D5] p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#780000] mb-4">Grunnleggende informasjon</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#780000] mb-1">
                    Navn *
                  </label>
                  <input
                    type="text"
                    name="navn"
                    value={formData.navn}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000] ${
                      errors.navn ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ditt fulle navn"
                  />
                  {errors.navn && <p className="text-red-500 text-sm mt-1">{errors.navn}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#780000] mb-1">
                    Alder *
                  </label>
                  <input
                    type="number"
                    name="alder"
                    value={formData.alder}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000] ${
                      errors.alder ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Din alder"
                  />
                  {errors.alder && <p className="text-red-500 text-sm mt-1">{errors.alder}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#780000] mb-1">
                    By *
                  </label>
                  <input
                    type="text"
                    name="by"
                    value={formData.by}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000] ${
                      errors.by ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Hvilken by bor du i?"
                  />
                  {errors.by && <p className="text-red-500 text-sm mt-1">{errors.by}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#780000] mb-1">
                    Yrke
                  </label>
                  <input
                    type="text"
                    name="yrke"
                    value={formData.yrke}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
                    placeholder="Hva jobber du med?"
                  />
                </div>
              </div>
            </div>

            {/* Om meg */}
            <div className="bg-[#FDF0D5] p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#780000] mb-4">Om meg</h2>
              <div>
                <label className="block text-sm font-medium text-[#780000] mb-1">
                  Fortell om deg selv * (minst 50 tegn)
                </label>
                <textarea
                  name="om_meg"
                  value={formData.om_meg}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000] ${
                    errors.om_meg ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Beskriv deg selv, dine interesser og hva du ser etter..."
                />
                <div className="flex justify-between items-center mt-1">
                  {errors.om_meg && <p className="text-red-500 text-sm">{errors.om_meg}</p>}
                  <p className="text-sm text-gray-500 ml-auto">
                    {formData.om_meg.length}/500 tegn
                  </p>
                </div>
              </div>
            </div>

            {/* Verdier */}
            <div className="bg-[#FDF0D5] p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#780000] mb-4">
                Viktige verdier * (velg minst 3)
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {verdierOptions.map((verdi) => (
                  <label key={verdi} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.verdier.includes(verdi)}
                      onChange={() => handleVerdierChange(verdi)}
                      className="rounded border-gray-300 text-[#780000] focus:ring-[#780000]"
                    />
                    <span className="text-sm">{verdi}</span>
                  </label>
                ))}
              </div>
              {errors.verdier && <p className="text-red-500 text-sm mt-2">{errors.verdier}</p>}
            </div>

            {/* Tilleggsinformasjon */}
            <div className="bg-[#FDF0D5] p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#780000] mb-4">Tilleggsinformasjon</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#780000] mb-1">
                    Utdanning
                  </label>
                  <select
                    name="utdanning"
                    value={formData.utdanning}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
                  >
                    <option value="">Velg utdanning</option>
                    {utdanningOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#780000] mb-1">
                    Sivilstatus
                  </label>
                  <select
                    name="sivilstatus"
                    value={formData.sivilstatus}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
                  >
                    <option value="">Velg sivilstatus</option>
                    {sivilstatusOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#780000] mb-1">
                    Ser etter
                  </label>
                  <select
                    name="ser_etter"
                    value={formData.ser_etter}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#780000]"
                  >
                    <option value="">Velg hva du ser etter</option>
                    {serEtterOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Lagre/Avbryt knapper */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Avbryt
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#780000] text-white px-6 py-2 rounded-lg hover:bg-[#C1121F] transition-colors disabled:opacity-50"
              >
                {saving ? 'Lagrer...' : 'Lagre endringer'}
              </button>
            </div>
          </div>
        ) : (
          /* Visningsmodus */
          <div className="space-y-6">
            {/* Grunnleggende informasjon */}
            <div className="bg-[#FDF0D5] p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#780000] mb-4">Grunnleggende informasjon</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-[#780000]">Navn</h3>
                  <p className="text-gray-700">{profile.navn}</p>
                </div>
                <div>
                  <h3 className="font-medium text-[#780000]">Alder</h3>
                  <p className="text-gray-700">{profile.alder} år</p>
                </div>
                <div>
                  <h3 className="font-medium text-[#780000]">By</h3>
                  <p className="text-gray-700">{profile.by}</p>
                </div>
                {profile.yrke && (
                  <div>
                    <h3 className="font-medium text-[#780000]">Yrke</h3>
                    <p className="text-gray-700">{profile.yrke}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Om meg */}
            <div className="bg-[#FDF0D5] p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#780000] mb-4">Om meg</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{profile.om_meg}</p>
            </div>

            {/* Verdier */}
            <div className="bg-[#FDF0D5] p-6 rounded-lg">
              <h2 className="text-xl font-bold text-[#780000] mb-4">Viktige verdier</h2>
              <div className="flex flex-wrap gap-2">
                {profile.verdier?.map((verdi, index) => (
                  <span key={index} className="bg-white px-3 py-1 rounded-full text-sm">
                    {verdi}
                  </span>
                ))}
              </div>
            </div>

            {/* Tilleggsinformasjon */}
            {(profile.utdanning || profile.sivilstatus || profile.ser_etter) && (
              <div className="bg-[#FDF0D5] p-6 rounded-lg">
                <h2 className="text-xl font-bold text-[#780000] mb-4">Tilleggsinformasjon</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {profile.utdanning && (
                    <div>
                      <h3 className="font-medium text-[#780000]">Utdanning</h3>
                      <p className="text-gray-700">{profile.utdanning}</p>
                    </div>
                  )}
                  {profile.sivilstatus && (
                    <div>
                      <h3 className="font-medium text-[#780000]">Sivilstatus</h3>
                      <p className="text-gray-700">{profile.sivilstatus}</p>
                    </div>
                  )}
                  {profile.ser_etter && (
                    <div>
                      <h3 className="font-medium text-[#780000]">Ser etter</h3>
                      <p className="text-gray-700">{profile.ser_etter}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Konto-handlinger */}
        {!editing && (
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold text-[#780000] mb-6">Konto-handlinger</h2>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSignOut}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logg ut
              </button>
              
              <button
                onClick={deaktiverKonto}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Deaktiver konto
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              Ved å deaktivere kontoen din vil profilen din ikke lenger være synlig for andre brukere. 
              Dette kan ikke angres.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
