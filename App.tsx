
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Pulse, ViewState } from './types';
import Nebula from './components/Nebula';
import Ritual from './components/Ritual';
import PulseView from './components/PulseView';
import ProfileView from './components/Profile';
import Intro from './components/Intro';
import IdentitySetup from './components/IdentitySetup';
import AmbientAudio from './components/AmbientAudio';
import { azureService } from './services/azureService';
import { generateBots } from './services/botService';

const ALL_BOTS = generateBots(10);

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('INTRO');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [selectedPulse, setSelectedPulse] = useState<Pulse | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);

      // Safety timeout of 5 seconds
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Loading timeout")), 5000)
      );

      try {
        const dataPromise = Promise.all([
          azureService.getUsers(),
          azureService.getPulses()
        ]);

        const [dbUsers, dbPulses] = await (Promise.race([dataPromise, timeoutPromise]) as Promise<[UserProfile[], Pulse[]]>);

        // Maintain exactly 1000 entities. Human users replace bots.
        const mergedUsers = [...dbUsers, ...ALL_BOTS.slice(0, Math.max(0, ALL_BOTS.length - dbUsers.length))];
        setUsers(mergedUsers);
        setPulses(dbPulses);
      } catch (err) {
        console.warn("Using bot entities due to:", err);
        setUsers(ALL_BOTS);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Check if user has posted today
  const hasPostedToday = currentUser?.lastPulseAt
    ? new Date(currentUser.lastPulseAt).toDateString() === new Date().toDateString()
    : false;

  const handleCreatePulse = async (content: string, imageUrl: string, energy: number, color: string, frequency: number, heartRate: number) => {
    if (!currentUser) return;

    const newPulse: Pulse = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      content,
      imageUrl,
      timestamp: Date.now(),
      energy,
      resonanceCount: 0,
      color,
      frequency,
      heartRate
    };

    const updatedUser = {
      ...currentUser,
      lastPulseAt: Date.now(),
      pulseCount: currentUser.pulseCount + 1,
      color
    };

    // Optimistic UI
    setPulses(prev => [newPulse, ...prev]);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
    setSelectedPulse(newPulse);
    setView('NEBULA');

    // Persist
    await Promise.all([
      azureService.savePulse(newPulse),
      azureService.saveUser(updatedUser)
    ]);
  };

  const handleResonate = async (pulseId: string) => {
    // Optimistic UI
    setPulses(prev => prev.map(p =>
      p.id === pulseId ? { ...p, resonanceCount: p.resonanceCount + 1 } : p
    ));

    if (selectedPulse?.id === pulseId) {
      setSelectedPulse(prev => prev ? { ...prev, resonanceCount: prev.resonanceCount + 1 } : null);
    }

    // Persist
    await azureService.resonatePulse(pulseId, currentUser?.id || 'anonymous');
  };

  const loginAsUser = (name: string) => {
    const user = users.find(u => u.name.toUpperCase() === name.toUpperCase()) || users[0];
    setCurrentUser(user);
    setView('NEBULA');
  };

  const handleIdentityComplete = async (newUser: UserProfile) => {
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setView('NEBULA');
    await azureService.saveUser(newUser);
  };

  const userResonanceMap = pulses.reduce((acc, p) => {
    acc[p.userId] = (acc[p.userId] || 0) + p.resonanceCount;
    return acc;
  }, {} as Record<string, number>);

  const usersWithResonance = Array.from(new Map(users.map(u => [u.id, u])).values()).map(u => ({
    ...u,
    totalResonance: userResonanceMap[u.id] || 0
  }));

  const collectiveEnergy = pulses.length > 0
    ? pulses.reduce((acc, p) => acc + p.energy, 0) / pulses.length
    : 0.5;

  const handleGenerateSeed = async () => {
    if (!currentUser) return;
    const currentResonance = userResonanceMap[currentUser.id] || 0;
    if (currentResonance < 5) return;

    const updatedUser = { ...currentUser, seedCount: currentUser.seedCount + 1 };

    // Optimistic Update
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);

    // Persist
    await azureService.saveUser(updatedUser);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#010205] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-8">
          <div className="w-16 h-16 border-2 border-cyan-500/10 border-t-cyan-400 rounded-full animate-spin" />
          <h1 className="font-header text-white/20 tracking-[1em] text-xs uppercase pl-[1em]">Sintonizando Oráculo</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full bg-[#010205] select-none overflow-hidden font-header">
      <AmbientAudio energy={collectiveEnergy} />
      {view === 'INTRO' && (
        <Intro
          onEnter={loginAsUser}
          onInitiate={() => setView('IDENTITY')}
        />
      )}

      {view === 'IDENTITY' && (
        <IdentitySetup onComplete={handleIdentityComplete} onCancel={() => setView('INTRO')} />
      )}

      {view !== 'INTRO' && view !== 'IDENTITY' && (
        <>
          <Nebula
            pulses={pulses}
            users={usersWithResonance}
            currentUser={currentUser}
            onSelectPulse={setSelectedPulse}
            onSelectUser={(u) => {
              setSelectedUser(u);
              setView('PROFILE');
            }}
            activeView={view === 'NEBULA' ? 'NEBULOSA' : view === 'RITUAL' ? 'PULSAR' : 'ESSÊNCIA'}
            onViewChange={(v) => {
              if (v === 'NEBULOSA') setView('NEBULA');
              if (v === 'PULSAR') setView('RITUAL');
              if (v === 'ESSÊNCIA') {
                setSelectedUser(currentUser);
                setView('PROFILE');
              }
            }}
          />

          {/* Global UI Elements */}
          <div className="fixed top-12 left-12 z-40 group cursor-default">
            <h1 className="font-header text-3xl font-bold tracking-[0.8em] text-white/40 group-hover:text-white transition-all duration-1000 animate-pulse-slow">
              A.U.R.A
            </h1>
            <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-cyan-500/0 via-cyan-500/80 to-transparent transition-all duration-1000 mt-3 shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          </div>

          <div className="fixed top-12 right-12 z-40 text-right group">
            <div className="text-[9px] tracking-[0.5em] text-cyan-400/40 uppercase font-bold mb-2 group-hover:text-cyan-400/70 transition-colors">Sistema de Ressonância</div>
            <div className="flex flex-col items-end">
              <div className="text-4xl font-extralight text-white/30 group-hover:text-white/60 transition-all duration-700 tabular-nums flex items-baseline outline-none">
                <span className="text-xs mr-4 tracking-[0.2em] opacity-20 font-bold italic">COLLECTIVE</span>
                {(pulses.length * 0.12 + collectiveEnergy * 0.1).toFixed(3)}
                <span className="text-[10px] ml-3 tracking-[0.3em] opacity-40 font-black">HZ</span>
              </div>
              <div className="w-32 h-[2px] bg-white/5 mt-2 relative overflow-hidden">
                <div className="absolute inset-0 bg-cyan-500/40 animate-loading-bar" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {view === 'RITUAL' && (
        <Ritual onPulseCreated={handleCreatePulse} onCancel={() => setView('NEBULA')} />
      )}

      {selectedPulse && (
        <PulseView
          pulse={selectedPulse}
          onClose={() => setSelectedPulse(null)}
          onResonate={() => handleResonate(selectedPulse.id)}
        />
      )}

      {view === 'PROFILE' && selectedUser && (
        <ProfileView
          user={{ ...selectedUser, totalResonance: userResonanceMap[selectedUser.id] || 0 }}
          isOwn={selectedUser.id === currentUser?.id}
          onClose={() => setView('NEBULA')}
          onGenerateSeed={handleGenerateSeed}
        />
      )}
    </div>
  );
};

export default App;
