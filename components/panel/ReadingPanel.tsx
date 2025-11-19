import React from 'react';
import { Project } from '../../types';
import Clock from './Clock';
import { useSession } from '../../context/SessionContext';

const ReadingPanel: React.FC<{
  project: Project | null;
}> = ({ project }) => {
  const { legislatureConfig } = useSession();

  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white text-4xl bg-black">
        Nenhum projeto em leitura.
      </div>
    );
  }
  
  const isBlockVote = project.id.startsWith('block-vote-');

  // Hardcoded for visual fidelity to the provided image
  const sessionInfo = `808ª SESSÃO ORDINÁRIA DO 2º PERÍODO LEGISLATIVO DE`;
  const fullDate = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  const institution = project.proposingInstitution || `CÂMARA MUNICIPAL DE ${legislatureConfig.cityName}`;

  return (
    <div className="w-full h-full flex flex-col text-white p-6 bg-black font-sans antialiased">
      <main className="flex-grow grid grid-cols-12 gap-8 items-center">
        
        {/* Ementa Box */}
        <div className="col-span-5 h-3/4 border-4 border-gray-600 p-6 flex flex-col">
          <h3 className="text-purple-400 font-bold text-3xl mb-6 text-left border-b-4 border-purple-400 pb-3 -mx-6 px-6">
            {isBlockVote ? 'VOTAÇÃO EM BLOCO' : (project.matterType || 'PROJETO') + ' -'}
          </h3>
          <div className="flex-grow overflow-y-auto pr-2 text-2xl leading-relaxed">
             {isBlockVote ? (
                <ul className="list-disc list-inside space-y-3">
                  {project.description.split('; ').map((item, index) => <li key={index}>{item}</li>)}
                </ul>
             ) : (
                <p>{project.description}</p>
             )}
          </div>
        </div>
        
        {/* Info Box */}
        <div className="col-span-7 h-3/4 flex flex-col items-center justify-around">
            <h2 className="text-4xl font-bold text-center tracking-wide">{sessionInfo}</h2>
            
            <div className="text-center my-6 w-full">
                <p className="text-5xl font-black text-yellow-400 inline-block px-4 pb-2">
                  {project.title.toUpperCase()}
                </p>
                <div className="h-1.5 bg-yellow-400 w-3/4 mx-auto"></div>
                <p className="text-3xl font-semibold text-white mt-4">
                  AUTOR: {project.author.name.toUpperCase()}
                </p>
                <p className="text-2xl text-sapv-gray-light mt-2">
                  INSTITUIÇÃO: {institution.toUpperCase()}
                </p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-16 gap-y-6 text-3xl font-semibold w-full max-w-4xl text-left pl-16">
                 <p>TURNO ÚNICO</p>
                 <p>QUORUM: {project.votingRules.majority.toUpperCase()}</p>
                 <p>TRÂMITE: {project.turns?.toUpperCase()}</p>
            </div>

            <img src="https://picsum.photos/seed/brasao/160" alt="Brasão do Município" className="h-44 mt-8" />
        </div>
      </main>

      <footer className="w-full text-center py-2 flex justify-between items-center px-6 text-2xl font-semibold">
          <span>Sábado, <Clock className="inline-block" /> - {fullDate}</span>
      </footer>
    </div>
  );
};

export default ReadingPanel;
