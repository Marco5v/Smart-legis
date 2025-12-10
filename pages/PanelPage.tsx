import React, { useState, useEffect, useMemo } from 'react';
import { User, Users, Play, FileText, Pause, Mic, Clock as ClockIcon, Info, ThumbsUp, ThumbsDown, MinusCircle } from 'lucide-react';

// --- 1. DEFINIÇÕES DE TIPOS E MOCKS (Ambiente Autônomo) ---

enum UserRole { PRESIDENTE = 'Presidente', VEREADOR = 'Vereador' }
enum VoteOption { SIM = 'Sim', NAO = 'Não', ABS = 'Abster-se' }
enum SessionPhase { INICIAL = 'Inicial', EXPEDIENTE = 'Expediente', ORDEM_DO_DIA = 'Ordem do Dia' }
enum PanelView { OFF = 'off', PRESENCE = 'presence', SPEAKER = 'speaker', VOTING = 'voting', MESSAGE = 'message', READING = 'reading' }

interface UserProfile {
  uid: string;
  name: string;
  party: string;
  role: UserRole;
  boardRole?: string;
  photoUrl?: string;
}

interface Project {
    id: string;
    title: string;
    description: string;
    matterType: string;
    author: { name: string };
    votingRules: { majority: string };
    turns?: string;
}

const DADOS_VEREADORES: UserProfile[] = [
  { uid: '1', name: 'IRMÃO BETO', party: 'PP', role: UserRole.PRESIDENTE, boardRole: 'PRESIDENTE' },
  { uid: '2', name: 'FRANCIS DE GINALDO', party: 'MDB', role: UserRole.VEREADOR, boardRole: 'VICE' },
  { uid: '3', name: 'MANOEL DO POSTO', party: 'PP', role: UserRole.VEREADOR, boardRole: '1º SEC' },
  { uid: '4', name: 'DEL DO MERCADINHO', party: 'PSDB', role: UserRole.VEREADOR, boardRole: '2º SEC' },
  { uid: '5', name: 'DANIEL MIGUEL', party: 'PSDB', role: UserRole.VEREADOR },
  { uid: '6', name: 'LÊDO', party: 'PSDB', role: UserRole.VEREADOR },
  { uid: '7', name: 'SARGENTO VAL', party: 'MDB', role: UserRole.VEREADOR },
  { uid: '8', name: 'JULIANA VIDAL', party: 'PP', role: UserRole.VEREADOR },
  { uid: '9', name: 'JOÃO OLÍMPIO', party: 'PSB', role: UserRole.VEREADOR },
  { uid: '10', name: 'JOÃO SUFOCO', party: 'UB', role: UserRole.VEREADOR },
  { uid: '11', name: 'CHICO DO POVO', party: 'MDB', role: UserRole.VEREADOR },
  { uid: '12', name: 'ADRIANO FERREIRA', party: 'PODE', role: UserRole.VEREADOR },
];

// Hook Simulado (Mock) para substituir o Contexto real neste ambiente
const useSession = () => {
  return {
    session: {
      status: 'active',
      phase: SessionPhase.ORDEM_DO_DIA,
      // Simula presença de todos
      presence: DADOS_VEREADORES.reduce((acc, v) => ({ ...acc, [v.uid]: true }), {} as Record<string, boolean>),
      // ALTERE AQUI PARA TESTAR OUTRAS TELAS: PanelView.READING, PanelView.SPEAKER, etc.
      panelView: PanelView.VOTING, 
      panelMessage: "Sessão suspensa por 5 minutos.",
      votingOpen: true,
      // Simula alguns votos
      votes: { '1': VoteOption.SIM, '2': VoteOption.SIM, '3': VoteOption.NAO, '4': VoteOption.ABS } as Record<string, VoteOption>,
      currentProject: {
        id: 'proj-1',
        title: 'PROJETO DE LEI Nº 001/2024',
        description: 'Dispõe sobre a obrigatoriedade da instalação de painéis solares em prédios públicos e dá outras providências.',
        matterType: 'PROJETO DE LEI',
        author: { name: 'JOÃO OLÍMPIO' },
        votingRules: { majority: 'Maioria Simples' },
        turns: 'Turno Único'
      } as Project,
      currentSpeaker: {
          uid: '7', name: 'SARGENTO VAL', party: 'MDB', photoUrl: '', role: UserRole.VEREADOR
      },
      speakerTimerEndTime: Date.now() + 180000, // +3 minutos
      speakerTimerPaused: false,
      legislatureMembers: DADOS_VEREADORES.map(v => v.uid),
    },
    councilMembers: DADOS_VEREADORES,
  };
};

