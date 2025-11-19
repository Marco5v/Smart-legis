
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';

interface SpeakerPanelProps {
  currentSpeaker: UserProfile | null;
  speakerTimerEndTime: number | null;
}

const SpeakerPanel: React.FC<SpeakerPanelProps> = React.memo(({ currentSpeaker, speakerTimerEndTime }) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

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
    if (seconds === null) return '05:00';
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  if (!currentSpeaker) {
    return (
        <div className="w-full h-full flex items-center justify-center text-white text-4xl">
            Aguardando próximo orador...
        </div>
    )
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white p-8">
      <h2 className="text-4xl font-bold text-sapv-gray-light mb-8">TRIBUNA LIVRE</h2>
      <div className="flex items-center mb-8">
         <img 
            src={currentSpeaker.photoUrl}
            alt={currentSpeaker.name}
            className="w-36 h-36 rounded-full border-4 border-sapv-gray-light mr-8"
          />
        <div>
            <h1 className="text-6xl font-extrabold tracking-wider">
                {currentSpeaker.name}
            </h1>
            <p className="text-4xl text-sapv-gray-light">{currentSpeaker.party}</p>
        </div>
      </div>
      <div className={`font-mono text-9xl font-bold ${remainingTime !== null && remainingTime < 30 ? 'text-red-500 animate-pulse' : 'text-sapv-highlight'}`}>
        {formatTime(remainingTime)}
      </div>
    </div>
  );
});

export default SpeakerPanel;
