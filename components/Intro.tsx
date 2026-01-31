
import React from 'react';

interface IntroProps {
  onEnter: (name: string) => void;
  onInitiate: () => void;
}

const Intro: React.FC<IntroProps> = ({ onEnter, onInitiate }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-[#020408] flex flex-col items-center p-8 overflow-y-auto overflow-x-hidden scrollbar-hide pt-32 pb-20">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vh] bg-gradient-to-tr from-cyan-900/10 via-transparent to-purple-900/10 opacity-30" />

        {/* Massive Watermark */}
        <h2 className="text-[35vw] font-bold tracking-[0.1em] text-white/[0.015] select-none leading-none pl-[0.1em] pointer-events-none">
          AURA
        </h2>
      </div>

      <div className="max-w-4xl w-full text-center space-y-16 relative z-10 flex flex-col items-center">
        {/* Header Title */}
        <div className="space-y-6">
          <div className="flex flex-col items-center">
            <h1 className="font-header text-[clamp(2.5rem,9vw,6rem)] font-bold tracking-[0.8em] text-white drop-shadow-[0_0_60px_rgba(255,255,255,0.4)] leading-none select-none pl-[0.8em] animate-in fade-in zoom-in duration-1000">
              AURA
            </h1>
            <div className="h-px w-48 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-10" />
            <p className="text-cyan-400/60 text-[10px] tracking-[1.5em] font-bold uppercase mt-8 pl-[1.5em]">O Ritual de Presença Digital</p>
          </div>
        </div>

        {/* Poetic Mission */}
        <div className="space-y-8 text-white/40 text-sm md:text-base tracking-[0.3em] font-light italic leading-loose max-w-2xl px-4">
          <p className="opacity-0 animate-[fadeInUp_1s_ease-out_forwards_0.5s]">Não somos uma rede de visualização.</p>
          <p className="opacity-0 animate-[fadeInUp_1s_ease-out_forwards_1s]">Somos um ritual de presença consciente.</p>
          <p className="opacity-0 animate-[fadeInUp_1s_ease-out_forwards_1.5s]">Um pulso por dia. Silêncio compartilhado.</p>
        </div>

        {/* Login Options (Existing frequencies) */}
        <div className="pt-12 space-y-16 opacity-0 animate-[fadeInUp_1s_ease-out_forwards_2.5s] w-full">
          <div className="flex flex-col items-center space-y-8">
            <span className="text-[10px] tracking-[0.5em] text-white/20 uppercase font-bold">Resgatar Frequência Existente</span>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {['ZION', 'GAIA', 'KAEL', 'NYX'].map(name => (
                <button
                  key={name}
                  onClick={() => onEnter(name)}
                  className="group relative px-8 py-4 border border-white/5 bg-white/[0.02] backdrop-blur-3xl hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all duration-700 rounded-full overflow-hidden"
                >
                  <span className="relative z-10 text-[10px] font-bold tracking-[0.6em] text-white/60 group-hover:text-white transition-colors">{name}</span>
                  <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-cyan-500/10 to-transparent transition-transform duration-700" />
                </button>
              ))}
            </div>
          </div>

          {/* Account Creation Portal */}
          <div className="pt-12 border-t border-white/5 w-full flex flex-col items-center">
            <button
              onClick={onInitiate}
              className="group relative flex flex-col items-center space-y-6 transition-all duration-700 hover:scale-105"
            >
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border border-white/10 rounded-full animate-[spin_5s_linear_infinite]" />
                <div className="absolute inset-2 border border-cyan-500/30 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
                <div className="text-white text-xl font-light group-hover:text-cyan-400 transition-colors">+</div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[12px] tracking-[0.8em] font-bold text-white uppercase group-hover:text-cyan-400 transition-all pl-[0.8em]">Criar Nova Identidade</span>
                <span className="text-[9px] tracking-[0.4em] text-white/20 uppercase mt-2 font-medium">Manifeste sua presença na rede</span>
              </div>
              <div className="w-px h-16 bg-gradient-to-b from-white/20 via-cyan-500/40 to-transparent mt-4 group-hover:h-24 transition-all duration-1000" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="fixed bottom-12 text-[9px] text-white/10 uppercase tracking-[0.6em] font-medium select-none">
          CORTEX HUMANUM • DIGITAL SOUL RITUAL • MMXXVI
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); filter: blur(10px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>
    </div>
  );
};

export default Intro;
