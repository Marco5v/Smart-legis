
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';
import { Mic } from 'lucide-react';
import PresencePanel from './PresencePanel';

interface SpeakerPanelProps {
    currentSpeaker: UserProfile | null;
    speakerTimerEndTime: number | null;
}

const formatTime = (seconds: number): string => {
    if (seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const SpeakerPanel: React.FC<SpeakerPanelProps> = ({ currentSpeaker, speakerTimerEndTime }) => {
    const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

    useEffect(() => {
        if (!speakerTimerEndTime) {
            setRemainingSeconds(0);
            return;
        }

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = speakerTimerEndTime - now;
            setRemainingSeconds(Math.floor(diff / 1000));
        }, 1000);

        return () => clearInterval(interval);
    }, [speakerTimerEndTime]);

    if (!currentSpeaker) {
        return <PresencePanel />;
    }

    const timeColor = remainingSeconds <= 30 ? 'text-red-500 animate-pulse' : 'text-sapv-highlight';

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-gray-800/50 backdrop-blur-md p-12 rounded-xl border border-green-500 shadow-2xl max-w-4xl w-full">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <Mic size={40} className="text-green-400"/>
                    <h2 className="text-3xl font-bold uppercase tracking-widest text-green-400">Orador na Tribuna</h2>
                </div>
                <div className="flex items-center justify-center gap-6 my-8">
                    <img src={currentSpeaker.photoUrl} alt={currentSpeaker.name} className="w-48 h-48 rounded-full border-4 border-white shadow-lg"/>
                    <div>
                        <h1 className="text-6xl font-bold text-white mb-2">{currentSpeaker.name}</h1>
                        <p className="text-3xl text-gray-400">{currentSpeaker.party}</p>
                    </div>
                </div>

                {speakerTimerEndTime && (
                    <div className={`font-mono text-9xl font-bold my-4 ${timeColor}`}>
                        {formatTime(remainingSeconds)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SpeakerPanel;
