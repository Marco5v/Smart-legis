
import React from 'react';
import Clock from './Clock';
import { Users } from 'lucide-react';
import { useSession } from '../../context/SessionContext';

const OffPanel: React.FC = () => {
    const { session } = useSession();
    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans flex flex-col items-center justify-center p-8 text-center">
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-900/40 rounded-lg border border-blue-800/30">
                    <Users size={48} className="text-white" />
                </div>
                <div>
                    <h1 className="text-5xl font-bold tracking-widest text-white">CÂMARA MUNICIPAL</h1>
                    <p className="text-gray-400 text-lg uppercase tracking-[0.2em] mt-1">{session.cityName || 'Poder Legislativo'}</p>
                </div>
            </div>
            
            <div className="my-12">
                <Clock className="text-8xl font-bold tracking-tighter" />
            </div>

            <div className="bg-black/50 rounded-lg px-8 py-4 border-t-2 border-blue-600">
                <p className="text-2xl text-gray-400 font-bold uppercase tracking-widest">SESSÃO PLENÁRIA</p>
                <p className="text-lg text-yellow-400 mt-2 animate-pulse">Aguardando Início</p>
            </div>
        </div>
    );
};

export default OffPanel;