// Componente Clock Auxiliar
const Clock = ({ className = "" }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return <span className={className}>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>;
};

// --- 2. COMPONENTES DE VISUALIZAÇÃO (SUB-PAINÉIS) ---

// Tela de Espera (Off)
const OffPanel = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 bg-gradient-to-b from-gray-900 to-black">
      <div className="mb-12 p-8 bg-blue-600/10 rounded-full border-4 border-blue-500/30 shadow-[0_0_50px_rgba(37,99,235,0.2)] animate-pulse">
          <Users size={140} className="text-blue-400" />
      </div>
      <h1 className="text-8xl font-black text-white font-sans tracking-tight mb-6 drop-shadow-2xl">SMART LEGIS</h1>
      <h2 className="text-4xl text-gray-400 mb-16 uppercase tracking-[0.2em] font-light">Sistema de Apoio Legislativo</h2>
      <div className="text-9xl font-bold font-mono text-white drop-shadow-lg tabular-nums">
        <Clock />
      </div>
    </div>
  );
};

// Tela de Mensagem (Avisos)
const MessagePanel = ({ message }: { message: string | null }) => (
  <div className="w-full h-full flex flex-col items-center justify-center text-white p-12 bg-yellow-900/95 backdrop-blur-sm">
    <div className="bg-black/30 p-12 rounded-3xl border border-yellow-500/30 shadow-2xl max-w-5xl w-full text-center">
        <Info size={80} className="mx-auto text-yellow-400 mb-6" />
        <h1 className="text-6xl font-black tracking-wider text-yellow-400 mb-10 uppercase">Comunicado</h1>
        <p className="text-5xl text-white font-bold leading-relaxed">{message || 'Aguarde um momento...'}</p>
    </div>
  </div>
);

// Tela de Leitura de Projeto (Espelhamento)
const ReadingPanel = ({ project }: { project: Project | null }) => {
  if (!project) return <div className="w-full h-full flex items-center justify-center text-white text-4xl bg-black">Aguardando matéria...</div>;
  const fullDate = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <div className="w-full h-full flex flex-col text-white p-8 bg-gradient-to-br from-gray-900 via-slate-900 to-black font-sans">
      <main className="flex-grow flex gap-10 items-stretch overflow-hidden">
        {/* Coluna Esquerda: Ementa Scrollável */}
        <div className="w-[35%] border-l-8 border-blue-500 bg-white/5 p-10 rounded-r-3xl flex flex-col shadow-2xl backdrop-blur-md">
          <h3 className="text-blue-400 font-black text-3xl mb-8 border-b border-white/10 pb-6 tracking-wide uppercase">
            {project.matterType}
          </h3>
          <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
             <p className="text-3xl leading-relaxed text-gray-200 font-medium text-justify">{project.description}</p>
          </div>
        </div>
        
        {/* Coluna Direita: Destaques */}
        <div className="w-[65%] flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Background decorativo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="text-center w-full space-y-12 relative z-10">
                <div>
                    <p className="text-2xl text-blue-300 uppercase tracking-[0.3em] font-bold mb-4">Em Discussão</p>
                    <p className="text-6xl lg:text-7xl font-black text-white leading-tight px-4 drop-shadow-2xl line-clamp-3">
                        {project.title.toUpperCase()}
                    </p>
                </div>
                
                <div className="w-32 h-1.5 bg-blue-500 mx-auto rounded-full"></div>
                
                <div>
                    <p className="text-2xl text-gray-400 uppercase tracking-[0.2em] mb-4">Autoria</p>
                    <p className="text-5xl font-bold text-yellow-400 drop-shadow-lg">
                        {project.author?.name.toUpperCase()}
                    </p>
                </div>
                
                <div className="grid grid-cols-2 gap-12 pt-10 border-t border-white/10 w-full max-w-4xl mx-auto">
                     <div className="text-center bg-black/20 py-6 rounded-2xl border border-white/5">
                        <p className="text-gray-400 uppercase text-sm font-bold mb-2">Quórum</p>
                        <p className="text-3xl text-white font-bold">{project.votingRules?.majority}</p>
                     </div>
                     <div className="text-center bg-black/20 py-6 rounded-2xl border border-white/5">
                        <p className="text-gray-400 uppercase text-sm font-bold mb-2">Regime</p>
                        <p className="text-3xl text-white font-bold">{project.turns || 'TURNO ÚNICO'}</p>
                     </div>
                </div>
            </div>
        </div>
      </main>
      <footer className="w-full text-center py-4 mt-4 text-xl text-gray-500 font-medium uppercase tracking-widest">
          {fullDate}
      </footer>
    </div>
  );
};

