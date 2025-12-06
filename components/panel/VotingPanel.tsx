
import React, { useMemo } from 'react';
import { useSession } from '../../context/SessionContext';
import { motion } from 'framer-motion';
import { User, Users, Vote } from 'lucide-react';
import Clock from './Clock';
import PresencePanel from './PresencePanel';

// Vereador card specifically for voting panel
const CardVereador: React.FC<{vereador: any}> = ({ vereador }) => {
    let corBorda = "border-gray-700", bgStatus = "bg-gray-800", textoStatus = "\u00A0", corTextoStatus = "text-gray-500", sombra = "shadow-sm";
    let corNome = vereador.presente ? "text-green-500" : "text-red-600";
    
    if (vereador.presente) {
      if (vereador.voto === 'Sim') { corBorda = "border-green-500"; bgStatus = "bg-green-600"; textoStatus = "SIM"; corTextoStatus = "text-white"; sombra = "shadow-green-500/40 shadow-md scale-[1.02]"; }
      else if (vereador.voto === 'Não') { corBorda = "border-red-500"; bgStatus = "bg-red-600"; textoStatus = "NÃO"; corTextoStatus = "text-white"; sombra = "shadow-red-500/40 shadow-md scale-[1.02]"; }
      else if (vereador.voto === 'Abster-se') { corBorda = "border-yellow-500"; bgStatus = "bg-yellow-500"; textoStatus = "ABSTENÇÃO"; corTextoStatus = "text-black"; sombra = "shadow-yellow-500/40 shadow-md scale-[1.02]"; }
      else { corBorda = "border-blue-500"; bgStatus = "bg-gray-700"; textoStatus = "AGUARDANDO"; corTextoStatus = "text-blue-300"; }
    } else {
        corBorda = "border-gray-800"; bgStatus = "bg-transparent"; textoStatus = "AUSENTE"; corTextoStatus = "text-red-500";
    }
  
    return (
      <motion.div layout animate={{ scale: vereador.voto ? [1, 1.05, 1] : 1 }} transition={{ duration: 0.3 }} className={`flex flex-col rounded-xl border-2 ${corBorda} bg-gray-900/80 backdrop-blur-sm transition-all duration-300 ${sombra} h-full overflow-hidden`}>
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

const ResumoVotacao: React.FC<{ vereadores: any[] }> = ({ vereadores }) => {
    const presentes = vereadores.filter(v => v.presente).length;
    const total = vereadores.length;
    const sim = vereadores.filter(v => v.voto === 'Sim').length;
    const nao = vereadores.filter(v => v.voto === 'Não').length;
    const abs = vereadores.filter(v => v.voto === 'Abster-se').length;
  
    return (
      <div className="grid grid-cols-6 gap-3 bg-gray-900/90 backdrop-blur px-4 py-2 rounded-xl border-t border-gray-700 shadow-2xl w-full">
        <div className="col-span-1 flex flex-col items-center justify-center border-r border-gray-700/50 pr-2"><span className="text-[10px] text-gray-400 uppercase font-bold">Quórum</span><span className="text-xl font-bold text-white leading-none">{presentes}/{total}</span></div>
        <div className="col-span-5 grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center bg-gray-800/30 rounded"><span className="text-green-500 text-[10px] uppercase font-bold tracking-widest">Sim</span><span className="text-2xl font-bold text-green-400 leading-none">{sim}</span></div>
          <div className="flex flex-col items-center bg-gray-800/30 rounded"><span className="text-red-500 text-[10px] uppercase font-bold tracking-widest">Não</span><span className="text-2xl font-bold text-red-400 leading-none">{nao}</span></div>
          <div className="flex flex-col items-center bg-gray-800/30 rounded"><span className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest">Abstenção</span><span className="text-2xl font-bold text-yellow-400 leading-none">{abs}</span></div>
        </div>
      </div>
    );
};

const VotingPanel: React.FC = () => {
    const { session, councilMembers } = useSession();

    if (!session.currentProject) {
        return <PresencePanel />;
    }

    const mapBoardRoleToCargo = (boardRole?: string) => {
        switch (boardRole) { case 'Presidente': return 'PRESIDENTE'; case 'Vice-Presidente': return 'VICE'; case '1º Secretário': return '1º SEC'; case '2º Secretário': return '2º SEC'; default: return ''; }
    };

    const vereadores = useMemo(() => councilMembers.map(v => ({ 
        id: v.uid, 
        nome: v.name, 
        partido: v.party, 
        cargo: mapBoardRoleToCargo(v.boardRole), 
        presente: !!session.presence[v.uid], 
        voto: session.votes[v.uid] || null 
    })), [councilMembers, session.presence, session.votes]);
    
    const numSessao = `SESSÃO ${session.sessionType ? session.sessionType.toUpperCase() : 'ORDINÁRIA'}`;
    const faseLabel = session.votingOpen ? 'VOTAÇÃO EM ANDAMENTO' : 'RESULTADO DA VOTAÇÃO';
    const faseColor = 'text-red-500 animate-pulse';

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans flex flex-col p-4">
            <header className="flex justify-between items-center bg-gray-800/50 backdrop-blur-md px-4 py-2 rounded-xl border-b-2 border-blue-600 mb-2 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-900/40 rounded-lg border border-blue-800/30"><Users size={24} className="text-white" /></div>
                    <div><h1 className="text-2xl font-bold tracking-widest text-white">CÂMARA MUNICIPAL</h1><p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mt-0.5">{session.cityName}</p></div>
                </div>
                <div className="text-right">
                    <Clock className="text-3xl font-mono font-bold text-white tracking-tighter" />
                    <p className="text-gray-400 font-medium text-[10px] mt-0.5 uppercase tracking-widest">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>

            <div className="mb-2 flex gap-2 h-28">
                <div className="flex-1 bg-gray-800/30 backdrop-blur px-4 py-2 rounded-xl border-l-4 border-blue-500 flex flex-col justify-center shadow-lg">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-blue-400 font-bold uppercase tracking-wider text-[10px]">Matéria em Votação</h3>
                        <h2 className={`text-sm font-black uppercase tracking-widest ${faseColor}`}>{faseLabel}</h2>
                    </div>
                    <p className="text-lg font-bold text-white leading-tight mb-1 line-clamp-1">{session.currentProject.title}</p>
                    <p className="text-gray-400 text-xs line-clamp-2 leading-snug">{session.currentProject.description}</p>
                </div>
                <div className="w-28 rounded-xl flex flex-col items-center justify-center border-2 border-red-600 bg-red-900/10">
                    <Vote size={28} className="text-red-500 mb-1" />
                    <span className="text-red-500 font-black text-center text-xs leading-tight">VOTAÇÃO<br/>NOMINAL</span>
                </div>
            </div>

            {session.votingResult && (
                <div className="text-center my-2 p-4 bg-gray-800 rounded-lg border-2 border-sapv-highlight">
                    <h2 className="text-4xl font-black text-sapv-highlight uppercase tracking-widest">{session.votingResult}</h2>
                </div>
            )}

            <main className="flex-1 min-h-0 pb-1"><div className="grid grid-cols-3 lg:grid-cols-4 gap-2 h-full content-stretch">{vereadores.map(ver => <CardVereador key={ver.id} vereador={ver} />)}</div></main>
            
            <footer className="mt-auto flex flex-col gap-2">
                <ResumoVotacao vereadores={vereadores} />
                <div className="bg-black/50 rounded text-center py-1 border-t border-gray-800"><p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{numSessao}</p></div>
            </footer>
        </div>
    );
};

export default VotingPanel;
