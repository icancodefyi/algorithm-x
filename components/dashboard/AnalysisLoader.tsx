"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Search, Database, Shield, FileText, Fingerprint, Loader2 } from 'lucide-react';

interface AnalysisLoaderProps {
  image?: string;
  onComplete?: () => void;
}

const STEPS = [
  { id: 'evidence', label: 'Creating case evidence', icon: Database },
  { id: 'metadata', label: 'Analyzing image metadata', icon: FileText },
  { id: 'signals', label: 'Scanning manipulation signals', icon: Search },
  { id: 'structures', label: 'Comparing structures', icon: Fingerprint },
  { id: 'report', label: 'Generating forensic report', icon: Shield },
];

const DATA_DOTS = [
  { left: '18%', top: '21%' },
  { left: '24%', top: '35%' },
  { left: '29%', top: '57%' },
  { left: '35%', top: '28%' },
  { left: '39%', top: '48%' },
  { left: '42%', top: '68%' },
  { left: '48%', top: '18%' },
  { left: '52%', top: '38%' },
  { left: '57%', top: '59%' },
  { left: '61%', top: '26%' },
  { left: '66%', top: '43%' },
  { left: '71%', top: '63%' },
  { left: '76%', top: '30%' },
  { left: '81%', top: '49%' },
  { left: '84%', top: '72%' },
  { left: '22%', top: '75%' },
  { left: '31%', top: '15%' },
  { left: '47%', top: '78%' },
  { left: '63%', top: '14%' },
  { left: '74%', top: '83%' },
];