// Tela de Orador (Tribuna)
const SpeakerPanel = ({ currentSpeaker, speakerTimerEndTime, speakerTimerPaused }: { currentSpeaker: any, speakerTimerEndTime: number | null, speakerTimerPaused: boolean }) => {
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  
  useEffect(() => {
    if (!speakerTimerEndTime) { setRemainingTime(null); return; }
    
    const calculate = () => {
        const now = Date.now();
        const diff = speakerTimerEndTime - now;
        setRemainingTime(Math.max(0, Math.floor(diff / 1000)));
    };

    calculate(); 
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [speakerTimerEndTime, speakerTimerPaused]);

  const formatTime = (seconds: number | null): string => { 
      if (seconds === null) return '05:00'; 
      const mins = Math.floor(seconds / 60).toString().padStart(2, '0'); 
      const secs = (seconds % 60).toString().padStart(2, '0'); 
      return `${mins}:${secs}`; 
  };

  if (!currentSpeaker) return <div className="w-full h-full flex items-center justify-center text-white text-4xl bg-black">Aguardando orador...</div>;

  const isCriticalTime = remainingTime !== null && remainingTime < 30;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
      <div className="bg-blue-600 text-white px-12 py-3 rounded-full font-black tracking-[0.3em] mb-16 uppercase text-2xl shadow-[0_0_40px_rgba(37,99,235,0.4)] border border-blue-400/30">
          Tribuna Livre
      </div>
      
      <div className="flex flex-col items-center mb-16 relative z-10">
        <div className="w-80 h-80 rounded-full bg-gray-800 border-[6px] border-gray-700 mb-10 flex items-center justify-center shadow-2xl shadow-black overflow-hidden relative">
            {currentSpeaker.photoUrl ? (
                <img src={currentSpeaker.photoUrl} alt="" className="w-full h-full object-cover" />
            ) : (
                <User size={160} className="text-gray-600" />
            )}
            <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full animate-ping opacity-20"></div>
        </div>
        <h1 className="text-8xl font-black tracking-tight text-white mb-6 text-center drop-shadow-2xl">{currentSpeaker.name}</h1>
        <div className="bg-white/10 backdrop-blur-md px-10 py-4 rounded-2xl border border-white/10">
             <p className="text-5xl font-bold text-blue-400">{currentSpeaker.party}</p>
        </div>
      </div>

      <div className="relative group">
        <div className={`font-mono text-[14rem] leading-none font-bold tabular-nums tracking-tighter drop-shadow-2xl transition-all duration-500 ${isCriticalTime ? 'text-red-500 scale-110' : 'text-white'} ${speakerTimerPaused ? 'opacity-50' : 'opacity-100'}`}>
            {formatTime(remainingTime)}
        </div>
        {speakerTimerPaused && (
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-yellow-500 text-black text-2xl font-bold px-4 py-1 rounded uppercase tracking-widest">Pausado</span>
            </div>
        )}
      </div>
      
      {isCriticalTime && !speakerTimerPaused && (
          <p className="mt-8 text-red-500 font-black text-4xl animate-bounce uppercase tracking-[0.5em]">Tempo Esgotando</p>
      )}
    </div>
  );
};

// --- 3. COMPONENTES DO GRID (VISÃO PADRÃO) ---

