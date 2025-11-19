
import React from 'react';
import { Project, VoteOption } from '../../types';
import Clock from './Clock';
import { useSession } from '../../context/SessionContext';

const ReadingPanel: React.FC<{ project: Project | null; }> = ({ project }) => {
  const { legislatureConfig, session } = useSession();

  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white text-4xl bg-sapv-blue-dark">
        Nenhum projeto em leitura.
      </div>
    );
  }
  
  const fullDate = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const votes = session.votes || {};
  const simVotes = Object.values(votes).filter(v => v === VoteOption.SIM).length;
  const naoVotes = Object.values(votes).filter(v => v === VoteOption.NAO).length;
  const absVotes = Object.values(votes).filter(v => v === VoteOption.ABS).length;
  const totalVotes = simVotes + naoVotes + absVotes;
  const isVotingActive = session.votingOpen || !!session.votingResult;

  return (
    <div className="w-full h-full flex flex-col text-sapv-gray-light p-8 bg-sapv-blue-dark font-sans antialiased">
      <header className="text-center pb-4 border-b-2 border-sapv-gray-dark">
        <h1 className="text-4xl font-bold">CÂMARA MUNICIPAL DE {legislatureConfig.cityName.toUpperCase()}</h1>
        <p className="text-2xl text-sapv-gray">SESSÃO PLENÁRIA</p>
      </header>
      
      <main className="flex-grow flex flex-col justify-center items-center py-8 overflow-hidden">
        <div className="w-full max-w-6xl text-center">
            <h2 className="text-6xl font-black text-sapv-highlight mb-4">
              {project.title.toUpperCase()}
            </h2>
            <p className="text-3xl text-white mb-8">
              Autor: {project.author.name.toUpperCase()}
            </p>
        </div>
        
        <div className="w-full max-w-5xl bg-sapv-blue-light border border-sapv-gray-dark rounded-lg p-8 h-[40vh] flex flex-col shadow-lg">
            <h3 className="text-3xl font-bold text-sapv-highlight mb-4 border-b border-sapv-gray-dark pb-2">EMENTA</h3>
            <div className="flex-grow overflow-y-auto pr-4 text-2xl leading-relaxed">
                <p>{project.description}</p>
            </div>
        </div>
      </main>

      {isVotingActive ? (
         <footer className="flex-shrink-0 border-t-4 border-sapv-highlight p-4">
            {session.votingResult ? (
                 <h2 className={`mb-4 text-center text-5xl font-black tracking-widest ${session.votingResult.includes('APROVADO') ? 'text-green-400' : 'text-red-400'}`}>
                     {session.votingResult}
                 </h2>
            ) : (
                 <h2 className="mb-4 text-center text-5xl font-black tracking-widest animate-pulse text-yellow-300">
                     VOTAÇÃO ABERTA
                 </h2>
            )}
            <div className="flex justify-around items-center">
                <div className="text-center">
                    <p className="text-3xl font-bold text-green-400">SIM</p>
                    <p className="text-8xl font-black font-mono">{String(simVotes).padStart(2, '0')}</p>
                </div>
                <div className="text-center">
                    <p className="text-3xl font-bold text-red-400">NÃO</p>
                    <p className="text-8xl font-black font-mono">{String(naoVotes).padStart(2, '0')}</p>
                </div>
                 <div className="text-center">
                    <p className="text-3xl font-bold text-yellow-400">ABSTENÇÃO</p>
                    <p className="text-8xl font-black font-mono">{String(absVotes).padStart(2, '0')}</p>
                </div>
                 <div className="text-center">
                    <p className="text-3xl font-bold text-sapv-gray">TOTAL</p>
                    <p className="text-8xl font-black font-mono">{String(totalVotes).padStart(2, '0')}</p>
                </div>
            </div>
        </footer>
      ) : (
        <footer className="flex-shrink-0 w-full text-center py-2 flex justify-between items-center px-6 text-2xl font-semibold border-t-2 border-sapv-gray-dark">
            <Clock />
            <span>{fullDate}</span>
        </footer>
      )}
    </div>
  );
};

export default ReadingPanel;
