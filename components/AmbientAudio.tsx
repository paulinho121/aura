
import React, { useEffect, useRef, useState } from 'react';

type NatureMode = {
    name: string;
    description: string;
    type: 'rain' | 'wind' | 'ocean' | 'birds';
    baseFreq: number;
    beatFreq: number;
    color: string;
};

const NATURE_MODES: NatureMode[] = [
    { name: 'CHUVA SAGRADA', description: 'Limpeza e introspecção sob o véu da água', type: 'rain', baseFreq: 432, beatFreq: 1.5, color: 'text-cyan-400' },
    { name: 'SOPRO DO COSMOS', description: 'Ventos etéreos entre montanhas distantes', type: 'wind', baseFreq: 432, beatFreq: 0.8, color: 'text-blue-400' },
    { name: 'OCEANO PROFUNDO', description: 'Ondas rítmicas de um mar primordial', type: 'ocean', baseFreq: 432, beatFreq: 2.3, color: 'text-emerald-400' },
    { name: 'DESPERTAR MATINAL', description: 'Cânticos da floresta ao amanhecer', type: 'birds', baseFreq: 432, beatFreq: 4.0, color: 'text-yellow-400' },
];

const AmbientAudio: React.FC = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentMode, setCurrentMode] = useState(0);
    const [showSelector, setShowSelector] = useState(false);

    const audioCtx = useRef<AudioContext | null>(null);
    const gainNode = useRef<GainNode | null>(null);
    const activeNodes = useRef<AudioNode[]>([]);
    const timerRef = useRef<number | null>(null);

    const initAudio = () => {
        if (!audioCtx.current) {
            audioCtx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            gainNode.current = audioCtx.current.createGain();
            gainNode.current.connect(audioCtx.current.destination);
            gainNode.current.gain.setValueAtTime(0, audioCtx.current.currentTime);
        }
    };

    const stopAudio = () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (gainNode.current && audioCtx.current) {
            gainNode.current.gain.linearRampToValueAtTime(0, audioCtx.current.currentTime + 2);
        }
        setTimeout(() => {
            activeNodes.current.forEach(node => {
                try { (node as any).stop?.(); node.disconnect(); } catch (e) { }
            });
            activeNodes.current = [];
        }, 2000);
    };

    const createWhiteNoise = (ctx: AudioContext) => {
        const bufferSize = 2 * ctx.sampleRate,
            buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate),
            output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = buffer;
        whiteNoise.loop = true;
        return whiteNoise;
    };

    const playNature = () => {
        if (!audioCtx.current || !gainNode.current) return;
        const mode = NATURE_MODES[currentMode];
        const ctx = audioCtx.current;
        const now = ctx.currentTime;

        // 1. Binaural Foundation (432Hz)
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        const binGain = ctx.createGain();
        binGain.gain.value = 0.04;
        oscL.frequency.value = mode.baseFreq;
        oscR.frequency.value = mode.baseFreq + mode.beatFreq;
        const pL = ctx.createPanner(); const pR = ctx.createPanner();
        pL.setPosition(-1, 0, 0); pR.setPosition(1, 0, 0);
        oscL.connect(pL); pL.connect(binGain);
        oscR.connect(pR); pR.connect(binGain);
        binGain.connect(gainNode.current);
        oscL.start(); oscR.start();
        activeNodes.current.push(oscL, oscR);

        // 2. Nature Synthesis
        if (mode.type === 'rain') {
            const noise = createWhiteNoise(ctx);
            const filter = ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 800;
            const filter2 = ctx.createBiquadFilter();
            filter2.type = 'highpass';
            filter2.frequency.value = 200;

            const rainGain = ctx.createGain();
            rainGain.gain.value = 0.3;
            noise.connect(filter); filter.connect(filter2); filter2.connect(rainGain);
            rainGain.connect(gainNode.current);
            noise.start();
            activeNodes.current.push(noise);
        } else if (mode.type === 'wind' || mode.type === 'ocean') {
            const noise = createWhiteNoise(ctx);
            const lfo = ctx.createOscillator();
            const lfoGain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            lfo.type = 'sine';
            lfo.frequency.value = mode.type === 'wind' ? 0.05 : 0.12; // Very slow cycle
            lfoGain.gain.value = 500;
            lfo.connect(lfoGain);
            lfoGain.connect(filter.frequency);

            filter.type = 'lowpass';
            filter.frequency.value = 600;
            filter.Q.value = 5;

            const windGain = ctx.createGain();
            windGain.gain.value = mode.type === 'wind' ? 0.15 : 0.4;

            noise.connect(filter); filter.connect(windGain);
            windGain.connect(gainNode.current);
            lfo.start(); noise.start();
            activeNodes.current.push(lfo, noise);
        } else if (mode.type === 'birds') {
            const scheduleBird = (time: number) => {
                const osc = ctx.createOscillator();
                const g = ctx.createGain();
                osc.type = 'sine';
                const f = 1000 + Math.random() * 2000;
                osc.frequency.setValueAtTime(f, time);
                osc.frequency.exponentialRampToValueAtTime(f + 500, time + 0.1);
                g.gain.setValueAtTime(0, time);
                g.gain.linearRampToValueAtTime(0.01, time + 0.01);
                g.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);
                osc.connect(g); g.connect(gainNode.current!);
                osc.start(time); osc.stop(time + 0.2);
            };

            timerRef.current = window.setInterval(() => {
                if (Math.random() > 0.7) scheduleBird(ctx.currentTime + Math.random());
            }, 500);
        }

        gainNode.current.gain.linearRampToValueAtTime(0.12, now + 4);
    };

    const toggleAudio = () => {
        initAudio();
        if (isPlaying) {
            stopAudio();
        } else {
            if (audioCtx.current?.state === 'suspended') audioCtx.current.resume();
            playNature();
        }
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (isPlaying) {
            stopAudio();
            setTimeout(() => playNature(), 2100);
        }
    }, [currentMode]);

    const activeMode = NATURE_MODES[currentMode];

    return (
        <div className="fixed top-8 right-8 z-[60] flex flex-col items-end space-y-4">
            <div className="flex items-center space-x-6 bg-black/40 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/5 shadow-2xl transition-all duration-1000 group">
                <div className="flex flex-col items-end mr-4">
                    <span className={`text-[8px] tracking-[0.6em] uppercase font-black mb-1 transition-colors duration-1000 ${activeMode.color}`}>
                        {activeMode.name}
                    </span>
                    <button
                        onClick={() => setShowSelector(!showSelector)}
                        className="text-[10px] text-white/30 hover:text-white tracking-[0.4em] uppercase transition-all flex items-center"
                    >
                        Trocar Santuário
                    </button>
                    <div className="text-[7px] text-white/10 uppercase tracking-widest mt-2">{activeMode.description}</div>
                </div>

                <button
                    onClick={toggleAudio}
                    className={`relative w-14 h-14 flex items-center justify-center rounded-full border transition-all duration-1000 ${isPlaying ? 'border-white/30 bg-white/5 shadow-[0_0_50px_rgba(255,255,255,0.05)]' : 'border-white/10 hover:border-white/30'}`}
                >
                    <div className={`absolute inset-0 rounded-full border border-white/10 animate-[spin_20s_linear_infinite] ${!isPlaying && 'hidden'}`} />

                    {isPlaying ? (
                        <div className="flex items-end space-x-1.5 h-4">
                            {[0, 0.4, 0.2].map((delay, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-white/30 rounded-full animate-[naturePulse_3s_ease-in-out_infinite]"
                                    style={{ animationDelay: `${delay}s` }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="w-4 h-0.5 bg-white/10 rounded-full" />
                    )}
                </button>
            </div>

            {showSelector && (
                <div className="bg-[#020408]/95 backdrop-blur-3xl border border-white/5 p-6 rounded-[2.5rem] w-80 shadow-[0_0_100px_rgba(0,0,0,0.9)] animate-in fade-in zoom-in duration-700">
                    <div className="space-y-4">
                        {NATURE_MODES.map((mode, idx) => (
                            <button
                                key={mode.name}
                                onClick={() => {
                                    setCurrentMode(idx);
                                    setShowSelector(false);
                                    if (!isPlaying) toggleAudio();
                                }}
                                className={`w-full text-left p-5 rounded-3xl border transition-all duration-500 group relative overflow-hidden ${currentMode === idx ? 'bg-white/5 border-white/10' : 'border-transparent hover:bg-white/[0.03]'}`}
                            >
                                <div className={`text-[10px] font-bold tracking-[0.5em] uppercase mb-2 ${mode.color}`}>
                                    {mode.name}
                                </div>
                                <div className="text-[11px] text-white/20 font-light leading-relaxed group-hover:text-white/50 transition-colors">
                                    {mode.description}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes naturePulse {
                    0%, 100% { height: 4px; opacity: 0.1; }
                    50% { height: 12px; opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default AmbientAudio;
