import React from 'react';
import { useSession } from '../../context/SessionContext';
import { UserProfile, VoteOption, PanelView } from '../../types';
import { User, Users, Play, ThumbsUp, ThumbsDown, MinusCircle } from 'lucide-react';
import Clock from './Clock';

const CardVereador: React.FC<{ member: UserProfile, session: any }> = ({ member, session }) => {
  const isPresent = session.presence[member.uid];
  const vote = session.votes[member.uid];
  const isVoting = session.votingOpen || session.panelView === PanelView.VOTING;
  
  let corBorda = "border-gray-700/50";
  let sombra = "shadow-lg";
  let iconeBg = "bg-gray-800 border-gray-700 text-gray-500";
  let corNome = "text-white";
  let cardBg = "bg-gradient-to-br from-gray-800/60 to-gray-900/95 backdrop-blur-xl";
  let IconArea;

  if (isPresent) {
    corNome = "text-green-400";
    iconeBg = "bg-gradient-to-br from-gray-700 to-gray-800 border-gray-600 text-gray-300 shadow-inner";

    if (isVoting && vote) {
         if (vote === VoteOption.SIM) {
            corBorda = "border-green-500"; 
            sombra = "shadow-[0_0_30px_rgba(34,197,94,0.5)] scale-105 z-10 ring-2 ring-green-400 ring-offset-2 ring-offset-black";
            iconeBg = "bg-green-600 border-green-500 text-white";
            IconArea = <ThumbsUp size={36} strokeWidth={3} fill="currentColor" />;
         } else if (vote === VoteOption.NAO) {
            corBorda = "border-red-500"; 
            sombra = "shadow-[0_0_30px_rgba(239,68,68,0.5)] scale-105 z-10 ring-2 ring-red-400 ring-offset-2 ring-offset-black";
            iconeBg = "bg-red-600 border-red-500 text-white";
            IconArea = <ThumbsDown size={36} strokeWidth={3} fill="currentColor" />;
         } else if (vote === VoteOption.ABS) {
            corBorda = "border-yellow-500"; 
            sombra = "shadow-[0_0_30px_rgba(234,179,8,0.5)] scale-105 z-10 ring-2 ring-yellow-400 ring-offset-2 ring-offset-black";
            iconeBg = "bg-yellow-500 border-yellow-400 text-black";
            IconArea = <MinusCircle size={36} strokeWidth={3} />;
         }
    } else {
         if (isVoting) {
             corBorda = "border-blue-500/50";
             iconeBg += " animate-pulse ring-2 ring-blue-500/30";
         } else {
             corBorda = "border-gray-600/50"; 
         }
         IconArea = member.photoUrl && member.photoUrl.startsWith('http') ? (
            <img src={member.photoUrl} alt={member.name} className="w-full h-full object-cover" />
         ) : (
            <User size={32} strokeWidth={1.5} />
         );
    }
  } else {
     corNome = "text-red-500";
     corBorda = "border-gray-800"; 
     cardBg = "bg-gray-900/20 backdrop-blur-sm opacity-60";
     IconArea = <User size={32} strokeWidth={1.5} className="opacity-50"/>;
  }

  return (
    <div className={`flex flex-col justify-center rounded-2xl border-2 ${corBorda} ${cardBg} transition-all duration-500 ease-out ${sombra} h-full overflow-hidden relative group p-4`}>
      <div className="flex items-center gap-5 w-full">
        <div className={`w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center border ${iconeBg} overflow-hidden transition-all duration-300 transform`}>
          {IconArea}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center items-start text-left">
            <div className="mb-1 min-h-[16px] flex items-end w-full justify-start">
                {member.boardRole ? (
                    <span className="text-[11px] md:text-[12px] text-yellow-400 font-black uppercase tracking-wider leading-none drop-shadow-md">
                        {member.boardRole.toUpperCase()}
                    </span>
                ) : (
                    <span className="text-[11px] opacity-0 select-none leading-none">.</span>
                )}
            </div>
            <div className={`text-base md:text-[1.25rem] font-bold uppercase tracking-wide leading-tight text-left break-words w-full ${corNome} drop-shadow-sm`}>
                {member.name}
            </div>
            <div className="mt-2 flex w-full justify-start">
                <span className={`text-[11px] font-bold inline-block px-3 py-0.5 rounded border ${isPresent ? 'bg-gray-800/80 border-gray-600 text-blue-200' : 'bg-gray-900 border-gray-800 text-gray-700'}`}>
                    {member.party}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
};

const ResumoVotacao: React.FC<{ session: any, members: any[] }> = ({ session, members }) => {
  const presentes = members.filter(m => session.presence[m.uid]).length;
  const total = members.length;
  const votes = session.votes;
  const sim = Object.values(votes).filter(v => v === VoteOption.SIM).length;
  const nao = Object.values(votes).filter(v => v === VoteOption.NAO).length;
  const abs = Object.values(votes).filter(v => v === VoteOption.ABS).length;

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

const VotingPanel: React.FC = () => {
    const { session, councilMembers } = useSession();
    
    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col p-6 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black overflow-hidden relative selection:bg-blue-500/30">
             <header className="flex justify-between items-center bg-gray-900/60 backdrop-blur-xl px-8 py-5 rounded-3xl border-b border-white/5 mb-6 shadow-2xl shrink-0 z-10">
                  <div className="flex items-center gap-6">
                    <div className="p-3.5 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-lg shadow-blue-900/20 ring-1 ring-white/10"> 
                        <Users size={36} className="text-white" /> 
                    </div>
                    <div> 
                        <h1 className="text-3xl font-bold tracking-widest text-white drop-shadow-md">CÂMARA MUNICIPAL</h1> 
                        <p className="text-blue-300/80 text-sm font-bold uppercase tracking-[0.3em] ml-0.5">{session.cityName || 'Poder Legislativo'}</p> 
                    </div>
                  </div>
                  <div className="text-right">
                     <div className="text-6xl font-mono font-bold text-white tracking-tighter drop-shadow-lg leading-none"> 
                        <Clock /> 
                     </div>
                     <div className="text-gray-400 font-medium text-sm mt-2 uppercase tracking-widest"> 
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
                     </div>
                  </div>
             </header>

             {session.currentProject && (
                <div className="mb-6 flex gap-6 h-36 shrink-0 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex-1 bg-gray-800/40 backdrop-blur-xl px-8 py-5 rounded-2xl border-l-8 border-blue-500 flex flex-col justify-center shadow-2xl ring-1 ring-white/5">
                        <div className="flex items-center justify-between mb-2"> 
                            <h3 className="text-blue-400 font-bold uppercase tracking-wider text-xs">Em Votação</h3> 
                        </div>
                        <p className="text-3xl font-bold text-white leading-tight mb-2 line-clamp-1 drop-shadow-md">{session.currentProject.title}</p>
                        <p className="text-gray-300 text-lg line-clamp-2 leading-relaxed max-w-5xl">{session.currentProject.description}</p>
                    </div>
                     <div className={`w-56 rounded-2xl flex flex-col items-center justify-center border-2 backdrop-blur-xl shadow-2xl ${session.votingOpen ? 'border-red-500/30 bg-gradient-to-b from-red-900/40 to-red-950/40 animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 'border-green-500/30 bg-gradient-to-b from-green-900/40 to-green-950/40'}`}>
                        {session.votingOpen ? (
                          <>
                            <Play size={48} className="text-red-500 mb-2 drop-shadow-lg" /> 
                            <span className="text-red-500 font-black text-center text-xl tracking-wider drop-shadow-md">VOTAÇÃO<br/>ABERTA</span> 
                          </>
                        ) : (
                          <div className="text-center p-2">
                             <span className="text-green-400 font-black text-xl tracking-wider drop-shadow-md">VOTAÇÃO<br/>ENCERRADA</span>
                             <p className="text-white font-bold text-2xl mt-2 line-clamp-2">{session.votingResult || "Aguardando Apuração"}</p>
                          </div>
                        )}
                    </div>
                </div>
             )}

             <div className="flex-1 min-h-0 overflow-hidden pb-4 relative z-0">
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 h-full content-stretch p-2">
                    {councilMembers.map(ver => ( 
                        <CardVereador key={ver.uid} member={ver} session={session} /> 
                    ))}
                </div>
             </div>

             <div className="flex-shrink-0 mt-2 mb-2">
                <ResumoVotacao session={session} members={councilMembers} />
             </div>
        </div>
    );
};

export default VotingPanel;