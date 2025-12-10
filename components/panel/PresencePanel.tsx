
import React from 'react';
import { useSession } from '../../context/SessionContext';
import { UserProfile, SessionPhase } from '../../types';
import { User, Users } from 'lucide-react';
import Clock from './Clock';

const CardVereador: React.FC<{ member: UserProfile, isPresent: boolean }> = ({ member, isPresent }) => {
    let corBorda = isPresent ? "border-green-600/50" : "border-gray-800";
    let corNome = isPresent ? "text-green-400" : "text-red-500";
    let cardBg = isPresent ? "bg-gradient-to-br from-gray-800/60 to-gray-900/95" : "bg-gray-900/20 opacity-60";
    
    return (
      <div className={`flex flex-col justify-center rounded-2xl border-2 ${corBorda} ${cardBg} transition-all duration-500 ease-out shadow-lg h-full overflow-hidden p-4`}>
        <div className="flex items-center gap-5 w-full">
          <div className={`w-20 h-20 rounded-2xl flex-shrink-0 flex items-center justify-center border ${isPresent ? 'bg-gray-700/80 border-gray-600' : 'bg-gray-800 border-gray-700 text-gray-600'} overflow-hidden`}>
            {member.photoUrl ? (
              <img src={member.photoUrl} alt={member.name} className={`w-full h-full object-cover ${!isPresent && 'grayscale'}`} />
            ) : (
              <User size={40} strokeWidth={1.5} />
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center items-start text-left">
            {member.boardRole && (
              <div className="mb-1 min-h-[16px]">
                <span className="text-[11px] md:text-[12px] text-yellow-400 font-black uppercase tracking-wider leading-none drop-shadow-md">
                    {member.boardRole}
                </span>
              </div>
            )}
            <div className={`text-base md:text-[1.25rem] font-bold uppercase tracking-wide leading-tight text-left break-words w-full ${corNome} drop-shadow-sm`}>
                {member.name}
            </div>
            <div className="mt-2">
                <span className={`text-[11px] font-bold inline-block px-3 py-0.5 rounded border ${isPresent ? 'bg-gray-800/80 border-gray-600 text-blue-200' : 'bg-gray-900 border-gray-800 text-gray-700'}`}>
                    {member.party}
                </span>
            </div>
          </div>
        </div>
      </div>
    );
};

const ResumoPresenca: React.FC<{ session: any; members: UserProfile[] }> = ({ session, members }) => {
    const presentes = members.filter(m => session.presence[m.uid]).length;
    const total = members.length;
  
    return (
        <div className="bg-gray-800/60 backdrop-blur-xl border border-gray-600 px-12 py-4 rounded-full flex items-center justify-center gap-6 mx-auto shadow-2xl"> 
            <span className="text-gray-400 uppercase tracking-[0.2em] text-sm font-bold">Quórum em Plenário</span> 
            <span className="text-5xl font-black text-white leading-none">{presentes}<span className="text-gray-500 text-2xl font-medium ml-1">/{total}</span></span> 
        </div> 
    );
};

const PresencePanel: React.FC = () => {
    const { session, councilMembers } = useSession();

    return (
        <div className="h-screen bg-black text-white font-sans flex flex-col p-6 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black overflow-hidden">
             <header className="flex justify-between items-center bg-gray-900/60 backdrop-blur-xl px-8 py-5 rounded-3xl border-b border-white/5 mb-6 shadow-2xl shrink-0">
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
                        <Clock/>
                     </div>
                     <div className="text-gray-400 font-medium text-sm mt-2 uppercase tracking-widest"> 
                        {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} 
                     </div>
                  </div>
             </header>

            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-yellow-400 uppercase tracking-widest animate-pulse">
                    {session.phase === SessionPhase.INICIAL ? 'Verificação de Quórum' : session.phase}
                </h2>
            </div>
            
             <main className="flex-1 min-h-0 overflow-hidden pb-4">
                <div className="grid grid-cols-3 lg:grid-cols-4 gap-4 h-full content-stretch p-2">
                    {councilMembers.map(member => ( 
                        <CardVereador key={member.uid} member={member} isPresent={!!session.presence[member.uid]} /> 
                    ))}
                </div>
             </main>

            <footer className="flex-shrink-0 mt-auto mb-2">
                <ResumoPresenca session={session} members={councilMembers} />
            </footer>
        </div>
    );
};

export default PresencePanel;
