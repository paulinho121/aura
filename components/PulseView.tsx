
import React from 'react';
import { Pulse } from '../types';


interface PulseViewExtendedProps {
  pulse: Pulse;
  onClose: () => void;
  onResonate: () => void;
}

const PulseView: React.FC<PulseViewExtendedProps> = ({ pulse, onClose, onResonate }) => {
  const [echoContent, setEchoContent] = React.useState<{ text: string; source: string } | null>(null);
  const [isEchoing, setIsEchoing] = React.useState(false);

  const handleEcho = async () => {
    setIsEchoing(true);
    // In a real RAG system, we'd query a vector DB. 
    // Here we simulate the AI finding a deep connection from the "primordial" data.
    setTimeout(() => {
      setEchoContent({
        text: "No silêncio das primeiras pulsações, a vibração já previa esta manifestação.",
        source: "Ciclo Ancestral - Gaia"
      });
      setIsEchoing(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-[#020408]/98 backdrop-blur-3xl flex flex-col md:flex-row items-stretch overflow-hidden animate-in fade-in duration-1000">
      <div className="flex-1 relative group overflow-hidden">
        {echoContent ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-20 animate-in zoom-in duration-1000">
            <div className="max-w-xl text-center space-y-8">
              <div className="text-cyan-400 text-[10px] tracking-[1em] uppercase font-black opacity-60">Memória Ecoada</div>
              <p className="text-white/80 text-3xl font-light italic leading-relaxed">"{echoContent.text}"</p>
              <div className="text-white/20 text-[10px] tracking-[0.5em] uppercase">— {echoContent.source}</div>
              <button onClick={() => setEchoContent(null)} className="mt-8 text-cyan-400/40 hover:text-cyan-400 text-[10px] tracking-[0.4em] uppercase font-bold transition-all">Retornar à Visão</button>
            </div>
          </div>
        ) : null}

        <img
          src={pulse.imageUrl}
          alt="Pulse visual"
          className={`w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-[2s] scale-110 group-hover:scale-100 ${echoContent ? 'blur-2xl scale-125' : ''}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#020408] via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[150px] rounded-full animate-pulse" />
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

            {pulse.heartRate && (
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[10px] tracking-[0.3em] font-mono text-white/40">{pulse.heartRate} BPM CAPTURADO</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-16">
          <div className="flex flex-col items-center space-y-10 py-12 px-8 bg-white/[0.02] rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group/btn">
            <div className="absolute inset-0 bg-cyan-500/0 group-hover/btn:bg-cyan-500/5 transition-colors duration-1000" />

            <div className="flex items-center justify-around w-full">
              <button onClick={onResonate} className="group relative flex flex-col items-center space-y-4">
                <div className="relative w-20 h-20 rounded-full border border-white/10 flex items-center justify-center transition-all group-hover:border-cyan-400">
                  <div className="text-white text-2xl font-light opacity-60 group-hover:opacity-100 group-hover:text-cyan-400">✧</div>
                </div>
                <div className="text-[8px] tracking-[0.4em] text-cyan-400/40 uppercase font-black">Harmonizar</div>
              </button>

              <button onClick={handleEcho} disabled={isEchoing} className="group relative flex flex-col items-center space-y-4">
                <div className={`relative w-20 h-20 rounded-full border border-white/10 flex items-center justify-center transition-all group-hover:border-purple-400 ${isEchoing ? 'animate-pulse border-purple-400' : ''}`}>
                  <div className="text-white text-2xl font-light opacity-60 group-hover:opacity-100 group-hover:text-purple-400">回</div>
                </div>
                <div className="text-[8px] tracking-[0.4em] text-purple-400/40 uppercase font-black">{isEchoing ? 'Buscando...' : 'Ecoar'}</div>
              </button>
            </div>

            <div className="text-center group-hover:scale-110 transition-transform duration-700">
              <div className="text-4xl font-light text-white tracking-widest tabular-nums">{pulse.resonanceCount}</div>
              <div className="text-[10px] tracking-[0.5em] text-white/10 uppercase font-black mt-2">Harmonias Coletivas</div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between text-[11px] tracking-[0.5em] text-white/30 font-bold uppercase">
              <span>Sincronia {pulse.frequency}Hz</span>
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
