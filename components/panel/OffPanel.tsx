
import React from 'react';
import { Users } from 'lucide-react';
import Clock from './Clock';

const OffPanel: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="mb-12 p-8 bg-blue-600/10 rounded-full border-4 border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.2)] animate-pulse">
          <Users size={140} className="text-blue-400" />
      </div>
      <h1 className="text-8xl font-black text-white font-sans tracking-tight mb-6 drop-shadow-2xl">SMART LEGIS</h1>
      <h2 className="text-4xl text-gray-400 mb-16 uppercase tracking-[0.2em] font-light">Sistema de Apoio Legislativo</h2>
      <div className="text-9xl font-bold font-mono text-white drop-shadow-lg tabular-nums">
        <Clock className="tracking-tighter"/>
      </div>
    </div>
  );
};

export default OffPanel;
