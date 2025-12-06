
import React, { useMemo } from 'react';
import { useSession } from '../../context/SessionContext';
import { motion } from 'framer-motion';
import { User, Users } from 'lucide-react';
import Clock from './Clock';
import { SessionPhase } from '../../types';

// CardVereador from old PanelPage.tsx
const CardVereador: React.FC<{vereador: any}> = ({ vereador }) => {
    let corNome = "text-white";
    if (vereador.presente) corNome = "text-green-500";
    else corNome = "text-red-600";
    
    const corBorda = vereador.presente ? "border-green-500" : "border-gray-800";
    const bgStatus = vereador.presente ? "bg-green-900/30" : "bg-transparent";
    const textoStatus = vereador.presente ? "PRESENTE" : "\u00A0";
    const corTextoStatus = "text-green-400";
    const sombra = vereador.presente ? "shadow-green-900/10 shadow-sm" : "shadow-sm";

    return (
      <motion.div layout className={`flex flex-col rounded-xl border-2 ${corBorda} bg-gray-900/80 backdrop-blur-sm transition-all duration-300 ${sombra} h-full overflow-hidden`}>
        <div className="flex-1 flex items-center px-3 gap-3 min-h-0 py-1">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 flex items-center justify-center border shadow-inner ${vereador.presente ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-800 border-gray-700 text-gray-600'}`}><User size={20} className="md:w-6 md:h-6" /></div>
          <div className="flex-1 min-w-0 h-full flex flex-col justify-center items-start text-left">
              <div className="mb-0.5 min-h-[14px] flex items-end w-full justify-start">{vereador.cargo ? (<span className="text-[9px] md:text-[10px] text-yellow-500 font-black uppercase tracking-wider leading-none">{vereador.cargo}</span>) : (<span className="text-[9px] md:text-[10px] opacity-0 select-none">.</span>)}</div>
              <div className={`text-xs md:text-sm font-bold uppercase tracking-wide leading-tight text-left break-words w-full ${corNome}`}>{vereador.nome}</div>
              <div className="mt-0.5 flex w-full justify-start"><span className={`text-[9px] md:text-[10px] font-bold inline-block px-1.5 py-px rounded border ${vereador.presente ? 'bg-gray-800 border-gray-600 text-blue-300' : 'bg-gray-900 border-gray-800 text-gray-700'}`}>{vereador.partido}</span></div>
          </div>
        </div>
        <div className={`h-6 flex items-center justify-center rounded-b-lg font-black text-xs tracking-[0.2em] ${bgStatus} ${corTextoStatus} border-t border-black/20 shrink-0`}>{textoStatus}</div>
      </motion.div>
    );
};

const ResumoPresenca: React.FC<{ vereadores: any[] }> = ({ vereadores }) => {
    const presentes = vereadores.filter(v => v.presente).length;
    const total = vereadores.length;
    const ausentes = total - presentes;
  
    return (
      <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mx-auto">
          <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 flex flex-col items-center"><span className="text-gray-500 text-[10px] uppercase font-bold">Parlamentares</span><span className="text-xl font-bold text-white">{total}</span></div>
          <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 flex flex-col items-center"><span className="text-gray-500 text-[10px] uppercase font-bold">Presentes</span><span className="text-xl font-bold text-green-400">{presentes}</span></div>
          <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 flex flex-col items-center"><span className="text-gray-500 text-[10px] uppercase font-bold">Ausentes</span><span className="text-xl font-bold text-red-400">{ausentes}</span></div>
      </div>
    );
};

const PresencePanel: React.FC = () => {
    const { session, councilMembers } = useSession();

    const mapBoardRoleToCargo = (boardRole?: string) => {
        switch (boardRole) { case 'Presidente': return 'PRESIDENTE'; case 'Vice-Presidente': return 'VICE'; case '1º Secretário': return '1º SEC'; case '2º Secretário': return '2º SEC'; default: return ''; }
    };
    
    const vereadores = useMemo(() => councilMembers.map(v => ({ id: v.uid, nome: v.name, partido: v.party, cargo: mapBoardRoleToCargo(v.boardRole), presente: !!session.presence[v.uid] })), [councilMembers, session.presence]);

    const numSessao = `SESSÃO ${session.sessionType ? session.sessionType.toUpperCase() : 'ORDINÁRIA'}`;
    const faseLabel = session.phase === SessionPhase.INICIAL ? 'VERIFICAÇÃO DE QUÓRUM' : session.phase.toUpperCase();

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans flex flex-col p-4">
            <header className="flex justify-between items-center bg-gray-800/50 backdrop-blur-md px-4 py-2 rounded-xl border-b-2 border-blue-600 mb-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-900/40 rounded-lg border border-blue-800/30"><Users size={24} className="text-white" /></div>
                    <div><h1 className="text-2xl font-bold tracking-widest text-white">CÂMARA MUNICIPAL</h1><p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mt-0.5">{session.cityName}</p></div>
                </div>
                <div className="text-right">
                    <Clock className="text-3xl font-mono font-bold text-white tracking-tighter" />
                    <p className="text-gray-400 font-medium text-[10px] mt-0.5 uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>
            
            <div className="text-center mb-4"><h2 className="text-2xl font-bold text-yellow-400 uppercase tracking-widest">{faseLabel}</h2></div>

            <main className="flex-1 min-h-0"><div className="grid grid-cols-3 lg:grid-cols-4 gap-2 h-full content-stretch">{vereadores.map(ver => <CardVereador key={ver.id} vereador={ver} />)}</div></main>

            <footer className="mt-4 flex flex-col gap-2">
                <ResumoPresenca vereadores={vereadores} />
                <div className="bg-black/50 rounded text-center py-1 border-t border-gray-800"><p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{numSessao}</p></div>
            </footer>
        </div>
    );
};

export default PresencePanel;
