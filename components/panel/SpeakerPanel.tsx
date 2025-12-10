import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { User } from 'lucide-react';

interface SpeakerPanelProps {
    currentSpeaker: UserProfile | null;
    speakerTimerEndTime: number | null;
    speakerTimerPaused: boolean;
}

const SpeakerPanel: React.FC<SpeakerPanelProps> = ({ currentSpeaker, speakerTimerEndTime, speakerTimerPaused }) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  
  useEffect(() => {
    if (!speakerTimerEndTime) { setRemainingTime(null); return; }
    const calculate = () => {
        const now = Date.now();
        const diff = speakerTimerEndTime - now;
        setRemainingTime(Math.max(0, Math.floor(diff / 1000)));
    };
    calculate(); 
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [speakerTimerEndTime, speakerTimerPaused]);

  const formatTime = (seconds: number | null): string => { 
      if (seconds === null) return '05:00'; 
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0'); 
      const secs = (seconds % 60).toString().padStart(2, '0'); 
      return `${mins}:${secs}`; 
  };

  if (!currentSpeaker) return <div className="w-full h-full flex items-center justify-center text-white text-4xl bg-black">Aguardando orador...</div>;

  const isCriticalTime = remainingTime !== null && remainingTime < 30;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
      <div className="bg-blue-600 text-white px-12 py-3 rounded-full font-black tracking-[0.3em] mb-16 uppercase text-2xl shadow-[0_0_40px_rgba(37,99,235,0.4)] border border-blue-400/30">
          Tribuna Livre
      </div>
      <div className="flex flex-col items-center mb-16 relative z-10">
        <div className="w-80 h-80 rounded-full bg-gray-800 border-[6px] border-gray-700 mb-10 flex items-center justify-center shadow-2xl shadow-black overflow-hidden relative">
            {currentSpeaker.photoUrl ? (
                <img src={currentSpeaker.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
                <User size={160} className="text-gray-600" />
            )}
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping opacity-20"></div>
        </div>
        <h1 className="text-8xl font-black tracking-tight text-white mb-6 text-center drop-shadow-2xl">{currentSpeaker.name}</h1>
        <div className="bg-white/10 backdrop-blur-md px-10 py-4 rounded-2xl border border-white/10">
             <p className="text-5xl font-bold text-blue-400">{currentSpeaker.party}</p>
        </div>
      </div>
      <div className="relative group">
        <div className={`font-mono text-[14rem] leading-none font-bold tabular-nums tracking-tighter drop-shadow-2xl transition-all duration-500 ${isCriticalTime ? 'text-red-500 scale-110' : 'text-white'} ${speakerTimerPaused ? 'opacity-50' : 'opacity-100'}`}>
            {formatTime(remainingTime)}
        </div>
        {speakerTimerPaused && (
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-yellow-500 text-black text-2xl font-bold px-4 py-1 rounded uppercase tracking-widest">Pausado</span>
            </div>
        )}
      </div>
      {isCriticalTime && !speakerTimerPaused && (
          <p className="mt-8 text-red-500 font-black text-4xl animate-bounce uppercase tracking-[0.5em]">Tempo Esgotando</p>
      )}
    </div>
  );
};

export default SpeakerPanel;