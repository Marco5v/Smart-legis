import React from 'react';
import { Project } from '../../types';
import Clock from './Clock';

const ReadingPanel: React.FC<{
  project: Project | null;
}> = ({ project }) => {
  
  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white text-4xl bg-black">
        Nenhum projeto em leitura.
      </div>
    );
  }
  
  const isBlockVote = project.id.startsWith('block-vote-');

  const sessionInfo = `808ª SESSÃO ORDINÁRIA DO 2º PERÍODO LEGISLATIVO DE`;
  const dateInfo = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="w-full h-full flex flex-col text-white p-6 bg-black font-sans">
      {/* Main Content */}
      <main className="flex-grow grid grid-cols-12 gap-8 items-center">
        {/* Left Side: Ementa */}
        <div className="col-span-5 h-3/4 border-2 border-gray-600 p-6 flex flex-col">
          <h3 className="text-purple-400 font-bold text-3xl mb-6 text-center border-b-2 border-purple-400 pb-3">
            {isBlockVote ? 'VOTAÇÃO EM BLOCO' : project.matterType || 'PROJETO'}
          </h3>
          <div className="flex-grow overflow-y-auto pr-2">
             {isBlockVote ? (
                <ul className="list-disc list-inside text-2xl space-y-3">
                  {project.description.split('; ').map((item, index) => <li key={index}>{item}</li>)}
                </ul>
             ) : (
                <p className="text-2xl leading-relaxed">{project.description}</p>
             )}
          </div>
        </div>
        
        {/* Right Side: Details */}
        <div className="col-span-7 h-3/4 flex flex-col items-center justify-around">
            <h2 className="text-3xl font-bold text-center">{sessionInfo}</h2>
            
            <div className="text-center my-6">
                <p className="text-5xl font-black text-yellow-400 border-b-4 border-yellow-400 inline-block px-4 pb-2">
                  AUTOR: {project.author.name.toUpperCase()}
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-2xl font-semibold w-full max-w-4xl">
                 <p>TURNO ÚNICO</p>
                 <p>QUORUM: {project.votingRules.majority.toUpperCase()}</p>
                 <p>TRÂMITE: {project.turns?.toUpperCase()}</p>
                 <p>INSTITUIÇÃO: {project.proposingInstitution?.toUpperCase()}</p>
            </div>

            <img src="https://picsum.photos/seed/brasao/150" alt="Brasão do Município" className="h-40 mt-8" />
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-3 flex justify-between items-center px-6 text-xl font-semibold">
          <span>{dateInfo}</span>
          <Clock className="font-mono" />
          <span>{new Date().toLocaleDateString('pt-BR')}</span>
      </footer>
    </div>
  );
};

export default ReadingPanel;