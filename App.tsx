
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Pulse, ViewState } from './types';
import Nebula from './components/Nebula';
import Ritual from './components/Ritual';
import PulseView from './components/PulseView';
import ProfileView from './components/Profile';
import Intro from './components/Intro';
import IdentitySetup from './components/IdentitySetup';
import AmbientAudio from './components/AmbientAudio';

// Mock initial data
const INITIAL_USERS: UserProfile[] = [
  { id: '1', name: 'Zion', portraitUrl: 'https://picsum.photos/400/400', vibe: 'Ethereal Explorer', pulseCount: 12, lastPulseAt: Date.now() - 100000, seedCount: 1, communityCount: 0 },
  { id: '2', name: 'Gaia', portraitUrl: 'https://picsum.photos/401/401', vibe: 'Deep Resonance', pulseCount: 5, lastPulseAt: Date.now() - 500000, seedCount: 0, communityCount: 1 },
  { id: '3', name: 'Kael', portraitUrl: 'https://picsum.photos/402/402', vibe: 'Silent Weaver', pulseCount: 0, lastPulseAt: null, seedCount: 2, communityCount: 0 },
  { id: '4', name: 'Nyx', portraitUrl: 'https://picsum.photos/403/403', vibe: 'Night Architect', pulseCount: 20, lastPulseAt: Date.now() - 200000, seedCount: 1, communityCount: 2 },
];

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('INTRO');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const [selectedPulse, setSelectedPulse] = useState<Pulse | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Check if user has posted today
  const hasPostedToday = currentUser?.lastPulseAt
    ? new Date(currentUser.lastPulseAt).toDateString() === new Date().toDateString()
    : false;

  const handleCreatePulse = (content: string, imageUrl: string, energy: number) => {
    if (!currentUser) return;

    const newPulse: Pulse = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      userName: currentUser.name,
      content,
      imageUrl,
      timestamp: Date.now(),
      energy,
      resonanceCount: 0
    };

    setPulses(prev => [newPulse, ...prev]);
    setUsers(prev => prev.map(u =>
      u.id === currentUser.id
        ? { ...u, lastPulseAt: Date.now(), pulseCount: u.pulseCount + 1 }
        : u
    ));
    setCurrentUser(prev => prev ? { ...prev, lastPulseAt: Date.now(), pulseCount: prev.pulseCount + 1 } : null);

    setSelectedPulse(newPulse);
    setView('NEBULA');
  };

  const handleResonate = (pulseId: string) => {
    setPulses(prev => prev.map(p =>
      p.id === pulseId ? { ...p, resonanceCount: p.resonanceCount + 1 } : p
    ));

    // If the selected pulse is being resonated, update it too
    if (selectedPulse?.id === pulseId) {
      setSelectedPulse(prev => prev ? { ...prev, resonanceCount: prev.resonanceCount + 1 } : null);
    }
  };

  const loginAsUser = (name: string) => {
    const user = users.find(u => u.name.toUpperCase() === name.toUpperCase()) || users[0];
    setCurrentUser(user);
    setView('NEBULA');
  };

  const handleIdentityComplete = (newUser: UserProfile) => {
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setView('NEBULA');
  };

  const userResonanceMap = pulses.reduce((acc, p) => {
    acc[p.userId] = (acc[p.userId] || 0) + p.resonanceCount;
    return acc;
  }, {} as Record<string, number>);

  const usersWithResonance = users.map(u => ({
    ...u,
    totalResonance: userResonanceMap[u.id] || 0
  }));

  return (
    <div className="relative min-h-screen w-full bg-[#020408] select-none overflow-hidden font-header">
      <AmbientAudio />
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
            onSelectPulse={setSelectedPulse}
            onSelectUser={(u) => {
              setSelectedUser(u);
              setView('PROFILE');
            }}
          />

          {/* Navigation Overlay */}
          <div className="fixed bottom-12 left-0 right-0 z-40 flex justify-center pointer-events-none">
            <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-full px-10 py-5 flex items-center space-x-16 pointer-events-auto shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <button
                onClick={() => setView('NEBULA')}
                className={`text-[9px] tracking-[0.5em] uppercase transition-all duration-500 font-bold ${view === 'NEBULA' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-white/30 hover:text-white'}`}
              >
                Nebulosa
              </button>

              <button
                disabled={hasPostedToday}
                onClick={() => setView('RITUAL')}
                className={`relative px-8 py-3 group transition-all duration-700 ${hasPostedToday ? 'opacity-20 grayscale' : 'opacity-100'}`}
              >
                <div className="absolute inset-0 bg-cyan-500/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 border border-cyan-500/20 rounded-full scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-700" />
                <span className="relative text-[10px] tracking-[0.6em] font-bold text-white uppercase">
                  {hasPostedToday ? 'SACRALIZADO' : 'PULSAR'}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedUser(currentUser);
                  setView('PROFILE');
                }}
                className={`text-[9px] tracking-[0.5em] uppercase transition-all duration-500 font-bold ${view === 'PROFILE' ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'text-white/30 hover:text-white'}`}
              >
                Essência
              </button>
            </div>
          </div>

          {/* Global UI Elements */}
          <div className="fixed top-12 left-12 z-40 group cursor-default">
            <h1 className="font-header text-3xl font-bold tracking-[0.8em] text-white/40 group-hover:text-white transition-all duration-1000 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              AURA
            </h1>
            <div className="h-px w-0 group-hover:w-full bg-gradient-to-r from-cyan-500/0 via-cyan-500/50 to-transparent transition-all duration-1000 mt-2" />
          </div>

          <div className="fixed top-12 right-12 z-40 text-right group">
            <div className="text-[8px] tracking-[0.4em] text-cyan-400/60 uppercase font-bold mb-1 group-hover:text-cyan-400 transition-colors">Ressonância Coletiva</div>
            <div className="text-3xl font-light text-white/40 group-hover:text-white/60 transition-colors tabular-nums">
              {(pulses.length * 0.12).toFixed(2)}<span className="text-xs ml-2 tracking-widest opacity-50">Hz</span>
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
          user={selectedUser}
          isOwn={selectedUser.id === currentUser?.id}
          onClose={() => setView('NEBULA')}
        />
      )}
    </div>
  );
};

export default App;
