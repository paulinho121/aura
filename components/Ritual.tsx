
import React, { useState } from 'react';
import { auraAI } from '../services/geminiService';

interface RitualProps {
  onPulseCreated: (content: string, imageUrl: string, energy: number) => void;
  onCancel: () => void;
}

const Ritual: React.FC<RitualProps> = ({ onPulseCreated, onCancel }) => {
  const [text, setText] = useState('');
  const [poeticText, setPoeticText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Transmuting

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setStep(2);

    try {
      // Step 1: Poetize the raw thought
      const enhancedText = await auraAI.poetizeContent(text);
      setPoeticText(enhancedText);

      // Step 2: Analyze mood and energy
      const analysis = await auraAI.analyzeIntention(enhancedText);

      // Step 3: Generate the visual based on the poetic manifest
      const imageUrl = await auraAI.generatePulseVisual(enhancedText, analysis.mood);

      if (imageUrl) {
        // Automatically manifest after a short delay for dramatic effect
        setTimeout(() => {
          onPulseCreated(enhancedText, imageUrl, analysis.energy);
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setStep(1);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-[#020408]/90 backdrop-blur-3xl px-4 overflow-hidden">
      {/* Cinematic Particles Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent" />
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />
      </div>

      <div className="w-full max-w-3xl relative z-10">
        {step === 1 ? (
          <div className="space-y-16 bg-white/[0.03] border border-white/10 p-16 rounded-[3rem] backdrop-blur-3xl shadow-[0_0_100px_rgba(0,0,0,0.8)] transition-all duration-1000">
            <div className="text-center space-y-8">
              <h1 className="font-header text-[clamp(1.5rem,6vw,3.5rem)] font-bold tracking-[0.6em] text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] pl-[0.6em] leading-tight">
                MANIFESTAR
              </h1>
              <p className="text-cyan-400/60 font-light italic text-sm md:text-lg tracking-[0.2em] transform -translate-y-2">
                "Qual frequência você deseja emitir para a rede?"
              </p>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000" />
              <textarea
                autoFocus
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="relative w-full bg-transparent border-b border-white/5 p-8 text-2xl md:text-3xl font-light focus:outline-none focus:border-cyan-400/50 transition-all text-white resize-none h-64 placeholder:text-white/5 tracking-tight leading-relaxed text-center"
                placeholder="Escreva sua verdade aqui..."
              />
            </div>

            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
              <button
                onClick={onCancel}
                className="text-white/20 hover:text-white transition-all uppercase tracking-[0.4em] text-[10px] font-bold"
              >
                Retornar
              </button>

              <button
                onClick={() => setStep(1)}
                className="text-cyan-400/40 hover:text-cyan-400 transition-all uppercase tracking-[0.4em] text-[10px] font-bold border border-cyan-400/10 hover:border-cyan-400/30 px-6 py-2 rounded-full"
              >
                Ajustar
              </button>

              <button
                disabled={!text.trim()}
                onClick={handleSubmit}
                className="group relative bg-white text-black px-16 py-5 rounded-full font-header text-[10px] font-bold tracking-[0.4em] hover:bg-cyan-400 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale disabled:scale-100 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)]"
              >
                <div className="absolute inset-0 bg-cyan-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative">RESONAR</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-16">
            <div className="relative flex flex-col items-center">
              {/* Sacred Geometry Spinner */}
              <div className="relative w-48 h-48 mb-16">
                <div className="absolute inset-0 rounded-full border-[3px] border-cyan-500/10 border-t-cyan-400 animate-[spin_3s_linear_infinite]" />
                <div className="absolute inset-4 rounded-full border-[1px] border-purple-500/20 border-b-purple-400 animate-[spin_2s_linear_infinite_reverse]" />
                <div className="absolute inset-8 rounded-full border-[5px] border-white/5 border-l-white/20 animate-[spin_5s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_20px_white] animate-pulse" />
                </div>
              </div>

              <div className="space-y-8 max-w-xl">
                <h2 className="font-header text-3xl font-bold tracking-[1em] text-white animate-pulse ml-[1em]">TECE-FREQUÊNCIA</h2>

                <div className="relative">
                  <div className="absolute -inset-4 bg-cyan-500/5 blur-2xl rounded-full" />
                  <p className="relative text-white/80 text-2xl font-light italic leading-relaxed tracking-wide">
                    {poeticText || "Processando intenção..."}
                  </p>
                </div>

                <p className="text-cyan-400/40 font-mono text-[10px] tracking-[0.5em] uppercase mt-12">
                  Materializando visão no tecido da realidade...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ritual;
