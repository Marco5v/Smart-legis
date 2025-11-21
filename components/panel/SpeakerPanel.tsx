import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
// FIX: Import useSession hook to access session state
import { useSession } from '../../context/SessionContext';

interface SpeakerPanelProps {
  currentSpeaker: UserProfile | null;
  speakerTimerEndTime: number | null;
}

const SpeakerPanel: React.FC<SpeakerPanelProps> = React.memo(({ currentSpeaker, speakerTimerEndTime }) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const { session } = useSession();

  useEffect(() => {
    if (!speakerTimerEndTime) {
      setRemainingTime(null);
      return;
    }

    const calculateRemaining = () => {
      const now = Date.now();
      const diff = speakerTimerEndTime - now;
      setRemainingTime(Math.max(0, Math.floor(diff / 1000)));
    };
    
    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, [speakerTimerEndTime]);

  const formatTime = (seconds: number | null): string => {
    const timeToFormat = seconds === null ? session.defaultSpeakerDuration : seconds;
    const mins = Math.floor(timeToFormat / 60).toString().padStart(2, '0');
    const secs = (timeToFormat % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (!currentSpeaker) {
    return (
        <div className="w-full h-full flex items-center justify-center text-sapv-gray-light text-5xl">
            Aguardando próximo orador...
        </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 bg-sapv-blue-dark">
      <h2 className="text-5xl font-bold text-sapv-gray-light mb-12 uppercase tracking-widest">Tribuna</h2>
      
      <div className="flex flex-col items-center justify-center text-center mb-12">
         <img 
            src={currentSpeaker.photoUrl}
            alt={currentSpeaker.name}
            className="w-48 h-48 rounded-full border-4 border-sapv-highlight mb-8 shadow-2xl highlight-pulse-animate"
          />
        <div>
            <h1 className="text-8xl font-black tracking-wide">
                {currentSpeaker.name}
            </h1>
            <p className="text-5xl text-sapv-gray-light mt-2">{currentSpeaker.party}</p>
        </div>
      </div>
      
      <div className={`font-mono text-9xl font-bold p-4 rounded-lg shadow-inner bg-sapv-blue-light border-2 border-sapv-gray-dark ${remainingTime !== null && remainingTime < 30 && remainingTime > 0 ? 'text-red-500 animate-pulse border-red-500' : 'text-sapv-highlight'}`}>
        {formatTime(remainingTime)}
      </div>
    </div>
  );
});

export default SpeakerPanel;