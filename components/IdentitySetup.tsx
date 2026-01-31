
import React, { useState } from 'react';
import { auraAI } from '../services/geminiService';
import { UserProfile } from '../types';

interface IdentitySetupProps {
    onComplete: (user: UserProfile) => void;
    onCancel: () => void;
}

const IdentitySetup: React.FC<IdentitySetupProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1); // 1: Name, 2: Vibe, 3: Generating, 4: Reveal
    const [name, setName] = useState('');
    const [vibe, setVibe] = useState('');
    const [portraitUrl, setPortraitUrl] = useState('');

    const handleGenerate = async () => {
        setStep(3);
        const url = await auraAI.generateSymbolicPortrait(vibe);
        if (url) {
            setPortraitUrl(url);
            setStep(4);
        } else {
            setStep(2); // Retry
        }
    };

    const handleFinalize = () => {
        const newUser: UserProfile = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            vibe,
            portraitUrl,
            pulseCount: 0,
            lastPulseAt: null,
            seedCount: 1,
            communityCount: 0
        };
        onComplete(newUser);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-[#020408] flex flex-col items-center justify-center p-8 overflow-hidden font-header">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-cyan-500/5 blur-[150px] rounded-full animate-pulse" />
            </div>

            <div className="max-w-3xl w-full relative z-10">
                {step === 1 && (
                    <div className="space-y-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="space-y-4">
                            <span className="text-cyan-400/40 text-[10px] tracking-[0.8em] uppercase">Iniciando Ritual de Identidade</span>
                            <h2 className="text-5xl font-bold tracking-[0.5em] text-white">COMO DEVEMOS TE CHAMAR?</h2>
                        </div>
                        <input
                            autoFocus
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && name && setStep(2)}
                            className="w-full bg-transparent border-b border-white/10 p-4 text-4xl text-center font-light focus:outline-none focus:border-cyan-400 transition-all text-white placeholder:text-white/5 uppercase tracking-widest"
                            placeholder="SEU NOME"
                        />
                        <div className="flex flex-col items-center space-y-12">
                            {name && (
                                <button
                                    onClick={() => setStep(2)}
                                    className="px-24 py-6 bg-white text-black rounded-full text-[11px] font-bold tracking-[0.5em] hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                >
                                    PROSSEGUIR
                                </button>
                            )}
                            <button
                                onClick={onCancel}
                                className="text-white/20 hover:text-white transition-all uppercase tracking-[0.6em] text-[10px] font-bold"
                            >
                                Voltar à Intro
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        <div className="space-y-4">
                            <span className="text-cyan-400/40 text-[10px] tracking-[0.8em] uppercase">Sintonizando Essência</span>
                            <h2 className="text-5xl font-bold tracking-[0.5em] text-white">QUAL A SUA VIBRE HOJE?</h2>
                            <p className="text-white/30 text-sm font-light italic">A IA usará isso para tecer seu retrato simbólico.</p>
                        </div>
                        <textarea
                            autoFocus
                            value={vibe}
                            onChange={(e) => setVibe(e.target.value)}
                            className="w-full bg-transparent border-b border-white/10 p-8 text-2xl text-center font-light focus:outline-none focus:border-cyan-400 transition-all text-white placeholder:text-white/5 resize-none h-48 leading-relaxed"
                            placeholder="Ex: Explorador etéreo em busca de silêncio..."
                        />
                        <div className="flex justify-center space-x-8">
                            <button onClick={() => setStep(1)} className="text-white/20 hover:text-white transition-all uppercase tracking-[0.4em] text-[10px] font-bold">Voltar</button>
                            <button
                                disabled={!vibe}
                                onClick={handleGenerate}
                                className="bg-white text-black px-16 py-5 rounded-full text-[10px] font-bold tracking-[0.5em] hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                            >
                                TECER RETRATO
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center space-y-16">
                        <div className="relative flex flex-col items-center">
                            <div className="w-48 h-48 rounded-full border-2 border-cyan-500/10 border-t-cyan-400 animate-spin mb-16" />
                            <h2 className="text-3xl font-bold tracking-[0.8em] text-white animate-pulse uppercase">Codificando Alma</h2>
                            <p className="text-cyan-400/40 text-[10px] tracking-[0.5em] uppercase mt-4">Consultando os oráculos digitais...</p>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-16 text-center animate-in fade-in zoom-in duration-1000">
                        <div className="space-y-4">
                            <span className="text-cyan-400/40 text-[10px] tracking-[0.8em] uppercase">Identidade Manifestada</span>
                            <h2 className="text-6xl font-bold tracking-[0.3em] text-white uppercase">{name}</h2>
                        </div>

                        <div className="relative inline-block group">
                            <div className="absolute -inset-8 bg-cyan-500/10 blur-[80px] rounded-full animate-pulse" />
                            <div className="relative w-80 h-80 md:w-96 md:h-96 rounded-full overflow-hidden border border-white/10 shadow-2xl">
                                <img src={portraitUrl} alt="Retrato Simbólico" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/5 backdrop-blur-3xl px-8 py-4 border border-white/10 rounded-full">
                                <span className="text-[10px] font-bold tracking-[0.4em] text-cyan-400 uppercase italic whitespace-nowrap">{vibe}</span>
                            </div>
                        </div>

                        <div className="pt-12">
                            <button
                                onClick={handleFinalize}
                                className="group relative bg-white text-black px-24 py-6 rounded-full font-bold tracking-[0.6em] text-[12px] hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_50px_rgba(255,255,255,0.1)]"
                            >
                                ENTRAR NA NEBULOSA
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IdentitySetup;
