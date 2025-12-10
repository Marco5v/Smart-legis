import React, { useState, useEffect } from 'react';
import { User, Users, Play, FileText, ThumbsUp, ThumbsDown, MinusCircle, Maximize, Minimize } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { PanelView, VoteOption, UserProfile, Project } from '../types';
import SpeakerPanel from '../components/panel/SpeakerPanel';
import MessagePanel from '../components/panel/MessagePanel';

// --- COMPONENTES INTERNOS DO PAINEL ---

const Clock = ({ className = "" }) => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return <span className={className}>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>;
};

// Card do Vereador (Novo Design Limpo)
const CardVereador = ({ member, session }: { member: UserProfile, session: any }) => {
  const isPresent = session.presence[member.uid];
  const vote = session.votes[member.uid];
  const isVoting = session.votingOpen || session.panelView === PanelView.VOTING;
  
  // Estilos Base
  let corBorda = "border-white/10";
  let sombra = "shadow-lg";
  let iconeBg = "bg-gray-800 border-gray-700 text-gray-500";
  let corNome = "text-white";
  let cardBg = "bg-gradient-to-br from-gray-800/80 to-gray-900/90 backdrop-blur-xl";

  // Lógica de Exibição
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
         if (vote) {
             // VOTO REGISTRADO (Substitui o ícone)
             if (vote === VoteOption.SIM) {
                corBorda = "border-green-500"; 
                sombra = "shadow-[0_0_20px_rgba(34,197,94,0.3)] scale-[1.02] z-10";
                iconeBg = "bg-green-600 border-green-500 text-white";
                IconArea = <ThumbsUp size={36} strokeWidth={3} fill="currentColor" />;
             } else if (vote === VoteOption.NAO) {
                corBorda = "border-red-500"; 
                sombra = "shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-[1.02] z-10";
                iconeBg = "bg-red-600 border-red-500 text-white";
                IconArea = <ThumbsDown size={36} strokeWidth={3} fill="currentColor" />;
             } else if (vote === VoteOption.ABS) {
                corBorda = "border-yellow-500"; 
                sombra = "shadow-[0_0_20px_rgba(234,179,8,0.3)] scale-[1.02] z-10";
                iconeBg = "bg-yellow-500 border-yellow-400 text-black";
                IconArea = <MinusCircle size={36} strokeWidth={3} />;
             }
         } else {
             // AGUARDANDO VOTO (Pisca)
             corBorda = "border-blue-500/50";
             iconeBg += " animate-pulse ring-2 ring-blue-500/30";
         }
    }
  } else {
     // AUSENTE
     corNome = "text-red-500/70";
     corBorda = "border-white/5"; 
     cardBg = "bg-gray-900/30 backdrop-blur-sm opacity-50";
     IconArea = <User size={32} strokeWidth={1.5} className="opacity-30"/>;
  }

  return (
    <div className={`flex items-center rounded-2xl border-2 ${corBorda} ${cardBg} transition-all duration-300 ease-out ${sombra} h-24 overflow-hidden relative group px-4 gap-4`}>
      
      {/* 1. Ícone / Voto (Esquerda) */}
      <div className={`w-16 h-16 rounded-2xl flex-shrink-0 flex items-center justify-center border-2 ${iconeBg} overflow-hidden transition-all duration-300 transform`}>
        {IconArea}
      </div>

      {/* 2. Informações (Direita) */}
      <div className="flex-1 min-w-0 flex flex-col justify-center items-start text-left h-full py-2">
          
          {/* Cargo (Topo) */}
          <div className="h-4 flex items-center w-full">
              {member.boardRole ? (
                  <span className="text-[10px] text-yellow-400 font-black uppercase tracking-wider leading-none">
                      {member.boardRole}
                  </span>
              ) : null}
          </div>

          {/* Nome (Meio - Grande) */}
          <div className={`text-lg font-bold uppercase tracking-wide leading-tight text-left truncate w-full ${corNome} drop-shadow-md`}>
              {member.name}
          </div>

          {/* Partido (Baixo) */}
          <div className="h-5 flex items-center mt-1">
              <span className={`text-[10px] font-bold inline-block px-2 py-0.5 rounded border ${isPresent ? 'bg-gray-800/80 border-gray-600 text-blue-200' : 'bg-gray-900 border-gray-800 text-gray-600'}`}>
                  {member.party}
              </span>
          </div>

      </div>
    </div>
  );
};

