'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import DebugPanel from '../../components/DebugPanel.js';

// Import components
import LoginForm from '@/components/admin/LoginForm';
import AdminHeader from '@/components/admin/AdminHeader';
import StatisticsGrid from '@/components/admin/StatisticsGrid';
import TabNavigation from '@/components/admin/TabNavigation';
import SoknadCard from '@/components/admin/SoknadCard';
import BrukerCard from '@/components/admin/BrukerCard';
import InvitasjonCard from '@/components/admin/InvitasjonCard';
import CreateInvitationForm from '@/components/admin/CreateInvitationForm';

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('soknader');
  const [soknader, setSoknader] = useState([]);
  const [brukere, setBrukere] = useState([]);
  const [invitasjoner, setInvitasjoner] = useState([]);
  const [statistikk, setStatistikk] = useState({});
  const [showLogin, setShowLogin] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showCreateInvitation, setShowCreateInvitation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setShowLogin(true);
        setLoading(false);
        return;
      }

      // Check if user is admin
      const adminEmails = ['marjamahassanali@gmail.com', 'admin@nur.no'];
      if (!adminEmails.includes(user.email)) {
        alert('Du har ikke tilgang til admin-panelet');
        router.push('/');
        return;
      }

      setUser(user);
    } catch (error) {
      console.error('Feil ved sjekk av bruker:', error);
      setShowLogin(true);
    } finally {
      setLoading(false);
    }
  };

  const debugRLSAndQuery = () => {
    console.log("debugRLSAndQuery is called");
    // Add your debug logic here
  };

  const handleLogin = async (loginForm) => {
    setLoginError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        setLoginError(error.message);
        return;
      }

      // Check if logged in user is admin
      const adminEmails = ['marjamahassanali@gmail.com', 'admin@nur.no'];
      if (!adminEmails.includes(data.user.email)) {
        setLoginError('Du har ikke tilgang til admin-panelet');
        await supabase.auth.signOut();
        return;
      }

      setUser(data.user);
      setShowLogin(false);
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Det oppstod en feil ved innlogging');
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setShowLogin(true);
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const loadData = async () => {
    try {
      // Load applications
      const { data: soknadData, error: soknadError } = await supabase
        .from('soknad')
        .select('*')
        .order('created_at', { ascending: false });

      if (soknadError) throw soknadError;
      setSoknader(soknadData || []);

      // Load users
      const { data: brukerData, error: brukerError } = await supabase
        .from('brukere')
        .select('*')
        .order('created_at', { ascending: false });

      if (brukerError) throw brukerError;
      setBrukere(brukerData || []);

      // Load invitations
      const { data: invitasjonData, error: invitasjonError } = await supabase
        .from('invitasjoner')
        .select(`
          *,
          soknad (
            id,
            navn,
            epost
          )
        `)
        .order('created_at', { ascending: false });

      if (invitasjonError) throw invitasjonError;
      setInvitasjoner(invitasjonData || []);

      // Calculate statistics
      const stats = {
        totalSoknader: soknadData?.length || 0,
        ventendeSoknader: soknadData?.filter(s => s.status === 'pending').length || 0,
        godkjenteSoknader: soknadData?.filter(s => s.status === 'godkjent').length || 0,
        avslatteSoknader: soknadData?.filter(s => s.status === 'avslatt').length || 0,
        aktiveBrukere: brukerData?.filter(b => b.status === 'aktiv').length || 0,
        totalBrukere: brukerData?.length || 0,
        totalInvitasjoner: invitasjonData?.length || 0,
        bruktInvitasjoner: invitasjonData?.filter(i => i.brukt).length || 0,
        aktiveInvitasjoner: invitasjonData?.filter(i => !i.brukt && new Date(i.utloper_dato) > new Date()).length || 0
      };
      setStatistikk(stats);

    } catch (error) {
      console.error('Feil ved lasting av data:', error);
      alert('Feil ved lasting av data');
    }
  };

  const oppdaterSoknadStatus = async (soknadId, nyStatus) => {
    try {
      const { error } = await supabase
        .from('soknad')
        .update({ status: nyStatus })
        .eq('id', soknadId);

      if (error) throw error;

      // If approved, create invitation automatically
      if (nyStatus === 'godkjent') {
        await opprettInvitasjon(soknadId);
      }

      await loadData();
      alert(`Søknad ${nyStatus === 'godkjent' ? 'godkjent' : 'avslått'} ${nyStatus === 'godkjent' ? 'og invitasjon opprettet' : ''}`);
    } catch (error) {
      console.error('Feil ved oppdatering av status:', error);
      alert('Feil ved oppdatering av status');
    }
  };

  const opprettInvitasjon = async (soknadId, customMessage = '') => {
    try {
      const kode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const utloperAt = new Date();
      utloperAt.setDate(utloperAt.getDate() + 14); // Expires in 14 days

      const { error } = await supabase
        .from('invitasjoner')
        .insert({
          kode,
          soknad_id: soknadId,
          utloper_dato: utloperAt.toISOString(),
          message: customMessage || 'Velkommen til NÜR!'
        });

      if (error) throw error;
      return kode;
    } catch (error) {
      console.error('Feil ved opprettelse av invitasjon:', error);
      throw error;
    }
  };

  const opprettManuellInvitasjon = async (formData) => {
    try {
      const kode = await opprettInvitasjon(
        formData.soknad_id || null,
        formData.custom_message
      );
      
      alert(`Invitasjon opprettet med kode: ${kode}`);
      setShowCreateInvitation(false);
      await loadData();
    } catch (error) {
      alert('Feil ved opprettelse av invitasjon');
    }
  };

  const kopierInvitasjonskode = (kode) => {
    const inviteUrl = `${window.location.origin}/invite/${kode}`;
    navigator.clipboard.writeText(inviteUrl);
    alert('Invitasjonslenke kopiert til utklippstavle!');
  };

  const slettInvitasjon = async (invitasjonId) => {
    if (!confirm('Er du sikker på at du vil slette denne invitasjonen?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('invitasjoner')
        .delete()
        .eq('id', invitasjonId);

      if (error) throw error;
      await loadData();
      alert('Invitasjon slettet');
    } catch (error) {
      console.error('Feil ved sletting av invitasjon:', error);
      alert('Feil ved sletting av invitasjon');
    }
  };

  const formatDato = (dateString) => {
    if (!dateString) return 'Ukjent dato';
    return new Date(dateString).toLocaleDateString('nb-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const erUtlopt = (dato) => {
    return new Date(dato) < new Date();
  };

  // Login form
  if (showLogin) {
    return (
      <LoginForm 
        onLogin={handleLogin}
        loginError={loginError}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#780000] text-xl">Laster admin-panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader 
        user={user}
        onLogout={handleLogout}
      />
      {/* Add this temporarily for debugging */}
      <DebugPanel />

      <div className="max-w-7xl mx-auto p-6">
        <StatisticsGrid statistikk={statistikk} />

        <TabNavigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Tab Content */}
        {activeTab === 'soknader' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#780000] mb-4">Søknader</h2>
            {soknader.length === 0 ? (
              <div className="bg-[#FDF0D5] p-6 rounded-lg text-center">
                <p className="text-gray-600">Ingen søknader funnet</p>
              </div>
            ) : (
              soknader.map((soknad) => (
                <SoknadCard 
                  key={soknad.id}
                  soknad={soknad}
                  onStatusUpdate={oppdaterSoknadStatus}
                  formatDato={formatDato}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'brukere' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#780000] mb-4">Brukere</h2>
            {brukere.length === 0 ? (
              <div className="bg-[#FDF0D5] p-6 rounded-lg text-center">
                <p className="text-gray-600">Ingen brukere funnet</p>
              </div>
            ) : (
              brukere.map((bruker) => (
                <BrukerCard 
                  key={bruker.id}
                  bruker={bruker}
                  formatDato={formatDato}
                />
              ))
            )}
          </div>
        )}

        {activeTab === 'invitasjoner' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-[#780000]">Invitasjoner</h2>
              <button
                onClick={() => setShowCreateInvitation(true)}
                className="bg-[#780000] text-white px-4 py-2 rounded-lg hover:bg-[#C1121F] transition-colors"
              >
                Opprett ny invitasjon
              </button>
            </div>

            {showCreateInvitation && (
              <CreateInvitationForm 
                soknader={soknader.filter(s => s.status === 'godkjent')}
                onSubmit={opprettManuellInvitasjon}
                onCancel={() => setShowCreateInvitation(false)}
              />
            )}

            {invitasjoner.length === 0 ? (
              <div className="bg-[#FDF0D5] p-6 rounded-lg text-center">
                <p className="text-gray-600">Ingen invitasjoner funnet</p>
              </div>
            ) : (
              invitasjoner.map((invitasjon) => (
                <InvitasjonCard 
                  key={invitasjon.id}
                  invitasjon={invitasjon}
                  onCopyCode={kopierInvitasjonskode}
                  onDelete={slettInvitasjon}
                  formatDato={formatDato}
                  erUtlopt={erUtlopt}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}