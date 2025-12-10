
import React, { useState, useEffect } from 'react';

interface ClockProps {
    className?: string;
}

const Clock: React.FC<ClockProps> = ({ className = '' }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className={`font-mono text-center ${className}`}>
      {time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
    </div>
  );
};

export default Clock;
