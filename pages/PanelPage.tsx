import React, { useState, useEffect, useMemo } from 'react';
import { User, Users, Play, FileText } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { PanelView, SessionPhase, SessionStatus, VoteOption } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const CardVereador: React.FC<{vereador: any, fase: 'fechada' | 'chamada' | 'leitura' | 'votacao'}> = ({ vereador, fase }) => {
  let corBorda = "border-gray-700", bgStatus = "bg-gray-800", textoStatus = "\u00A0", corTextoStatus = "text-gray-500", sombra = "shadow-sm", iconeBg = "bg-gray-800 border-gray-700 text-gray-600", borderTopStatus = "border-t border-black/20", corNome = "text-white";
  if (vereador.presente) corNome = "text-green-500"; 
  else if (fase !== 'fechada') corNome = "text-red-600";
  
  if (vereador.presente) {
    iconeBg = "bg-gray-700 border-gray-600 text-gray-300";
    if (fase === 'votacao') {
        if (vereador.voto === 'Sim') { corBorda = "border-green-500"; bgStatus = "bg-green-600"; textoStatus = "SIM"; corTextoStatus = "text-white"; sombra = "shadow-green-500/40 shadow-md scale-[1.02]"; }
        else if (vereador.voto === 'Não') { corBorda = "border-red-500"; bgStatus = "bg-red-600"; textoStatus = "NÃO"; corTextoStatus = "text-white"; sombra = "shadow-red-500/40 shadow-md scale-[1.02]"; }
        else if (vereador.voto === 'Abster-se') { corBorda = "border-yellow-500"; bgStatus = "bg-yellow-500"; textoStatus = "ABSTENÇÃO"; corTextoStatus = "text-black"; sombra = "shadow-yellow-500/40 shadow-md scale-[1.02]"; }
        else { corBorda = "border-blue-500"; bgStatus = "bg-gray-700"; textoStatus = "AGUARDANDO"; corTextoStatus = "text-blue-300"; }
    } else if (fase === 'chamada') { corBorda = "border-green-500"; bgStatus = "bg-green-900/30"; textoStatus = "PRESENTE"; corTextoStatus = "text-green-400"; sombra = "shadow-green-900/10 shadow-sm"; }
    else { corBorda = "border-gray-600"; bgStatus = "bg-gray-800"; textoStatus = "EM PLENÁRIO"; corTextoStatus = "text-green-500 font-bold"; }
  } else { corBorda = "border-gray-800"; bgStatus = "bg-transparent"; borderTopStatus = "border-0"; }

  return (
    <motion.div layout animate={{ scale: vereador.voto ? [1, 1.05, 1] : 1 }} transition={{ duration: 0.3 }} className={`flex flex-col rounded-xl border-2 ${corBorda} bg-gray-900/80 backdrop-blur-sm transition-all duration-300 ${sombra} h-full overflow-hidden`}>
      <div className="flex-1 flex items-center px-3 gap-3 min-h-0 py-1">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 flex items-center justify-center border shadow-inner ${iconeBg}`}><User size={20} className="md:w-6 md:h-6" /></div>
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center items-start text-left">
            <div className="mb-0.5 min-h-[14px] flex items-end w-full justify-start">{vereador.cargo ? (<span className="text-[9px] md:text-[10px] text-yellow-500 font-black uppercase tracking-wider leading-none">{vereador.cargo}</span>) : (<span className="text-[9px] md:text-[10px] opacity-0 select-none">.</span>)}</div>
            <div className={`text-xs md:text-sm font-bold uppercase tracking-wide leading-tight text-left break-words w-full ${corNome}`}>{vereador.nome}</div>
            <div className="mt-0.5 flex w-full justify-start"><span className={`text-[9px] md:text-[10px] font-bold inline-block px-1.5 py-px rounded border ${vereador.presente ? 'bg-gray-800 border-gray-600 text-blue-300' : 'bg-gray-900 border-gray-800 text-gray-700'}`}>{vereador.partido}</span></div>
        </div>
      </div>
      <div className={`h-6 flex items-center justify-center rounded-b-lg font-black text-xs tracking-[0.2em] ${bgStatus} ${corTextoStatus} ${borderTopStatus} shrink-0`}>{textoStatus}</div>
    </motion.div>
  );
};

const ResumoVotacao: React.FC<{ vereadores: any[], fase: string }> = ({ vereadores, fase }) => {
  const presentes = vereadores.filter(v => v.presente).length, total = vereadores.length, ausentes = total - presentes;
  const sim = vereadores.filter(v => v.voto === 'Sim').length, nao = vereadores.filter(v => v.voto === 'Não').length, abs = vereadores.filter(v => v.voto === 'Abster-se').length;

  if (fase === 'fechada') return (
    <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mx-auto mt-2">
        <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 flex flex-col items-center"><span className="text-gray-500 text-[10px] uppercase font-bold">Parlamentares</span><span className="text-xl font-bold text-white">{total}</span></div>
        <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 flex flex-col items-center"><span className="text-gray-500 text-[10px] uppercase font-bold">Presentes</span><span className="text-xl font-bold text-green-400">{presentes}</span></div>
        <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 flex flex-col items-center"><span className="text-gray-500 text-[10px] uppercase font-bold">Ausentes</span><span className="text-xl font-bold text-red-400">{ausentes}</span></div>
    </div>
  );

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

const PanelPage: React.FC = () => {
  const { session, councilMembers } = useSession();
  
  const fase = useMemo((): 'fechada' | 'chamada' | 'leitura' | 'votacao' => {
    if (session.status === SessionStatus.INACTIVE) return 'fechada';
    if (session.panelView === PanelView.VOTING) return 'votacao';
    if (session.panelView === PanelView.READING) return 'leitura';
    if (session.phase === SessionPhase.INICIAL) return 'chamada';
    return 'leitura';
  }, [session.status, session.phase, session.panelView]);

  const mapBoardRoleToCargo = (boardRole?: string) => {
    switch (boardRole) { case 'Presidente': return 'PRESIDENTE'; case 'Vice-Presidente': return 'VICE'; case '1º Secretário': return '1º SEC'; case '2º Secretário': return '2º SEC'; default: return ''; }
  };

  const vereadores = useMemo(() => councilMembers.map(v => ({ id: v.uid, nome: v.name, partido: v.party, cargo: mapBoardRoleToCargo(v.boardRole), presente: !!session.presence[v.uid], voto: session.votes[v.uid] || null })), [councilMembers, session.presence, session.votes]);
  
  const [hora, setHora] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setHora(new Date()), 1000); return () => clearInterval(timer); }, []);

  const numSessao = `808ª SESSÃO ${session.sessionType ? session.sessionType.toUpperCase() : 'ORDINÁRIA'} DO 2º PERÍODO LEGISLATIVO DE 2025`;

  const getFaseLabel = () => { switch(fase) { case 'fechada': return 'SESSÃO PLENÁRIA'; case 'chamada': return 'VERIFICAÇÃO DE QUÓRUM'; case 'votacao': return 'VOTAÇÃO EM ANDAMENTO'; default: return 'EXPEDIENTE / LEITURA'; } };
  const getFaseColor = () => { switch(fase) { case 'fechada': return 'text-gray-400'; case 'chamada': return 'text-yellow-400'; case 'votacao': return 'text-red-500 animate-pulse'; default: return 'text-blue-400'; } };
  
  return (
    <div className="h-screen bg-black text-white font-sans flex overflow-hidden relative selection:bg-blue-500 selection:text-white">
      <div className="flex-1 flex flex-col h-full p-2 md:p-4 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative z-0">
        <header className="flex justify-between items-center bg-gray-800/50 backdrop-blur-md px-4 py-2 rounded-xl border-b-2 border-blue-600 mb-2 shadow-lg flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/40 rounded-lg border border-blue-800/30"><Users size={24} className="text-white" /></div>
            <div><h1 className="text-xl md:text-2xl font-bold tracking-widest text-white leading-none">CÂMARA MUNICIPAL</h1><p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mt-0.5">Poder Legislativo</p></div>
          </div>
          <div className="text-right">
             <div className="text-3xl font-mono font-bold text-white tracking-tighter leading-none">{hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
             <div className="text-gray-400 font-medium text-[10px] mt-0.5 uppercase tracking-widest">{hora.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </header>
        <AnimatePresence>
        {fase !== 'fechada' && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-2 flex gap-2 h-24 md:h-28 flex-shrink-0">
                <div className="flex-1 bg-gray-800/30 backdrop-blur px-4 py-2 rounded-xl border-l-4 border-blue-500 flex flex-col justify-center shadow-lg min-h-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-blue-400 font-bold uppercase tracking-wider text-[10px]">Matéria em Pauta</h3>
                        <h2 className={`text-sm font-black uppercase tracking-widest ${getFaseColor()}`}>{getFaseLabel()}</h2>
                    </div>
                    <p className="text-lg font-bold text-white leading-tight mb-1 line-clamp-1">{session.currentProject?.title || 'Aguardando Pauta'}</p>
                    <p className="text-gray-400 text-xs line-clamp-2 leading-snug">{session.currentProject?.description || ''}</p>
                </div>
                <div className={`w-28 rounded-xl flex flex-col items-center justify-center border-2 ${fase === 'votacao' ? 'border-red-600 bg-red-900/10' : 'border-gray-700 bg-gray-800/20'}`}>
                    {fase === 'votacao' ? (<><Play size={28} className="text-red-500 mb-1 animate-pulse" /><span className="text-red-500 font-black text-center text-xs animate-pulse leading-tight">VOTAÇÃO<br/>ABERTA</span></>) 
                    : fase === 'chamada' ? (<><Users size={28} className="text-yellow-500 mb-1" /><span className="text-yellow-500 font-black text-center text-xs">CHAMADA</span></>) 
                    : (<><FileText size={28} className="text-blue-500 mb-1" /><span className="text-blue-500 font-black text-center text-xs">LEITURA</span></>)}
                </div>
            </motion.div>
        )}
        </AnimatePresence>
        <div className="flex-1 min-h-0 overflow-hidden pb-1"><div className="grid grid-cols-3 lg:grid-cols-4 gap-2 h-full content-stretch">{vereadores.map(ver => <CardVereador key={ver.id} vereador={ver} fase={fase} />)}</div></div>
        <div className="flex-shrink-0 mt-auto flex flex-col gap-2">
            <ResumoVotacao vereadores={vereadores} fase={fase} />
            <div className="bg-black/50 rounded text-center py-1 border-t border-gray-800"><p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{numSessao}</p></div>
        </div>
      </div>
    </div>
  );
}

export default PanelPage;
