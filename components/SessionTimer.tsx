import React, { useState, useEffect } from 'react';

interface SessionTimerProps {
    startTime: number | null;
    isPaused: boolean;
    pauseTime: number | null;
    totalPausedDuration: number;
}

const SessionTimer: React.FC<SessionTimerProps> = ({ startTime, isPaused, pauseTime, totalPausedDuration }) => {
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    useEffect(() => {
        if (!startTime) {
            setElapsedSeconds(0);
            return;
        }

        const interval = setInterval(() => {
            if (isPaused) {
                if(pauseTime) {
                    const elapsed = (pauseTime - startTime - totalPausedDuration) / 1000;
                    setElapsedSeconds(Math.floor(elapsed));
                }
            } else {
                const elapsed = (Date.now() - startTime - totalPausedDuration) / 1000;
                setElapsedSeconds(Math.floor(elapsed));
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, isPaused, pauseTime, totalPausedDuration]);
    
    const formatTime = (totalSeconds: number): string => {
        const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
        const seconds = (totalSeconds % 60).toString().padStart(2, '0');
        return `${hours}:${minutes}:${seconds}`;
    };

    return (
        <div className={`text-3xl md:text-5xl font-mono font-bold ${isPaused ? 'text-yellow-500' : 'text-sapv-highlight'}`}>
            {formatTime(elapsedSeconds)}
        </div>
    );
};

export default SessionTimer;
