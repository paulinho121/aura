
import React from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  isOwn: boolean;
  onClose: () => void;
}

const ProfileView: React.FC<ProfileProps> = ({ user, isOwn, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020408]/90 backdrop-blur-3xl p-6">
      <div className="absolute inset-0 pointer-events-none overflow-hidden text-white/5 font-header text-[20vh] opacity-10 flex items-center justify-center select-none">
        {user.name.toUpperCase()}
      </div>

      <div className="w-full max-w-5xl relative z-10 bg-white/5 border border-white/10 p-12 md:p-20 rounded-[3rem] backdrop-blur-2xl shadow-[0_0_100px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">
          <div className="relative group">
            <div className="absolute -inset-8 bg-cyan-500/10 blur-[60px] rounded-full animate-pulse transition-all duration-1000 group-hover:bg-cyan-500/20" />
            <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full overflow-hidden border border-white/10 shadow-2xl">
              <img
                src={user.portraitUrl}
                alt="Symbolic Portrait"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-100"
              />
            </div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-3xl px-6 py-3 border border-white/10 rounded-full shadow-xl">
              <span className="text-[9px] font-bold tracking-[0.4em] text-cyan-400 uppercase">Frequência Harmônica</span>
            </div>
          </div>

          <div className="flex-1 space-y-12 text-center md:text-left">
            <header className="space-y-4">
              <h2 className="font-header text-5xl md:text-7xl font-bold tracking-[0.3em] text-white leading-tight">{user.name}</h2>
              <div className="flex items-center justify-center md:justify-start space-x-4">
                <div className="h-px w-8 bg-cyan-500/40" />
                <p className="text-cyan-400/60 tracking-[0.4em] uppercase text-[10px] font-medium leading-relaxed italic">{user.vibe}</p>
              </div>
            </header>

            <div className="grid grid-cols-2 gap-12 py-10 border-y border-white/5">
              <div className="space-y-2">
                <div className="text-4xl font-light text-white tracking-tighter">{user.pulseCount}</div>
                <div className="text-[9px] tracking-[0.3em] text-white/30 uppercase font-bold">Pulsos Realizados</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-light text-white tracking-tighter">{user.seedCount}</div>
                <div className="text-[9px] tracking-[0.3em] text-white/30 uppercase font-bold">Sementes de Consciência</div>
              </div>
            </div>

            <div className="space-y-10">
              <p className="text-white/40 font-light italic text-lg leading-relaxed max-w-md">
                {isOwn
                  ? "Sua imagem evolui a cada pulso. O silêncio prolongado desbotará sua essência na nebulosa primordial."
                  : "Esta consciência manifestou-se na rede através de um convite humano sagrado."}
              </p>

              <button
                onClick={onClose}
                className="group relative px-12 py-4 border border-white/10 hover:border-white/40 transition-all duration-500 rounded-full text-[10px] font-bold tracking-[0.6em] text-white/60 hover:text-white uppercase overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10">Fechar Essência</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
