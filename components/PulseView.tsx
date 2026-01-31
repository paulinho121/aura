
import React from 'react';
import { Pulse } from '../types';

interface PulseViewProps {
  pulse: Pulse;
  onClose: () => void;
  onResonate: () => void;
}

const PulseView: React.FC<PulseViewProps> = ({ pulse, onClose, onResonate }) => {
  return (
    <div className="fixed inset-0 z-[200] bg-[#020408]/98 backdrop-blur-3xl flex flex-col md:flex-row items-stretch overflow-hidden animate-in fade-in duration-1000">
      <div className="flex-1 relative group overflow-hidden">
        <img
          src={pulse.imageUrl}
          alt="Pulse visual"
          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-[2s] scale-110 group-hover:scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#020408] via-transparent to-transparent pointer-events-none" />

        {/* Floating Aura Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full animate-[pulse_8s_infinite]" />
      </div>

      <div className="w-full md:w-[500px] p-12 md:p-20 flex flex-col justify-between border-l border-white/5 bg-white/[0.01] relative z-10 backdrop-blur-sm">
        <div className="space-y-16">
          <button
            onClick={onClose}
            className="group flex items-center space-x-4 text-white/20 hover:text-white transition-all uppercase tracking-[0.6em] text-[10px] font-bold"
          >
            <span className="transform group-hover:-translate-x-2 transition-transform duration-500">←</span>
            <span>Nebulosa</span>
          </button>

          <div className="space-y-10">
            <div className="space-y-3">
              <span className="text-cyan-400 font-bold text-[10px] tracking-[1em] block uppercase opacity-40">MANIFESTAÇÃO</span>
              <h3 className="text-white/60 text-xl font-header tracking-widest">{pulse.userName}</h3>
            </div>

            <div className="max-w-md">
              <p className="text-4xl md:text-5xl font-light leading-[1.3] text-white tracking-tight drop-shadow-sm italic">
                "{pulse.content}"
              </p>
            </div>

            <div className="h-px w-16 bg-gradient-to-r from-cyan-500/20 to-transparent" />
          </div>
        </div>

        <div className="space-y-16">
          {/* Resonance Actions */}
          <div className="flex flex-col items-center space-y-10 py-12 px-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group/btn">
            <div className="absolute inset-0 bg-cyan-500/0 group-hover/btn:bg-cyan-500/5 transition-colors duration-1000" />

            <button
              onClick={onResonate}
              className="group relative flex flex-col items-center space-y-6"
            >
              <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/20 blur-[60px] transition-all duration-1000 rounded-full" />
              <div className="relative w-28 h-28 rounded-full border border-white/10 flex items-center justify-center transition-all duration-[1.5s] group-hover:border-cyan-400 group-hover:scale-105">
                <div className="text-white text-4xl font-light group-hover:text-cyan-400 transition-colors duration-700">✧</div>

                {/* Orbital dots for the button */}
                <div className="absolute inset-0 border border-cyan-500/10 rounded-full scale-125 animate-[spin_10s_linear_infinite]" />
              </div>

              <div className="text-center relative">
                <div className="text-4xl font-light text-white tracking-widest tabular-nums">{pulse.resonanceCount}</div>
                <div className="text-[10px] tracking-[0.5em] text-cyan-400/40 uppercase font-black mt-2">Harmonias</div>
              </div>
            </button>
            <p className="text-[10px] text-white/20 tracking-[0.3em] uppercase font-medium text-center italic">Elevar Variação Coletiva</p>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between text-[11px] tracking-[0.5em] text-white/30 font-bold uppercase">
              <span>Sincronia Energética</span>
              <span className="text-cyan-400/60">{Math.round(pulse.energy * 100)}%</span>
            </div>
            <div className="w-full h-px bg-white/5 relative">
              <div
                className="absolute top-0 left-0 h-full bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] transition-all duration-1000"
                style={{ width: `${pulse.energy * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-white/10 italic tracking-widest leading-loose">
              Este pulso é efêmero e transmutará ao próximo ciclo. Aproveite a presença.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PulseView;
