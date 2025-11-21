
import React from 'react';
import { useSession } from '../../context/SessionContext';
import { VoteOption, UserProfile } from '../../types';
import Clock from './Clock';

// Nota sobre a Persistência de Votos:
// A garantia de que os votos não sejam perdidos ao recarregar a página é tratada
// de forma centralizada no `SessionContext.tsx`. Todo o estado da sessão, incluindo
// o objeto `votes`, é salvo automaticamente no localStorage do navegador sempre que
// uma alteração ocorre (como ao registrar um voto). Ao recarregar a aplicação,
// esse estado é restaurado. Este componente (`VotingPanel`) apenas exibe o
// estado persistido fornecido pelo contexto, garantindo a integridade dos dados.

const VotingPanel: React.FC = () => {
  const { session, councilMembers, legislatureConfig } = useSession();
  
  const { votes, presence, currentProject, votingResult } = session;

  const getVoteStatus = (member: UserProfile): { label: string; style: string } => {
    if (!presence[member.uid]) {
      return { label: 'AUSENTE', style: 'bg-sapv-gray-dark opacity-60' };
    }
    const vote = votes[member.uid];
    switch (vote) {
      case VoteOption.SIM:
        return { label: 'SIM', style: 'bg-green-600 border-4 border-green-300' };
      case VoteOption.NAO:
        return { label: 'NÃO', style: 'bg-red-600 border-4 border-red-300' };
      case VoteOption.ABS:
        return { label: 'ABSTER', style: 'bg-yellow-600 border-4 border-yellow-300' };
      default:
        return { label: 'AGUARDANDO', style: 'bg-sapv-blue-light border-4 border-sapv-gray-dark animate-pulse' };
    }
  };
  
  const simVotes = Object.values(votes).filter(v => v === VoteOption.SIM).length;
  const naoVotes = Object.values(votes).filter(v => v === VoteOption.NAO).length;
  const absVotes = Object.values(votes).filter(v => v === VoteOption.ABS).length;
  const totalVotes = simVotes + naoVotes + absVotes;
  const presentCount = Object.values(presence).filter(p => p).length;

  return (
    <div className="w-full h-full flex flex-col text-sapv-gray-light p-6 bg-sapv-blue-dark font-sans relative">
      <header className="text-center pb-4">
        <h1 className="text-3xl font-bold">VOTAÇÃO NOMINAL</h1>
        <p className="text-4xl font-extrabold text-sapv-highlight mt-2">{currentProject?.title || "Nenhum projeto em votação"}</p>
      </header>

      <main className="flex-grow grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 py-6">
        {councilMembers.map(member => {
          const status = getVoteStatus(member);
          return (
            <div key={member.uid} className={`rounded-lg p-3 text-center flex flex-col justify-between shadow-2xl transition-all duration-300 h-full ${status.style}`}>
                <div className="flex-grow flex flex-col items-center justify-center">
                    <p className="font-bold text-xl leading-tight text-transparent bg-clip-text bg-gradient-to-r from-sapv-gray-light to-sapv-highlight">
                        {member.name}
                    </p>
                    <p className="text-sm text-sapv-gray mt-1">{member.party}</p>
                </div>
                 <p className="font-black text-2xl mt-3 tracking-widest">{status.label}</p>
            </div>
          );
        })}
      </main>

      <footer className="flex-shrink-0 border-t-4 border-sapv-highlight p-4 flex justify-between items-center">
        <div className="flex items-center gap-12">
            <div className="text-center">
                <p className="text-2xl font-bold text-green-400">SIM</p>
                <p className="text-7xl font-black font-mono">{String(simVotes).padStart(2, '0')}</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-red-400">NÃO</p>
                <p className="text-7xl font-black font-mono">{String(naoVotes).padStart(2, '0')}</p>
            </div>
             <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">ABSTENÇÃO</p>
                <p className="text-7xl font-black font-mono">{String(absVotes).padStart(2, '0')}</p>
            </div>
             <div className="text-center">
                <p className="text-2xl font-bold text-sapv-gray">TOTAL</p>
                <p className="text-7xl font-black font-mono">{String(totalVotes).padStart(2, '0')}</p>
            </div>
        </div>
        <div className="text-right">
            <Clock className="text-6xl font-mono" />
            <p className="text-2xl font-semibold">Presentes: {presentCount}/{legislatureConfig.totalMembers}</p>
        </div>
      </footer>
      
      {votingResult && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 panel-fade-in">
          <h2 className={`text-9xl font-black tracking-widest ${votingResult.includes('APROVADO') ? 'text-green-400' : 'text-red-400'}`}>
            {votingResult}
          </h2>
        </div>
      )}

    </div>
  );
};

export default VotingPanel;