export const AnalysisLoader: React.FC<AnalysisLoaderProps> = ({ 
  image = "", 
  onComplete 
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let done = false;
    const interval = setInterval(() => {
      if (done) return;
      setProgress(prev => {
        const next = prev + 1.2;
        // Approach 92% smoothly — then trigger navigation quickly so the bar never visibly stalls at 100%
        if (next >= 92) {
          done = true;
          clearInterval(interval);
          setTimeout(() => {
            setProgress(100);
            setTimeout(() => onComplete?.(), 150);
          }, 50);
          return 92;
        }
        return next;
      });
    }, 100);

    return () => { done = true; clearInterval(interval); };
  }, [onComplete]);

  const currentStep = Math.min(Math.floor(progress / (100 / STEPS.length)), STEPS.length - 1);

  return (
    <div className="fixed inset-0 z-[100] bg-[#fafaf8] flex flex-col overflow-hidden text-[#0a0a0a]">
      {/* Grid Pattern to match minimalist aesthetic */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#e8e4de 1px, transparent 1px), linear-gradient(90deg, #e8e4de 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Header */}
      <header className="border-b border-[#e8e4de] px-8 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[13px] tracking-widest uppercase font-bold">Sniffer</span>
          <span className="text-[#d4cfc9]">/</span>
          <span className="text-[12px] text-[#9ca3af] uppercase tracking-wider">Forensic Analysis Engine</span>
        </div>
        <div className="font-mono text-[11px] text-[#9ca3af] uppercase tracking-widest">
          Node: AF-PRO-LX // {Math.round(progress)}%
        </div>
      </header>

      <main className="flex-grow relative flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          
          {/* Left: Forensic Image Viewport */}
          <div className="relative aspect-square max-w-xl mx-auto w-full group">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full h-full border border-[#e8e4de] bg-white p-2 shadow-sm"
            >
              <div className="relative w-full h-full overflow-hidden bg-[#fafaf8]">
              <div className="absolute inset-0 relative overflow-hidden bg-white/5">
                <img 
                  src={image} 
                  className="h-full w-full object-cover grayscale brightness-[1.02]" 
                  alt="Forensic Analysis" 
                />
                
                {/* Forensic Mesh Overlay (Full Width) */}
                <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ background: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                
                {/* Randomly Pulsing Data Landmarks */}
                <div className="absolute inset-0 z-20">
                  {DATA_DOTS.map((dot, i) => (
                    <motion.div
                      key={`data-dot-${i}`}
                      className="absolute w-1.5 h-1.5 bg-[#0a0a0a]/30 rounded-full"
                      style={{ 
                        left: dot.left,
                        top: dot.top,
                      }}
                      animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.4, 0.1] }}
                      transition={{ duration: 4, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>

                {/* Subtle digital flicker */}
                <motion.div 
                  animate={{ opacity: [0, 0.2, 0] }}
                  transition={{ duration: 0.1, repeat: Infinity, repeatDelay: 2 }}
                  className="absolute inset-0 bg-black/5 mix-blend-multiply"
                />
              </div>

                {/* Scan Line */}
                <motion.div 
                  animate={{ top: ['0%', '100%'] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-px bg-[#0a0a0a] z-20"
                />

                {/* Corner Accents */}
                <div className="absolute top-4 left-4 text-[9px] font-mono font-bold tracking-tighter opacity-40 uppercase">Landmark-V12</div>
                <div className="absolute bottom-4 right-4 text-[9px] font-mono font-bold tracking-tighter opacity-40 uppercase">Diff-Engine: Active</div>
              </div>
            </motion.div>
            
            {/* Viewport Label */}
            <div className="absolute -bottom-10 left-0 w-full flex justify-between font-mono text-[9px] text-[#9ca3af] uppercase tracking-widest">
              <span>Source: User_Evidence</span>
              <span>Resolution: Verified</span>
            </div>
          </div>

          {/* Right: Analysis Steps */}
          <div className="flex flex-col gap-12">
            <div className="space-y-4">
              <div className="h-0.5 w-full bg-[#e8e4de] relative">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-[#0a0a0a]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono tracking-widest text-[#9ca3af] uppercase">
                <span>Analysis in progress</span>
                <span className="text-[#0a0a0a] font-bold">{Math.round(progress)}.00%</span>
              </div>
            </div>

            <div className="space-y-8">
              {STEPS.map((step, index) => {
                const status = index < currentStep ? 'complete' : index === currentStep ? 'active' : 'pending';
                return (
                  <motion.div 
                    key={step.id} 
                    className="flex items-center gap-6"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] transition-all duration-500 ${
                      status === 'complete' ? 'bg-[#0a0a0a] border-[#0a0a0a] text-white' :
                      status === 'active' ? 'border-[#0a0a0a] text-[#0a0a0a]' :
                      'border-[#e8e4de] text-[#d4cfc9]'
                    }`}>
                      {status === 'complete' ? <Check size={12} strokeWidth={3} /> : index + 1}
                    </div>
                    <div className="space-y-1">
                      <p className={`text-[13px] font-medium tracking-tight transition-colors duration-500 ${
                        status === 'active' ? 'text-[#0a0a0a]' : status === 'complete' ? 'text-[#6b7280]' : 'text-[#d4cfc9]'
                      }`}>
                        {step.label}
                      </p>
                      {status === 'active' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                          <Loader2 size={10} className="animate-spin text-[#0a0a0a]/40" />
                          <span className="text-[10px] uppercase tracking-widest text-[#9ca3af]">Verifying patterns...</span>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="p-6 bg-white border border-[#e8e4de] shadow-sm space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9ca3af]">System Health</span>
                <span className="text-[10px] font-mono font-bold text-green-600">Secure</span>
              </div>
              <p className="text-[12px] text-[#6b7280] leading-relaxed">
                Applying forensic filters across 4,096 regions. Current variance detected at 0.002. Redirecting to final report in {Math.round((100 - progress) / 10)}s.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="p-8 flex justify-center border-t border-[#e8e4de] bg-white/50 backdrop-blur-sm">
        <div className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-[0.5em]">
          Algorithm Forge 26 // Forensic Verification Protocol
        </div>
      </footer>

      <style jsx global>{`
        @keyframes glitch-light {
          0% { transform: translate(0); opacity: 1; }
          20% { transform: translate(-3px, 1px); opacity: 0.8; }
          40% { transform: translate(3px, -1px); opacity: 0.9; }
          60% { transform: translate(-1px, 2px); opacity: 0.7; }
          80% { transform: translate(1px, -2px); opacity: 0.9; }
          100% { transform: translate(0); opacity: 1; }
        }
        .animate-glitch-light {
          animation: glitch-light 0.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