interface CardVereadorProps {
  member: UserProfile;
  session: any;
}
// FIX: Changed component definition to use React.FC to fix typing issue with 'key' prop.
const CardVereador: React.FC<CardVereadorProps> = ({ member, session }) => {
  const isPresent = session.presence[member.uid];
  const vote = session.votes[member.uid];
  const isVoting = session.votingOpen || session.panelView === PanelView.VOTING;
  const isChamada = session.panelView === PanelView.PRESENCE;

  // --- CONFIGURAÇÃO DE ESTILOS ---
  let corBorda = "border-gray-700/50";
  let bgStatus = "bg-gray-900/90"; 
  let textoStatus = "\u00A0";
  let corTextoStatus = "text-gray-500";
  let sombra = "shadow-lg";
  let iconeBg = "bg-gray-800 border-gray-700 text-gray-500";
  let borderTopStatus = "border-t border-white/5";
  let corNome = "text-white";
  let cardBg = "bg-gradient-to-br from-gray-800/60 to-gray-900/95 backdrop-blur-xl";

  // Determinar o conteúdo da área do ícone (Avatar vs Voto)
  let IconArea = (
      <>
        {member.photoUrl && member.photoUrl.startsWith('http') ? (
            <img src={member.photoUrl} alt="" className={`w-full h-full object-cover ${!isPresent ? 'grayscale opacity-50' : ''}`} />
        ) : (
            <User size={32} strokeWidth={1.5} />
        )}
      </>
  );

  if (isPresent) {
    corNome = "text-green-400";
    iconeBg = "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 text-gray-300 shadow-inner";

    if (isVoting) {
         if (vote === VoteOption.SIM) {
            corBorda = "border-green-500"; 
            bgStatus = "bg-green-600"; 
            textoStatus = "\u00A0"; // Remove texto
            corTextoStatus = "text-white"; 
            sombra = "shadow-[0_0_25px_rgba(34,197,94,0.4)] scale-[1.02] z-10";
            
            // Ícone de Voto (Like Verde)
            iconeBg = "bg-green-600 border-green-500 text-white";
            IconArea = <ThumbsUp size={32} strokeWidth={2.5} />;

         } else if (vote === VoteOption.NAO) {
            corBorda = "border-red-500"; 
            bgStatus = "bg-red-600"; 
            textoStatus = "\u00A0"; // Remove texto
            corTextoStatus = "text-white"; 
            sombra = "shadow-[0_0_25px_rgba(239,68,68,0.4)] scale-[1.02] z-10";

            // Ícone de Voto (Dislike Vermelho)
            iconeBg = "bg-red-600 border-red-500 text-white";
            IconArea = <ThumbsDown size={32} strokeWidth={2.5} />;

         } else if (vote === VoteOption.ABS) {
            corBorda = "border-yellow-500"; 
            bgStatus = "bg-yellow-500"; 
            textoStatus = "\u00A0"; // Remove texto
            corTextoStatus = "text-black"; 
            sombra = "shadow-[0_0_25px_rgba(234,179,8,0.4)] scale-[1.02] z-10";

            // Ícone de Voto (Abstenção Amarelo)
            iconeBg = "bg-yellow-500 border-yellow-400 text-black";
            IconArea = <MinusCircle size={32} strokeWidth={2.5} />;
            
         } else {
            corBorda = "border-blue-500/50"; 
            bgStatus = "bg-gray-800"; 
            textoStatus = "AGUARDANDO"; 
            corTextoStatus = "text-blue-300 animate-pulse";
         }
    } else if (isChamada) {
         corBorda = "border-green-500/50"; 
         bgStatus = "bg-green-900/40"; 
         textoStatus = "PRESENTE"; 
         corTextoStatus = "text-green-400"; 
         sombra = "shadow-green-900/20";
    } else {
         corBorda = "border-gray-600/50"; 
         bgStatus = "bg-gray-800/80"; 
         textoStatus = "EM PLENÁRIO"; 
         corTextoStatus = "text-green-500 font-bold";
    }
  } else {
     // AUSENTE
     if (session.status === 'inactive' || session.phase === SessionPhase.INICIAL) { 
         corNome = "text-gray-500"; 
     } else { 
         corNome = "text-red-500"; 
     }
     corBorda = "border-gray-800"; 
     bgStatus = "bg-transparent"; 
     borderTopStatus = "border-0"; 
     cardBg = "bg-gray-900/20 backdrop-blur-sm opacity-60"; 
  }

  return (
    <div className={`flex flex-col rounded-2xl border-2 ${corBorda} ${cardBg} transition-all duration-500 ease-out ${sombra} h-full overflow-hidden relative group`}>
      
      {/* Área Principal */}
      <div className="flex-1 flex items-center px-5 gap-5 min-h-0 py-2 relative z-10">
        
        {/* Foto / Ícone (Vira Voto quando votado) */}
        <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center border ${iconeBg} overflow-hidden transition-colors duration-300`}>
          {IconArea}
        </div>

        {/* Bloco de Texto - Centralizado Verticalmente */}
        <div className="flex-1 min-w-0 h-full flex flex-col justify-center items-start text-left">
            
            {/* Cargo */}
            <div className="mb-0.5 min-h-[16px] flex items-end w-full justify-start">
                {member.boardRole ? (
                    <span className="text-[10px] md:text-[11px] text-yellow-400 font-black uppercase tracking-wider leading-none drop-shadow-md">
                        {member.boardRole.toUpperCase()}
                    </span>
                ) : ( 
                    <span className="text-[10px] md:text-[11px] opacity-0 select-none leading-none">.</span> 
                )}
            </div>

            {/* Nome */}
            <div className={`text-sm md:text-[1.05rem] font-bold uppercase tracking-wide leading-tight text-left break-words w-full ${corNome} drop-shadow-sm`}>
                {member.name}
            </div>

            {/* Partido */}
            <div className="mt-1 flex w-full justify-start">
                <span className={`text-[10px] font-bold inline-block px-2 py-0.5 rounded border ${isPresent ? 'bg-gray-800/80 border-gray-600 text-blue-200' : 'bg-gray-900 border-gray-800 text-gray-700'}`}>
                    {member.party}
                </span>
            </div>

        </div>
      </div>
      
      {/* Barra de Status Inferior */}
      <div className={`h-8 flex items-center justify-center rounded-b-xl font-black text-sm tracking-[0.2em] ${bgStatus} ${corTextoStatus} ${borderTopStatus} shrink-0 relative z-10`}>
        {textoStatus}
      </div>
    </div>
  );
};

const ResumoVotacao = ({ session, members }: { session: any, members: any[] }) => {
  const presentes = members.filter(m => session.presence[m.uid]).length;
  const total = members.length;
  const votes = session.votes;
  const sim = Object.values(votes).filter(v => v === VoteOption.SIM).length;
  const nao = Object.values(votes).filter(v => v === VoteOption.NAO).length;
  const abs = Object.values(votes).filter(v => v === VoteOption.ABS).length;

  if (session.phase === SessionPhase.INICIAL || session.status === 'inactive') {
      return ( 
        <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600 px-12 py-4 rounded-full flex items-center gap-6 mx-auto shadow-2xl"> 
            <span className="text-gray-400 uppercase tracking-[0.2em] text-sm font-bold">Quórum em Plenário</span> 
            <span className="text-5xl font-black text-white leading-none">{presentes}<span className="text-gray-500 text-2xl font-medium ml-1">/{total}</span></span> 
        </div> 
      );
  }

  return (
    <div className="grid grid-cols-4 gap-px bg-gray-700/40 rounded-2xl border border-gray-600 shadow-2xl w-full max-w-6xl mx-auto overflow-hidden backdrop-blur-2xl">
      <div className="flex flex-col items-center justify-center p-4 bg-gray-900/80"> 
        <span className="text-gray-400 text-xs uppercase tracking-widest font-bold mb-2">Presentes</span> 
        <span className="text-5xl font-bold text-white leading-none">{presentes}</span> 
      </div>
      <div className="flex flex-col items-center justify-center p-4 bg-gray-900/80 border-l border-gray-700"> 
        <span className="text-green-500 text-xs uppercase font-bold tracking-widest mb-2">Sim</span> 
        <span className="text-5xl font-bold text-green-400 leading-none">{sim}</span> 
      </div>
      <div className="flex flex-col items-center justify-center p-4 bg-gray-900/80 border-l border-gray-700"> 
        <span className="text-red-500 text-xs uppercase font-bold tracking-widest mb-2">Não</span> 
        <span className="text-5xl font-bold text-red-400 leading-none">{nao}</span> 
      </div>
      <div className="flex flex-col items-center justify-center p-4 bg-gray-900/80 border-l border-gray-700"> 
        <span className="text-yellow-500 text-xs uppercase font-bold tracking-widest mb-2">Abstenção</span> 
        <span className="text-5xl font-bold text-yellow-400 leading-none">{abs}</span> 
      </div>
    </div>
  );
};

// --- Página Principal do Painel ---
const PanelPage: React.FC = () => {
    // Hook simulado para demonstração. No projeto real, use: const { session, councilMembers } = useSession();
    const { session, councilMembers } = useSession();
    const [hora, setHora] = useState(new Date());
    
    useEffect(() => { 
        const t = setInterval(() => setHora(new Date()), 1000); 
        return () => clearInterval(t); 
    }, []);

    // Filtra membros da legislatura
    const activeMembers = councilMembers.filter(m => session.legislatureMembers.includes(m.uid));

    // 1. Roteamento de Telas (Espelhamento)
    if (session.panelView === PanelView.READING) return <ReadingPanel project={session.currentProject} />;
    if (session.panelView === PanelView.SPEAKER) return <SpeakerPanel currentSpeaker={session.currentSpeaker} speakerTimerEndTime={session.speakerTimerEndTime} speakerTimerPaused={session.speakerTimerPaused} />;
    if (session.panelView === PanelView.MESSAGE) return <MessagePanel message={session.panelMessage} />;
    if (session.panelView === PanelView.OFF) return <OffPanel />;

    // 2. Visão Padrão (Grid)
    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black overflow-hidden relative selection:bg-blue-500/30">
             
             {/* Cabeçalho */}
             <header className="flex justify-between items-center bg-gray-900/60 backdrop-blur-xl px-8 py-5 rounded-3xl border-b border-white/5 mb-6 shadow-2xl shrink-0 z-10">
                  <div className="flex items-center gap-6">
                    <div className="p-3.5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg shadow-blue-900/20 ring-1 ring-white/10"> 
                        <Users size={36} className="text-white" /> 
                    </div>
                    <div> 
                        <h1 className="text-3xl font-bold tracking-widest text-white drop-shadow-md">CÂMARA MUNICIPAL</h1> 
                        <p className="text-blue-300/80 text-sm font-bold uppercase tracking-[0.3em] ml-0.5">Poder Legislativo</p> 
                    </div>
                  </div>
                  <div className="text-right">
                     <div className="text-6xl font-mono font-bold text-white tracking-tighter drop-shadow-lg leading-none"> 
                        {hora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} 
                     </div>
                     <div className="text-gray-400 font-medium text-sm mt-2 uppercase tracking-widest"> 
                        {hora.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
                     </div>
                  </div>
             </header>

             {/* Área de Destaque: Matéria em Votação (Aparece se houver projeto e votação aberta) */}
             {session.currentProject && session.votingOpen && (
                <div className="mb-6 flex gap-6 h-36 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex-1 bg-gray-800/40 backdrop-blur-xl px-8 py-5 rounded-2xl border-l-8 border-blue-500 flex flex-col justify-center shadow-2xl ring-1 ring-white/5">
                        <div className="flex items-center justify-between mb-2"> 
                            <h3 className="text-blue-400 font-bold uppercase tracking-wider text-xs">Em Votação</h3> 
                        </div>
                        <p className="text-3xl font-bold text-white leading-tight mb-2 line-clamp-1 drop-shadow-md">{session.currentProject.title}</p>
                        <p className="text-gray-300 text-lg line-clamp-2 leading-relaxed max-w-5xl">{session.currentProject.description}</p>
                    </div>
                     <div className="w-56 rounded-2xl flex flex-col items-center justify-center border-2 border-red-500/30 bg-gradient-to-b from-red-900/40 to-red-950/40 backdrop-blur-xl animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                        <Play size={48} className="text-red-500 mb-2 drop-shadow-lg" /> 
                        <span className="text-red-500 font-black text-center text-xl tracking-wider drop-shadow-md">VOTAÇÃO<br/>ABERTA</span> 
                    </div>
                </div>
             )}

             {/* Grid de Vereadores */}
             <div className="flex-1 min-h-0 overflow-hidden pb-2 relative z-0">
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 h-full content-stretch">
                    {activeMembers.map(ver => ( 
                        <CardVereador key={ver.uid} member={ver} session={session} /> 
                    ))}
                </div>
             </div>

             {/* Rodapé com Totais */}
             <div className="flex-shrink-0 mt-4 mb-2">
                <ResumoVotacao session={session} members={activeMembers} />
             </div>
        </div>
    );
};

export default PanelPage;
