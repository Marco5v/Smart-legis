import React, { useState, useEffect, useMemo } from 'react';
import { User, CheckCircle, XCircle, MinusCircle, Mic, Users, Play, RotateCcw, Settings, X, Power, FileText } from 'lucide-react';
import { useSession } from './context/SessionContext';
import { PanelView, SessionPhase, SessionStatus, UserProfile, VoteOption } from './types';

// O MOCK_DATA foi removido, os dados agora vêm do SessionContext

// Tipagem para o CardVereador para maior robustez
interface CardVereadorProps {
  vereador: {
    id: string;
    nome: string;
    partido: string;
    cargo: string;
    presente: boolean;
    voto: VoteOption | null;
  };
  fase: 'fechada' | 'chamada' | 'leitura' | 'votacao';
}

const CardVereador: React.FC<CardVereadorProps> = ({ vereador, fase }) => {
  let corBorda = "border-gray-700";
  let bgStatus = "bg-gray-800";
  let textoStatus = "\u00A0"; // Espaço em branco
  let corTextoStatus = "text-gray-500";
  let sombra = "shadow-sm";
  let iconeBg = "bg-gray-800 border-gray-700 text-gray-600";
  let borderTopStatus = "border-t border-black/20"; 
  
  let corNome = "text-white"; 

  if (vereador.presente) {
      corNome = "text-green-500"; 
  } else {
      if (fase === 'fechada') {
          corNome = "text-white"; 
      } else {
          corNome = "text-red-600"; 
      }
  }

  if (vereador.presente) {
    iconeBg = "bg-gray-700 border-gray-600 text-gray-300";
    
    if (fase === 'votacao') {
        if (vereador.voto === 'Sim') {
            corBorda = "border-green-500";
            bgStatus = "bg-green-600";
            textoStatus = "SIM";
            corTextoStatus = "text-white";
            sombra = "shadow-green-500/40 shadow-md scale-[1.02]";
        } else if (vereador.voto === 'Não') {
            corBorda = "border-red-500";
            bgStatus = "bg-red-600";
            textoStatus = "NÃO";
            corTextoStatus = "text-white";
            sombra = "shadow-red-500/40 shadow-md scale-[1.02]";
        } else if (vereador.voto === 'Abster-se') {
            corBorda = "border-yellow-500";
            bgStatus = "bg-yellow-500";
            textoStatus = "ABSTENÇÃO";
            corTextoStatus = "text-black";
            sombra = "shadow-yellow-500/40 shadow-md scale-[1.02]";
        } else {
            corBorda = "border-blue-500";
            bgStatus = "bg-gray-700";
            textoStatus = "AGUARDANDO";
            corTextoStatus = "text-blue-300";
        }
    } else if (fase === 'chamada') {
        corBorda = "border-green-500";
        bgStatus = "bg-green-900/30";
        textoStatus = "PRESENTE";
        corTextoStatus = "text-green-400";
        sombra = "shadow-green-900/10 shadow-sm";
    } else {
        corBorda = "border-gray-600";
        bgStatus = "bg-gray-800";
        textoStatus = "EM PLENÁRIO";
        corTextoStatus = "text-green-500 font-bold";
    }
  } else {
     textoStatus = "\u00A0"; 
     corBorda = "border-gray-800";
     bgStatus = "bg-transparent"; 
     borderTopStatus = "border-0"; 
  }

  return (
    <div className={`flex flex-col rounded-xl border-2 ${corBorda} bg-gray-900/80 backdrop-blur-sm transition-all duration-300 ${sombra} h-full overflow-hidden`}>
      <div className="flex-1 flex items-center px-3 gap-3 min-h-0 py-1">
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex-shrink-0 flex items-center justify-center border shadow-inner ${iconeBg}`}>
          <User size={20} className="md:w-6 md:h-6" />
        </div>
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center items-start text-left">
            <div className="mb-0.5 min-h-[14px] flex items-end w-full justify-start">
                {vereador.cargo ? (
                    <span className="text-[9px] md:text-[10px] text-yellow-500 font-black uppercase tracking-wider leading-none">
                        {vereador.cargo}
                    </span>
                ) : (
                    <span className="text-[9px] md:text-[10px] opacity-0 select-none">.</span>
                )}
            </div>
            <div className={`text-xs md:text-sm font-bold uppercase tracking-wide leading-tight text-left break-words w-full ${corNome}`}>
                {vereador.nome}
            </div>
            <div className="mt-0.5 flex w-full justify-start">
                <span className={`text-[9px] md:text-[10px] font-bold inline-block px-1.5 py-px rounded border ${vereador.presente ? 'bg-gray-800 border-gray-600 text-blue-300' : 'bg-gray-900 border-gray-800 text-gray-700'}`}>
                    {vereador.partido}
                </span>
            </div>
        </div>
      </div>
      <div className={`h-6 flex items-center justify-center rounded-b-lg font-black text-xs tracking-[0.2em] ${bgStatus} ${corTextoStatus} ${borderTopStatus} shrink-0`}>
        {textoStatus}
      </div>
    </div>
  );
};

const ResumoVotacao: React.FC<{ vereadores: CardVereadorProps['vereador'][], fase: string }> = ({ vereadores, fase }) => {
  const presentes = vereadores.filter(v => v.presente).length;
  const total = vereadores.length;
  const ausentes = total - presentes;
  
  const sim = vereadores.filter(v => v.voto === 'Sim').length;
  const nao = vereadores.filter(v => v.voto === 'Não').length;
  const abs = vereadores.filter(v => v.voto === 'Abster-se').length;

  if (fase === 'fechada') {
    return (
        <div className="grid grid-cols-3 gap-4 w-full max-w-2xl mx-auto mt-2">
            <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 flex flex-col items-center">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Parlamentares</span>
                <span className="text-xl font-bold text-white">{total}</span>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 flex flex-col items-center">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Presentes</span>
                <span className="text-xl font-bold text-green-400">{presentes}</span>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-2 border border-gray-700 flex flex-col items-center">
                <span className="text-gray-500 text-[10px] uppercase font-bold">Ausentes</span>
                <span className="text-xl font-bold text-red-400">{ausentes}</span>
            </div>
        </div>
    );
  }

  return (
    <div className="grid grid-cols-6 gap-3 bg-gray-900/90 backdrop-blur px-4 py-2 rounded-xl border-t border-gray-700 shadow-2xl w-full">
      <div className="col-span-1 flex flex-col items-center justify-center border-r border-gray-700/50 pr-2">
         <span className="text-[10px] text-gray-400 uppercase font-bold">Quórum</span>
         <span className="text-xl font-bold text-white leading-none">{presentes}/{total}</span>
      </div>
      <div className="col-span-5 grid grid-cols-3 gap-4">
        <div className="flex flex-col items-center bg-gray-800/30 rounded">
            <span className="text-green-500 text-[10px] uppercase font-bold tracking-widest">Sim</span>
            <span className="text-2xl font-bold text-green-400 leading-none">{sim}</span>
        </div>
        <div className="flex flex-col items-center bg-gray-800/30 rounded">
            <span className="text-red-500 text-[10px] uppercase font-bold tracking-widest">Não</span>
            <span className="text-2xl font-bold text-red-400 leading-none">{nao}</span>
        </div>
        <div className="flex flex-col items-center bg-gray-800/30 rounded">
            <span className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest">Abstenção</span>
            <span className="text-2xl font-bold text-yellow-400 leading-none">{abs}</span>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { session, councilMembers, setPhase, setCurrentProject, togglePresence, overrideVote, restartVoting } = useSession();

  // Mapeia o estado do contexto para o formato que a UI espera
  const fase = useMemo((): 'fechada' | 'chamada' | 'leitura' | 'votacao' => {
    if (session.status === SessionStatus.INACTIVE) return 'fechada';
    if (session.panelView === PanelView.VOTING) return 'votacao';
    if (session.panelView === PanelView.READING) return 'leitura';
    if (session.phase === SessionPhase.INICIAL) return 'chamada';
    return 'leitura'; // Fallback
  }, [session.status, session.phase, session.panelView]);

  const mapBoardRoleToCargo = (boardRole?: string) => {
    switch (boardRole) {
      case 'Presidente': return 'PRESIDENTE';
      case 'Vice-Presidente': return 'VICE';
      case '1º Secretário': return '1º SEC';
      case '2º Secretário': return '2º SEC';
      default: return '';
    }
  };

  const vereadores = useMemo(() => {
    return councilMembers.map(v => ({
      id: v.uid,
      nome: v.name,
      partido: v.party,
      cargo: mapBoardRoleToCargo(v.boardRole),
      presente: !!session.presence[v.uid],
      voto: session.votes[v.uid] || null,
    }));
  }, [councilMembers, session.presence, session.votes]);

  const materiaTitulo = session.currentProject?.title || 'PROJETO DE LEI Nº 001/2025';
  const materiaTexto = session.currentProject?.description || 'Dispõe sobre a obrigatoriedade da instalação de painéis solares em prédios públicos e dá outras providências.';

  // Estado local para UI
  const [numSessao, setNumSessao] = useState('808ª SESSÃO ORDINÁRIA DO 2º PERÍODO LEGISLATIVO DE 2025');
  const [hora, setHora] = useState(new Date());
  const [menuAberto, setMenuAberto] = useState(false);
  const [materiaTituloLocal, setMateriaTituloLocal] = useState(materiaTitulo);
  const [materiaTextoLocal, setMateriaTextoLocal] = useState(materiaTexto);

  useEffect(() => {
    const timer = setInterval(() => setHora(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sincroniza o estado local do formulário com o contexto
  useEffect(() => {
    setMateriaTituloLocal(session.currentProject?.title || 'Aguardando pauta...');
    setMateriaTextoLocal(session.currentProject?.description || '');
  }, [session.currentProject]);

  const handleUpdateMateria = () => {
    if (session.currentProject) {
      setCurrentProject({
        ...session.currentProject,
        title: materiaTituloLocal,
        description: materiaTextoLocal,
      });
    }
  };
  
  const mudarFase = (novaFase: 'leitura' | 'chamada' | 'votacao' | 'fechada') => {
    if (novaFase === 'votacao') {
        if(session.currentProject) setPhase(SessionPhase.ORDEM_DO_DIA);
    } else if (novaFase === 'chamada') {
        restartVoting();
        setPhase(SessionPhase.INICIAL);
    } else if (novaFase === 'leitura') {
        setPhase(SessionPhase.EXPEDIENTE);
    }
  };

  const getFaseLabel = () => {
    switch(fase) {
      case 'fechada': return 'SESSÃO PLENÁRIA';
      case 'chamada': return 'VERIFICAÇÃO DE QUÓRUM';
      case 'votacao': return 'VOTAÇÃO EM ANDAMENTO';
      default: return 'EXPEDIENTE / LEITURA';
    }
  };

  const getFaseColor = () => {
    switch(fase) {
      case 'fechada': return 'text-gray-400';
      case 'chamada': return 'text-yellow-400';
      case 'votacao': return 'text-red-500 animate-pulse';
      default: return 'text-blue-400';
    }
  };
  
  return (
    <div className="h-screen bg-black text-white font-sans flex overflow-hidden relative selection:bg-blue-500 selection:text-white">
      
      <div className="flex-1 flex flex-col h-full p-2 md:p-4 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative z-0">
        <button 
            onClick={() => setMenuAberto(true)}
            className="absolute top-4 right-4 z-50 p-2 text-gray-600 hover:text-white opacity-0 hover:opacity-100 transition-opacity"
        >
            <Settings size={20} />
        </button>

        <header className="flex justify-between items-center bg-gray-800/50 backdrop-blur-md px-4 py-2 rounded-xl border-b-2 border-blue-600 mb-2 shadow-lg flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-900/40 rounded-lg border border-blue-800/30">
                <Users size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-widest text-white leading-none">CÂMARA MUNICIPAL</h1>
              <p className="text-gray-400 text-[10px] uppercase tracking-[0.2em] mt-0.5">Poder Legislativo</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-3xl font-mono font-bold text-white tracking-tighter leading-none">
               {hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
             </div>
             <div className="text-gray-400 font-medium text-[10px] mt-0.5 uppercase tracking-widest">
               {hora.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </div>
          </div>
        </header>

        {fase !== 'fechada' && (
            <div className="mb-2 flex gap-2 h-24 md:h-28 flex-shrink-0 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex-1 bg-gray-800/30 backdrop-blur px-4 py-2 rounded-xl border-l-4 border-blue-500 flex flex-col justify-center shadow-lg min-h-0">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-blue-400 font-bold uppercase tracking-wider text-[10px]">Matéria em Pauta</h3>
                        <h2 className={`text-sm font-black uppercase tracking-widest ${getFaseColor()}`}>
                            {getFaseLabel()}
                        </h2>
                    </div>
                    <p className="text-lg font-bold text-white leading-tight mb-1 line-clamp-1">{materiaTitulo}</p>
                    <p className="text-gray-400 text-xs line-clamp-2 leading-snug">{materiaTexto}</p>
                </div>
                <div className={`w-28 rounded-xl flex flex-col items-center justify-center border-2 ${fase === 'votacao' ? 'border-red-600 bg-red-900/10' : 'border-gray-700 bg-gray-800/20'}`}>
                    {fase === 'votacao' ? (<><Play size={28} className="text-red-500 mb-1 animate-pulse" /><span className="text-red-500 font-black text-center text-xs animate-pulse leading-tight">VOTAÇÃO<br/>ABERTA</span></>) 
                    : fase === 'chamada' ? (<><Users size={28} className="text-yellow-500 mb-1" /><span className="text-yellow-500 font-black text-center text-xs">CHAMADA</span></>) 
                    : (<><FileText size={28} className="text-blue-500 mb-1" /><span className="text-blue-500 font-black text-center text-xs">LEITURA</span></>)}
                </div>
            </div>
        )}

        <div className="flex-1 min-h-0 overflow-hidden pb-1">
            <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 h-full content-stretch">
                {vereadores.map(ver => <CardVereador key={ver.id} vereador={ver} fase={fase} />)}
            </div>
        </div>

        <div className="flex-shrink-0 mt-auto flex flex-col gap-2">
            <ResumoVotacao vereadores={vereadores} fase={fase} />
            <div className="bg-black/50 rounded text-center py-1 border-t border-gray-800">
                <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{numSessao}</p>
            </div>
        </div>
      </div>

      <div className={`fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-700 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 flex flex-col ${menuAberto ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2"> <Settings size={20} className="text-white" /> <h2 className="font-bold text-white tracking-wide">MESA OPERADORA</h2> </div>
            <button onClick={() => setMenuAberto(false)} className="text-gray-400 hover:text-white"> <X size={24} /> </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <section>
                <h3 className="text-xs uppercase font-bold text-gray-500 mb-2">Rodapé da Sessão</h3>
                <input type="text" value={numSessao} onChange={(e) => setNumSessao(e.target.value)} className="w-full bg-black/30 border border-gray-600 rounded p-2 text-xs text-white focus:border-blue-500 outline-none" />
            </section>
            <section>
                <h3 className="text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Controle da Sessão</h3>
                <div className="grid grid-cols-2 gap-2 mb-2">
                     <button onClick={() => mudarFase('fechada')} className={`p-2 rounded text-xs font-bold flex items-center justify-center gap-2 col-span-2 ${fase === 'fechada' ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}> <Power size={14} /> MODO DE ESPERA / FECHADO </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => mudarFase('leitura')} className={`p-2 rounded text-xs font-bold flex flex-col items-center gap-1 ${fase === 'leitura' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}> <Mic size={16} /> LEITURA </button>
                    <button onClick={() => mudarFase('chamada')} className={`p-2 rounded text-xs font-bold flex flex-col items-center gap-1 ${fase === 'chamada' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}> <Users size={16} /> CHAMADA </button>
                    <button onClick={() => mudarFase('votacao')} className={`p-2 rounded text-xs font-bold flex flex-col items-center gap-1 ${fase === 'votacao' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}> <Play size={16} /> VOTAÇÃO </button>
                </div>
            </section>
            <section className={fase === 'fechada' ? 'opacity-50 pointer-events-none' : ''}>
                <h3 className="text-xs uppercase font-bold text-gray-500 mb-2 tracking-wider">Matéria em Pauta</h3>
                <div className="space-y-2">
                    <input type="text" value={materiaTituloLocal} onChange={(e) => setMateriaTituloLocal(e.target.value)} onBlur={handleUpdateMateria} className="w-full bg-black/30 border border-gray-600 rounded p-2 text-xs text-white outline-none" placeholder="Título" />
                    <textarea value={materiaTextoLocal} onChange={(e) => setMateriaTextoLocal(e.target.value)} onBlur={handleUpdateMateria} className="w-full bg-black/30 border border-gray-600 rounded p-2 text-xs text-white outline-none resize-none h-20" placeholder="Texto..." />
                </div>
            </section>
            <section>
                <div className="flex justify-between items-end mb-2">
                    <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider">Parlamentares</h3>
                    {fase === 'votacao' && (<button onClick={restartVoting} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-bold"> <RotateCcw size={12} /> Zerar </button>)}
                </div>
                <div className="space-y-1">
                    {vereadores.map(ver => (
                        <div key={ver.id} className="bg-black/30 p-2 rounded flex flex-col gap-1 border border-gray-700/50">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-300 truncate w-32">{ver.nome}</span>
                                <button onClick={() => togglePresence(ver.id)} className={`text-[10px] px-2 py-0.5 rounded font-bold ${ver.presente ? 'bg-green-900/60 text-green-400 border border-green-800' : 'bg-gray-800 text-gray-600 border border-gray-700'}`}> {ver.presente ? 'PRESENTE' : 'AUSENTE'} </button>
                            </div>
                            {ver.presente && fase === 'votacao' && (
                                <div className="grid grid-cols-3 gap-1 mt-1">
                                    <button onClick={() => overrideVote(ver.id, VoteOption.SIM, 'Mesa Operadora')} className={`p-1 rounded flex justify-center ${ver.voto === 'Sim' ? 'bg-green-600 text-white' : 'bg-gray-800 text-gray-500'}`}><CheckCircle size={14} /></button>
                                    <button onClick={() => overrideVote(ver.id, VoteOption.NAO, 'Mesa Operadora')} className={`p-1 rounded flex justify-center ${ver.voto === 'Não' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-500'}`}><XCircle size={14} /></button>
                                    <button onClick={() => overrideVote(ver.id, VoteOption.ABS, 'Mesa Operadora')} className={`p-1 rounded flex justify-center ${ver.voto === 'Abster-se' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-500'}`}><MinusCircle size={14} /></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>
        </div>
      </div>
      {menuAberto && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setMenuAberto(false)} />}
    </div>
  );
}
