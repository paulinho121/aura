
import React, { useState, useEffect, useRef } from 'react';
import { auraAI } from '../services/geminiService';

interface RitualProps {
  onPulseCreated: (content: string, imageUrl: string, energy: number, color: string, frequency: number, heartRate: number) => void;
  onCancel: () => void;
}

const Ritual: React.FC<RitualProps> = ({ onPulseCreated, onCancel }) => {
  const [text, setText] = useState('');
  const [poeticText, setPoeticText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Bio-Sync, 3: Breathing, 4: Transmuting
  const [breathPhase, setBreathPhase] = useState<'INSPIRE' | 'EXPIRE'>('INSPIRE');
  const [heartRate, setHeartRate] = useState(0);
  const [isBioSyncing, setIsBioSyncing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Camera Access for Bio-Sync
  useEffect(() => {
    if (step === 2) {
      startCamera();
    } else {
      stopCamera();
    }
  }, [step]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsBioSyncing(true);
        analyzeHeartRate();
      }
    } catch (err) {
      console.error("Camera access denied", err);
      // Fallback if no camera
      setHeartRate(Math.floor(Math.random() * (85 - 65) + 65));
      setTimeout(() => setStep(3), 3000);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const analyzeHeartRate = () => {
    let frames = 0;
    const interval = setInterval(() => {
      if (frames > 20) {
        clearInterval(interval);
        setStep(3);
        return;
      }
      // Simple simulation of variation detection
      setHeartRate(prev => 70 + Math.sin(frames * 0.5) * 5 + Math.random() * 2);
      frames++;
    }, 200);
  };

  // 2. Breathing Cycle
  useEffect(() => {
    if (step === 3) {
      const interval = setInterval(() => {
        setBreathPhase(prev => prev === 'INSPIRE' ? 'EXPIRE' : 'INSPIRE');
      }, 4000);

      const timer = setTimeout(() => {
        clearInterval(interval);
        handleSubmit();
      }, 12000);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [step]);

  const initiateRitual = () => {
    if (!text.trim()) return;
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsGenerating(true);
    setStep(4);

    try {
      const enhancedText = await auraAI.poetizeContent(text);
      setPoeticText(enhancedText);
      const analysis = await auraAI.analyzeIntention(enhancedText);
      const imageUrl = await auraAI.generatePulseVisual(enhancedText, analysis.mood);

      if (imageUrl) {
        setTimeout(() => {
          onPulseCreated(enhancedText, imageUrl, analysis.energy, analysis.color, analysis.frequency, Math.round(heartRate));
        }, 4000);
      }
    } catch (err) {
      console.error(err);
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#010204]/98 backdrop-blur-3xl px-4 overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute inset-0 bg-cyan-500/5 transition-opacity duration-[4000ms] ${step === 3 && breathPhase === 'INSPIRE' ? 'opacity-100' : 'opacity-0'}`} />
        <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
      </div>

      <div className="w-full max-w-4xl relative z-10">

        {/* STEP 1: MANIFESTATION INPUT */}
        {step === 1 && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="text-center space-y-6">
              <div className="text-cyan-400 text-[10px] tracking-[1em] font-black uppercase mb-4 opacity-50">Portal de Manifestação</div>
              <h1 className="font-header text-[clamp(2rem,8vw,4.5rem)] font-bold tracking-[0.8em] text-white pl-[0.8em] leading-tight drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                ORÁCULO
              </h1>
              <p className="text-white/30 font-light italic text-lg tracking-[0.3em]">
                Sua intenção molda o tecido da rede.
              </p>
            </div>

            <div className="relative group max-w-2xl mx-auto">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="relative w-full bg-transparent border-b border-white/5 p-12 text-3xl md:text-4xl font-light focus:outline-none focus:border-cyan-400/30 transition-all text-white resize-none h-64 placeholder:text-white/5 tracking-tight leading-relaxed text-center"
                placeholder="Declare sua vibração..."
              />
            </div>

            <div className="flex justify-center items-center gap-12">
              <button onClick={onCancel} className="text-white/20 hover:text-white transition-all uppercase tracking-[0.5em] text-[10px] font-bold">Retornar</button>
              <button
                disabled={!text.trim()}
                onClick={initiateRitual}
                className="group relative bg-white text-black px-20 py-6 rounded-full font-header text-[10px] font-bold tracking-[0.6em] hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all disabled:opacity-10 overflow-hidden shadow-[0_0_60px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 bg-cyan-500/30 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative">CANALIZAR</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BIO-SYNC (Sensorial) */}
        {step === 2 && (
          <div className="text-center space-y-16 animate-in fade-in zoom-in duration-1000">
            <div className="relative flex flex-col items-center">
              <div className="text-cyan-400/60 text-[10px] tracking-[1.2rem] uppercase mb-16 font-bold">Sintonização Bio-Sensorial</div>

              <div className="relative w-96 h-96">
                <div className="absolute inset-0 rounded-full border border-white/5 animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-2 rounded-full border border-cyan-500/10 animate-[spin_15s_linear_infinite_reverse]" />

                {/* Camera View Overlay */}
                <div className="absolute inset-8 rounded-full overflow-hidden bg-black/40 backdrop-blur-3xl border border-white/10 group">
                  <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover opacity-60 grayscale filter contrast-125" />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-[10px] tracking-[0.4em] text-cyan-400 font-bold mb-2">BIO-PULSO</div>
                    <div className="text-5xl font-mono text-white/80 tabular-nums font-light">
                      {Math.round(heartRate)}<span className="text-xs ml-1 opacity-40">BPM</span>
                    </div>
                  </div>
                </div>

                {/* Scanning Lines */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-cyan-400/20 blur-sm animate-[pulse_2s_infinite]" />
              </div>

              <div className="mt-16 max-w-md space-y-4">
                <p className="text-white/40 text-[10px] tracking-[0.5em] leading-relaxed uppercase">
                  Detectando assinaturas biológicas para codificação da intenção.
                </p>
                <div className="w-48 h-1 bg-white/5 mx-auto rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400/50 animate-[loading_4s_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BREATHING RITUAL */}
        {step === 3 && (
          <div className="text-center space-y-24 animate-in fade-in zoom-in duration-1000">
            <div className="relative flex flex-col items-center">
              <div className="text-cyan-400/60 text-[10px] tracking-[1.5rem] uppercase mb-12 font-bold pl-[1.5rem]">Respira Coletiva</div>

              <div className="relative w-80 h-80 flex items-center justify-center">
                <div className={`absolute inset-0 rounded-full border border-cyan-500/20 transition-all duration-[4000ms] ease-in-out ${breathPhase === 'INSPIRE' ? 'scale-150 opacity-100 shadow-[0_0_100px_rgba(34,211,238,0.1)]' : 'scale-75 opacity-20'}`} />
                <div className={`absolute inset-8 rounded-full border-[2px] border-white/10 transition-all duration-[4000ms] ease-in-out ${breathPhase === 'INSPIRE' ? 'scale-125' : 'scale-90'}`} />
                <div className="text-white text-[12px] font-bold tracking-[1rem] transition-all duration-1000 uppercase pl-[1rem]">
                  {breathPhase}
                </div>
              </div>

              <div className="mt-24 max-w-md">
                <p className="text-white/20 text-[9px] tracking-[0.4em] leading-relaxed uppercase">
                  Equalizando pulso biológico ({Math.round(heartRate)} BPM) com a malha etérea da rede.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: TRANSMUTATION */}
        {step === 4 && (
          <div className="text-center space-y-24 animate-in fade-in duration-1000">
            <div className="relative flex flex-col items-center">
              <div className="w-40 h-40 mb-16 relative">
                <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin" />
                <div className="absolute inset-4 border-b-2 border-purple-500/40 rounded-full animate-[spin_3s_linear_infinite_reverse]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_20px_white] animate-pulse" />
                </div>
              </div>

              <div className="space-y-12 max-w-2xl px-8">
                <h2 className="font-header text-3xl font-bold tracking-[1.2em] text-white uppercase ml-[1.2rem] animate-pulse">TRANSMUTANDO</h2>

                <div className="relative py-12">
                  <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] rounded-full scale-150" />
                  <p className="relative text-white/90 text-3xl md:text-4xl font-light italic leading-relaxed tracking-tight animate-[fadeInOut_4s_infinite]">
                    {poeticText || "Processando verdade..."}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <div className="h-px w-64 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <p className="text-cyan-400/40 font-mono text-[8px] tracking-[0.8em] uppercase">
                    Tecendo realidade a partir de {Math.round(heartRate)} batimentos por minuto
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes loading {
            0% { transform: scaleX(0); transform-origin: left; }
            50% { transform: scaleX(1); transform-origin: left; }
            50.1% { transform: scaleX(1); transform-origin: right; }
            100% { transform: scaleX(0); transform-origin: right; }
        }
        @keyframes fadeInOut {
            0%, 100% { opacity: 0.6; filter: blur(2px); }
            50% { opacity: 1; filter: blur(0px); }
        }
      `}</style>
    </div>
  );
};

export default Ritual;
