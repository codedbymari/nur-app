// components/forms/ProfilForm.js
'use client';
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { supabase } from '../../lib/supabase';

export function ProfilForm({ user, onSuccess }) {
  const [formData, setFormData] = useState({
    fornavn: '',
    etternavn: '',
    alder: '',
    by: '',
    utdanning: '',
    yrke: '',
    om_meg: '',
    interesser: '',
    verdier: '',
    livsstil: '',
    ekteskap_maal: '',
    familie_bakgrunn: '',
    sprak: '',
    bor_med: '',
    røyker: false,
    vil_flytte: '',
    barn_onske: '',
    hoyde: '',
    etnisitet: '',
    madhab: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiler')
        .select('*')
        .eq('bruker_id', user.id)
        .single();

      if (data) {
        setFormData(data);
      }
    } catch (error) {
      console.error('Feil ved lasting av profil:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    // Validering
    const newErrors = {};
    if (!formData.fornavn.trim()) newErrors.fornavn = 'Fornavn er påkrevd';
    if (!formData.om_meg.trim() || formData.om_meg.length < 100) {
      newErrors.om_meg = 'Beskriv deg selv med minst 100 tegn';
    }
    if (!formData.verdier.trim()) newErrors.verdier = 'Verdier er påkrevd';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiler')
        .upsert({
          ...formData,
          bruker_id: user.id,
          oppdatert_dato: new Date().toISOString()
        });

      if (error) throw error;

      onSuccess?.();
    } catch (error) {
      setErrors({ submit: 'Kunne ikke lagre profil. Prøv igjen.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Min profil
          </h2>
          <p className="text-gray-600">
            Fyll ut din profil for å få best mulige matcher
          </p>
        </div>

        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800">{errors.submit}</p>
          </div>
        )}

        {/* Grunnleggende informasjon */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Grunnleggende informasjon
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fornavn"
              value={formData.fornavn}
              onChange={(e) => handleChange('fornavn', e.target.value)}
              error={errors.fornavn}
              required
            />
            <Input
              label="Etternavn"
              value={formData.etternavn}
              onChange={(e) => handleChange('etternavn', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Alder"
              type="number"
              value={formData.alder}
              onChange={(e) => handleChange('alder', e.target.value)}
            />
            <Input
              label="Høyde (cm)"
              type="number"
              value={formData.hoyde}
              onChange={(e) => handleChange('hoyde', e.target.value)}
            />
            <Input
              label="By"
              value={formData.by}
              onChange={(e) => handleChange('by', e.target.value)}
            />
          </div>
        </div>

        {/* Om meg */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Om meg
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Beskriv deg selv *
            </label>
            <textarea
              value={formData.om_meg}
              onChange={(e) => handleChange('om_meg', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows="4"
              placeholder="Fortell om din personlighet, interesser og hva som gjør deg glad..."
            />
            {errors.om_meg && (
              <p className="mt-1 text-sm text-red-600">{errors.om_meg}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interesser og hobbyer
            </label>
            <textarea
              value={formData.interesser}
              onChange={(e) => handleChange('interesser', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows="3"
              placeholder="Hva liker du å gjøre på fritiden?"
            />
          </div>
        </div>

        {/* Utdanning og yrke */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Utdanning og yrke
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Utdanning"
              value={formData.utdanning}
              onChange={(e) => handleChange('utdanning', e.target.value)}
            />
            <Input
              label="Yrke"
              value={formData.yrke}
              onChange={(e) => handleChange('yrke', e.target.value)}
            />
          </div>
        </div>

        {/* Verdier og livsstil */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Verdier og livsstil
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mine verdier *
            </label>
            <textarea
              value={formData.verdier}
              onChange={(e) => handleChange('verdier', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows="3"
              placeholder="Beskriv dine religiøse verdier og hva som er viktig for deg..."
            />
            {errors.verdier && (
              <p className="mt-1 text-sm text-red-600">{errors.verdier}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Madhab"
              value={formData.madhab}
              onChange={(e) => handleChange('madhab', e.target.value)}
              placeholder="F.eks. Hanafi, Shafi'i..."
            />
            <Input
              label="Etnisitet"
              value={formData.etnisitet}
              onChange={(e) => handleChange('etnisitet', e.target.value)}
            />
          </div>
        </div>

        {/* Familie og fremtid */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
            Familie og fremtidsplaner
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mål med ekteskap
            </label>
            <textarea
              value={formData.ekteskap_maal}
              onChange={(e) => handleChange('ekteskap_maal', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              rows="3"
              placeholder="Hva er dine forventninger og mål med ekteskap?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Ønske om barn"
              value={formData.barn_onske}
              onChange={(e) => handleChange('barn_onske', e.target.value)}
              placeholder="F.eks. Ja, ønsker barn"
            />
            <Input
              label="Villig til å flytte"
              value={formData.vil_flytte}
              onChange={(e) => handleChange('vil_flytte', e.target.value)}
              placeholder="F.eks. Ja, innenfor Norge"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Lagrer profil...' : 'Lagre profil'}
        </Button>
      </form>
    </Card>
  );
}