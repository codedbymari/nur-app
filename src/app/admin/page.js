'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import DebugPanel from '../../components/DebugPanel.js';
import ErrorBoundary from '@/components/ErrorBoundary';
import { getCurrentUTCDateTime, formatLocalDateTime, formatUTCDateTime } from '@/utils/dateTime';

// Import components
import LoginForm from '@/components/admin/LoginForm';
import AdminHeader from '@/components/admin/AdminHeader';
import StatisticsGrid from '@/components/admin/StatisticsGrid';
import TabNavigation from '@/components/admin/TabNavigation';
import SoknadCard from '@/components/admin/SoknadCard';
import BrukerCard from '@/components/admin/BrukerCard';
import InvitasjonCard from '@/components/admin/InvitasjonCard';
import CreateInvitationForm from '@/components/admin/CreateInvitationForm';

// Utility functions outside component to prevent re-creation
const formatDato = (dateString) => {
  return formatLocalDateTime(dateString);
};

const erUtlopt = (dato) => {
  try {
    return new Date(dato) < new Date();
  } catch (error) {
    console.error('Date comparison error:', error);
    return true;
  }
};

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
  
  // Use refs to prevent unnecessary re-renders
  const isDataLoading = useRef(false);
  const hasLoadedInitialData = useRef(false);

  // Memoize admin emails to prevent re-creation
  const adminEmails = useMemo(() => ['marjamahassanali@gmail.com', 'admin@nur.no'], []);

  const checkUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setShowLogin(true);
        setLoading(false);
        return;
      }

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
  }, [adminEmails, router]);

  // Optimized loadData with ref to prevent multiple calls
  const loadData = useCallback(async () => {
    // Prevent multiple simultaneous data loading calls
    if (isDataLoading.current) {
      return;
    }

    isDataLoading.current = true;
    
    try {
      const currentDateTime = getCurrentUTCDateTime();
      console.log(`[${currentDateTime}] Loading data...`);
   
      // Load applications
      const { data: soknadData, error: soknadError } = await supabase
        .from('soknad')
        .select('*')
        .order('created_at', { ascending: false });

      if (soknadError) throw soknadError;

      // Load users
      const { data: brukerData, error: brukerError } = await supabase
        .from('brukere')
        .select('*')
        .order('created_at', { ascending: false });
      if (brukerError) throw brukerError;

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
        .order('opprettet_dato', { ascending: false });

      if (invitasjonError) throw invitasjonError;

      // Update state in batch to minimize re-renders
      const newSoknader = soknadData || [];
      const newBrukere = brukerData || [];
      const newInvitasjoner = invitasjonData || [];

      // Calculate statistics
      const stats = {
        totalSoknader: newSoknader.length,
        ventendeSoknader: newSoknader.filter(s => s.status === 'pending').length,
        godkjenteSoknader: newSoknader.filter(s => s.status === 'godkjent').length,
        avslatteSoknader: newSoknader.filter(s => s.status === 'avslatt').length,
        aktiveBrukere: newBrukere.filter(b => b.status === 'aktiv').length,
        totalBrukere: newBrukere.length,
        totalInvitasjoner: newInvitasjoner.length,
        bruktInvitasjoner: newInvitasjoner.filter(i => i.brukt).length,
        aktiveInvitasjoner: newInvitasjoner.filter(i => !i.brukt && new Date(i.utloper_dato) > new Date()).length
      };

      // Batch state updates
      setSoknader(newSoknader);
      setBrukere(newBrukere);
      setInvitasjoner(newInvitasjoner);
      setStatistikk(stats);
      
      hasLoadedInitialData.current = true;

    } catch (error) {
      const currentDateTime = getCurrentUTCDateTime();
      console.error(`[${currentDateTime}] Data loading error:`, error);
      alert('Feil ved lasting av data');
    } finally {
      isDataLoading.current = false;
    }
  }, []);

  // Create invitation function - fixed with correct column names
  const opprettInvitasjon = useCallback(async (soknadId, customMessage = '') => {
    try {
      const kode = Math.random().toString(36).substring(2, 10).toUpperCase();
      const utloperAt = new Date();
      utloperAt.setDate(utloperAt.getDate() + 14);
      
      const invitationData = {
        kode,
        soknad_id: soknadId,
        utloper_dato: utloperAt.toISOString(),
        message: customMessage || 'Velkommen til NÜR!',
        opprettet_dato: new Date().toISOString(),
        brukt: false,
        max_bruk: 1
      };
      
      console.log('📝 Creating invitation:', invitationData);

      const { data, error } = await supabase
        .from('invitasjoner')
        .insert(invitationData)
        .select()
        .single();

      if (error) {
        console.error('❌ Invitation error:', error);
        throw error;
      }
      
      console.log('✅ Invitation created:', data);
      return kode;
    } catch (error) {
      console.error('Invitation creation failed:', error);
      throw error;
    }
  }, []);

  // Updated status update function with proper memoization
  const oppdaterSoknadStatus = useCallback(async (soknadId, nyStatus) => {
    console.log('🔧 oppdaterSoknadStatus called with:', { soknadId, nyStatus });
    
    try {
      const currentDateTime = getCurrentUTCDateTime();
      console.log(`[${currentDateTime}] Updating application status: ${soknadId} to ${nyStatus}`);
      
      // Update the application status in Supabase
      const { error } = await supabase
        .from('soknad')
        .update({ 
          status: nyStatus,
          updated_at: currentDateTime
        })
        .eq('id', soknadId);

      if (error) {
        console.error('Supabase update error:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Status update successful');

      // Handle invitation creation for approved applications
      let invitationCreated = false;
      if (nyStatus === 'godkjent') {
        try {
          await opprettInvitasjon(soknadId);
          console.log('Invitation created successfully');
          invitationCreated = true;
        } catch (inviteError) {
          console.error('Failed to create invitation:', inviteError);
          alert('Søknad godkjent, men det oppstod en feil ved opprettelse av invitasjon');
        }
      }

      // Update local state immediately (optimistic update)
      setSoknader(prevSoknader => {
        const updatedSoknader = prevSoknader.map(soknad => 
          soknad.id === soknadId 
            ? { ...soknad, status: nyStatus, updated_at: currentDateTime }
            : soknad
        );
        
        return updatedSoknader;
      });

      // Update statistics separately to avoid closure issues
      setStatistikk(prevStats => {
        let newStats = { ...prevStats };
        
        // Find the old status from the current state
        const oldSoknad = soknader.find(s => s.id === soknadId);
        if (oldSoknad) {
          // Decrease count for old status
          if (oldSoknad.status === 'pending') newStats.ventendeSoknader--;
          else if (oldSoknad.status === 'godkjent') newStats.godkjenteSoknader--;
          else if (oldSoknad.status === 'avslatt') newStats.avslatteSoknader--;
        }
        
        // Increase count for new status
        if (nyStatus === 'pending') newStats.ventendeSoknader++;
        else if (nyStatus === 'godkjent') newStats.godkjenteSoknader++;
        else if (nyStatus === 'avslatt') newStats.avslatteSoknader++;
        
        // Update invitation stats if invitation was created
        if (invitationCreated) {
          newStats.totalInvitasjoner++;
          newStats.aktiveInvitasjoner++;
        }
        
        return newStats;
      });

      // Show success message
      const successMessage = nyStatus === 'godkjent' 
        ? 'Søknad godkjent og invitasjon opprettet'
        : `Søknad ${nyStatus === 'avslått' ? 'avslått' : 'oppdatert'}`;
      
      alert(successMessage);
      
    } catch (error) {
      const currentDateTime = getCurrentUTCDateTime();
      console.error(`[${currentDateTime}] Status update error:`, error);
      alert('Feil ved oppdatering: ' + error.message);
    }
  }, [opprettInvitasjon, soknader]);

  const handleLogin = useCallback(async (loginForm) => {
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
  }, [adminEmails]);

  const handleLogout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setShowLogin(true);
      hasLoadedInitialData.current = false;
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const opprettManuellInvitasjon = useCallback(async (formData) => {
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
  }, [opprettInvitasjon, loadData]);

  const kopierInvitasjonskode = useCallback((kode) => {
    const inviteUrl = `${window.location.origin}/invite/${kode}`;
    navigator.clipboard.writeText(inviteUrl);
    alert('Invitasjonslenke kopiert til utklippstavle!');
  }, []);

  const slettInvitasjon = useCallback(async (invitasjonId) => {
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
  }, [loadData]);

  // Effects
  useEffect(() => {
    checkUser();
  }, [checkUser]);

  useEffect(() => {
    if (user && !hasLoadedInitialData.current) {
      loadData();
    }
  }, [user, loadData]);

  // Memoize the SoknadCards to prevent unnecessary re-renders
  const soknadCards = useMemo(() => {
    return soknader.map((soknad) => (
      <SoknadCard 
        key={soknad.id}
        soknad={soknad}
        onUpdateStatus={oppdaterSoknadStatus}
        formatDato={formatDato}
      />
    ));
  }, [soknader, oppdaterSoknadStatus]);

  // Memoize the BrukerCards
  const brukerCards = useMemo(() => {
    return brukere.map((bruker) => (
      <ErrorBoundary key={`error-boundary-${bruker.id}`}>
        <BrukerCard 
          key={bruker.id}
          bruker={bruker}
          formatDato={formatDato}
        />
      </ErrorBoundary>
    ));
  }, [brukere]);

  // Memoize the InvitasjonCards
  const invitasjonCards = useMemo(() => {
    return invitasjoner.map((invitasjon) => (
      <ErrorBoundary key={`error-boundary-${invitasjon.id}`}>
        <InvitasjonCard 
          key={invitasjon.id}
          invitasjon={invitasjon}
          onCopyCode={kopierInvitasjonskode}
          onDelete={slettInvitasjon}
          formatDato={formatDato}
          erUtlopt={erUtlopt}
        />
      </ErrorBoundary>
    ));
  }, [invitasjoner, kopierInvitasjonskode, slettInvitasjon]);

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

  // Main render
  return (
    <div className="min-h-screen bg-white">
      <AdminHeader 
        user={user}
        onLogout={handleLogout}
      />
      
      {process.env.NODE_ENV === 'development' && <DebugPanel />}

      <ErrorBoundary>
        <div className="max-w-7xl mx-auto p-6">
          <StatisticsGrid statistikk={statistikk} />
          
          <TabNavigation 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {activeTab === 'soknader' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-[#780000] mb-4">Søknader</h2>
              {soknader.length === 0 ? (
                <div className="bg-[#FDF0D5] p-6 rounded-lg text-center">
                  <p className="text-gray-600">Ingen søknader funnet</p>
                </div>
              ) : (
                soknadCards
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
                brukerCards
              )}
            </div>
          )}

          {activeTab === 'invitasjoner' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-[#780000]">Invitasjoner</h2>
                <button
                  onClick={() => setShowCreateInvitation(true)}
                  className="bg-[#780000] text-white px-4 py-2 rounded-lg hover:bg-[#C1121F] transition-colors"
                >
                  Opprett ny invitasjon
                </button>
              </div>

              {showCreateInvitation && (
                <ErrorBoundary>
                  <CreateInvitationForm 
                    soknader={soknader.filter(s => s.status === 'godkjent')}
                    onSubmit={opprettManuellInvitasjon}
                    onCancel={() => setShowCreateInvitation(false)}
                  />
                </ErrorBoundary>
              )}

              {invitasjoner.length === 0 ? (
                <div className="bg-[#FDF0D5] p-6 rounded-lg text-center">
                  <p className="text-gray-600">Ingen invitasjoner funnet</p>
                </div>
              ) : (
                invitasjonCards
              )}
            </div>
          )}
        </div>
      </ErrorBoundary>
    </div>
  );
}