// Resumo do Rodapé
const ResumoVotacao = ({ session, members }: { session: any, members: any[] }) => {
  const presentes = members.filter(m => session.presence[m.uid]).length;
  const total = members.length;
  const votes = session.votes;
  const sim = Object.values(votes).filter(v => v === VoteOption.SIM).length;
  const nao = Object.values(votes).filter(v => v === VoteOption.NAO).length;
  const abs = Object.values(votes).filter(v => v === VoteOption.ABS).length;

  // Se não estiver em votação, mostra apenas o quórum
  if (!session.votingOpen && session.panelView !== PanelView.VOTING) {
      return ( 
        <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600 px-12 py-3 rounded-full flex items-center gap-6 mx-auto shadow-2xl"> 
            <span className="text-gray-400 uppercase tracking-[0.2em] text-sm font-bold">Quórum em Plenário</span> 
            <span className="text-4xl font-black text-white leading-none">{presentes}<span className="text-gray-500 text-xl font-medium ml-1">/{total}</span></span> 
        </div> 
      );
  }

  // Durante a votação ou exibição de resultado
  return (
    <div className="grid grid-cols-4 gap-px bg-gray-700/40 rounded-2xl border border-gray-600 shadow-2xl w-full max-w-5xl mx-auto overflow-hidden backdrop-blur-2xl">
      <div className="flex flex-col items-center justify-center p-3 bg-gray-900/80"> 
        <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1">Presentes</span> 
        <span className="text-3xl font-bold text-white leading-none">{presentes}</span> 
      </div>
      <div className="flex flex-col items-center justify-center p-3 bg-gray-900/80 border-l border-gray-700"> 
        <span className="text-green-500 text-[10px] uppercase font-bold tracking-widest mb-1">Sim</span> 
        <span className="text-3xl font-bold text-green-400 leading-none">{sim}</span> 
      </div>
      <div className="flex flex-col items-center justify-center p-3 bg-gray-900/80 border-l border-gray-700"> 
        <span className="text-red-500 text-[10px] uppercase font-bold tracking-widest mb-1">Não</span> 
        <span className="text-3xl font-bold text-red-400 leading-none">{nao}</span> 
      </div>
      <div className="flex flex-col items-center justify-center p-3 bg-gray-900/80 border-l border-gray-700"> 
        <span className="text-yellow-500 text-[10px] uppercase font-bold tracking-widest mb-1">Abstenção</span> 
        <span className="text-3xl font-bold text-yellow-400 leading-none">{abs}</span> 
      </div>
    </div>
  );
};

// Componente de Leitura (Substitui o Grid)
const ProjectDisplay = ({ project }: { project: Project }) => (
    <div className="flex-1 flex flex-col justify-center items-center bg-gray-900/40 backdrop-blur-md rounded-3xl border border-white/10 p-12 shadow-2xl m-4 relative overflow-hidden animate-in fade-in zoom-in duration-500">
         <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>

         <div className="z-10 w-full max-w-5xl text-center space-y-10">
            <div className="inline-block px-6 py-2 bg-blue-500/20 rounded-full border border-blue-500/30 text-blue-300 font-bold tracking-widest uppercase mb-4">
                Em Discussão
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-white leading-tight drop-shadow-xl uppercase">
                {project.title}
            </h1>
            <p className="text-3xl text-gray-300 leading-relaxed font-light max-w-4xl mx-auto border-l-4 border-yellow-500 pl-8 text-left">
                {project.description}
            </p>
            <div className="pt-8 flex justify-center gap-16 border-t border-white/10 mt-8">
                <div>
                    <p className="text-gray-500 uppercase text-sm font-bold mb-2">Autoria</p>
                    <p className="text-2xl text-yellow-400 font-bold">{project.author.name}</p>
                </div>
                <div>
                    <p className="text-gray-500 uppercase text-sm font-bold mb-2">Regime</p>
                    <p className="text-2xl text-white font-bold">{project.turns || 'Turno Único'}</p>
                </div>
                <div>
                    <p className="text-gray-500 uppercase text-sm font-bold mb-2">Quórum</p>
                    <p className="text-2xl text-white font-bold">{project.votingRules.majority}</p>
                </div>
            </div>
         </div>
    </div>
);

