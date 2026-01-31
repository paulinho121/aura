
import React from 'react';
import { UserProfile } from '../types';


interface ProfileProps {
  user: UserProfile & { totalResonance?: number };
  isOwn: boolean;
  onClose: () => void;
  onGenerateSeed?: () => void;
}

const ProfileView: React.FC<ProfileProps> = ({ user, isOwn, onClose, onGenerateSeed }) => {
  const canGenerateSeed = isOwn && (user.totalResonance || 0) >= 5;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end pointer-events-none">
      {/* Background Overlay for mobile or to focus */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto"
        onClick={onClose}
      />

      {/* Profile Sidebar */}
      <div className="relative w-full max-w-xl h-full bg-[#050a12]/95 backdrop-blur-[100px] border-l border-white/5 pointer-events-auto flex flex-col shadow-[-50px_0_100px_rgba(0,0,0,0.5)] animate-in-right">

        {/* Top Header */}
        <div className="p-12 pb-6">
          <button
            onClick={onClose}
            className="group flex items-center space-x-4 text-white/20 hover:text-white transition-all"
          >
            <span className="text-xl font-light group-hover:-translate-x-2 transition-transform">←</span>
            <span className="text-[10px] tracking-[0.6em] font-bold uppercase">Nebulosa</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-12 pt-8 space-y-16 scrollbar-hide">

          {/* User ID Section */}
          <div className="space-y-4">
            <span className="text-[10px] tracking-[0.8em] text-cyan-400 font-black uppercase opacity-60">Manifestação</span>
            <h2 className="text-4xl md:text-5xl font-header font-bold tracking-[0.2em] text-white/90 leading-tight">
              {user.name.toUpperCase()}
            </h2>
          </div>

          {/* Vibe / Quote */}
          <div className="py-8">
            <blockquote className="text-5xl md:text-7xl font-light italic text-white leading-[1.1] tracking-tight">
              "{user.vibe}"
            </blockquote>
          </div>

          {/* Stats / BPM */}
          <div className="flex items-center space-x-4 py-8 border-t border-white/10">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] tracking-[0.5em] text-white/40 font-bold uppercase">
              {Math.floor(60 + Math.random() * 20)} BPM CAPTURADO
            </span>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-12 py-12">
            <div className="flex flex-col items-center space-y-6">
              <button className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-cyan-500/50 transition-all group shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                <span className="text-2xl text-white/20 group-hover:text-cyan-400">✨</span>
              </button>
              <span className="text-[9px] tracking-[0.4em] font-black text-cyan-400 uppercase">Harmonizar</span>
            </div>
            <div className="flex flex-col items-center space-y-6">
              <button className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-purple-500/50 transition-all group shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                <span className="text-2xl text-white/20 group-hover:text-purple-400">回</span>
              </button>
              <span className="text-[9px] tracking-[0.4em] font-black text-purple-400 uppercase">Ecoar</span>
            </div>
          </div>

          {/* Seed/Community Area */}
          <div className="pt-12 border-t border-white/5 space-y-8">
            <div className="flex flex-col items-center py-10">
              <div className="w-16 h-16 rounded-full border border-white/5 flex items-center justify-center mb-6">
                <div className="w-4 h-4 rounded-full border border-white/20 animate-ping" />
              </div>
              <span className="text-[10px] tracking-[0.8em] font-black text-white/20 uppercase">Harmonias Coletivas</span>
            </div>

            {isOwn && (
              <button
                disabled={!canGenerateSeed}
                onClick={onGenerateSeed}
                className={`w-full py-6 rounded-2xl text-[10px] font-bold tracking-[0.5em] uppercase transition-all flex items-center justify-center space-x-4 ${canGenerateSeed ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' : 'bg-white/5 text-white/10 grayscale cursor-not-allowed border border-white/5'}`}
              >
                <span>Gerar Semente</span>
                <span className="opacity-40">-5 Ressonância</span>
              </button>
            )}
          </div>

        </div>

        {/* CSS for specialized animations */}
        <style>{`
          .animate-in-right {
            animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </div>
    </div>
  );
};

export default ProfileView;