// --- PÁGINA PRINCIPAL ---

const PanelPage: React.FC = () => {
    const { session, councilMembers } = useSession();
    const [hora, setHora] = useState(new Date());
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    useEffect(() => { const t = setInterval(() => setHora(new Date()), 1000); return () => clearInterval(t); }, []);
    useEffect(() => {
        const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleChange);
        return () => document.removeEventListener('fullscreenchange', handleChange);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(console.log);
        else if (document.exitFullscreen) document.exitFullscreen();
    };

    // Conteúdo Central Dinâmico
    let MainContent;
    if (session.panelView === PanelView.READING && session.currentProject) {
        MainContent = <ProjectDisplay project={session.currentProject} />;
    } else if (session.panelView === PanelView.SPEAKER) {
        MainContent = (
            <div className="flex-1 flex items-center justify-center p-8">
                <SpeakerPanel 
                    currentSpeaker={session.currentSpeaker} 
                    speakerTimerEndTime={session.speakerTimerEndTime} 
                    speakerTimerPaused={session.speakerTimerPaused} 
                />
            </div>
        );
    } else if (session.panelView === PanelView.MESSAGE) {
        MainContent = (
            <div className="flex-1 flex items-center justify-center">
                 <MessagePanel message={session.panelMessage} />
            </div>
        );
    } else if (session.panelView === PanelView.OFF) {
        MainContent = <div className="flex-1 flex items-center justify-center text-5xl text-gray-600 font-thin tracking-widest uppercase">Sessão em Espera</div>;
    } else {
        // Grid de Votação/Presença (Padrão para PRESENCE e VOTING)
        MainContent = (
            <div className="flex-1 min-h-0 overflow-hidden pb-4 relative z-0 flex flex-col">
                 <div className="grid grid-cols-3 lg:grid-cols-4 gap-6 h-full content-start p-6 overflow-y-auto">
                    {councilMembers.map(ver => ( 
                        <CardVereador key={ver.uid} member={ver} session={session} /> 
                    ))}
                 </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black overflow-hidden relative selection:bg-blue-500/30">
             
             {/* Cabeçalho Fixo */}
             <header className="flex justify-between items-center bg-gray-900/60 backdrop-blur-xl px-10 py-5 rounded-3xl border-b border-white/5 mb-4 shadow-2xl shrink-0 z-10">
                  <div className="flex items-center gap-6">
                    <div className="p-3.5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg shadow-blue-900/20 ring-1 ring-white/10"> 
                        <Users size={40} className="text-white" /> 
                    </div>
                    <div> 
                        <h1 className="text-3xl font-bold tracking-widest text-white drop-shadow-md">CÂMARA MUNICIPAL</h1> 
                        <p className="text-blue-300/80 text-sm font-bold uppercase tracking-[0.3em] ml-0.5">{session.cityName || 'Poder Legislativo'}</p> 
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

             {/* Área de Notificação (Se houver votação e NÃO estivermos lendo projeto) */}
             {session.votingOpen && session.panelView !== PanelView.READING && (
                <div className="mb-4 bg-red-900/20 border border-red-500/30 rounded-2xl p-4 flex items-center justify-center gap-4 animate-pulse shrink-0">
                    <Play size={32} className="text-red-500" />
                    <span className="text-2xl font-bold text-red-500 tracking-widest uppercase">Votação Aberta: {session.currentProject?.title}</span>
                </div>
             )}

             {/* Conteúdo Principal (Grid ou Leitura) */}
             {MainContent}

             {/* Rodapé com Totais (Apenas se não estiver em leitura tela cheia ou message) */}
             {session.panelView !== PanelView.READING && session.panelView !== PanelView.MESSAGE && session.panelView !== PanelView.SPEAKER && (
                 <div className="flex-shrink-0 mt-2">
                    <ResumoVotacao session={session} members={councilMembers} />
                 </div>
             )}

            {/* Botão de Tela Cheia Global */}
            <button 
                onClick={toggleFullScreen} 
                className="fixed bottom-6 right-6 p-3 bg-gray-800/30 hover:bg-blue-600 text-white/30 hover:text-white rounded-full backdrop-blur-sm transition-all duration-300 z-[100] border border-white/5 hover:border-white/20 opacity-0 hover:opacity-100"
                title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
            >
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
            </button>
        </div>
    );
};

export default PanelPage;