import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { useSession } from '../../context/SessionContext';
import Clock from './Clock';

const ReadingPanel: React.FC<{ project: Project | null; }> = ({ project }) => {
  const { legislatureConfig } = useSession();
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setDate(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  if (!project) {
    return (
      <div className="w-full h-full flex items-center justify-center text-white text-4xl bg-black">
        Nenhum projeto em leitura.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col text-white bg-black font-sans uppercase p-6">
      <div className="grid grid-cols-3 gap-8 flex-grow">
        
        {/* Left Column: Description */}
        <div className="col-span-1 bg-gray-900 border border-white p-4 flex flex-col">
          <header className="bg-purple-800 text-center py-2 mb-4 -m-4 mt-0">
            <h2 className="text-2xl font-bold">{project.matterType}</h2>
          </header>
          <div className="overflow-y-auto flex-grow pr-2">
            <p className="text-2xl leading-relaxed">{project.description}</p>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="col-span-2 flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <h1 className="text-4xl font-bold">808ª SESSÃO ORDINÁRIA DO 2º PERÍODO LEGISLATIVO DE 2025</h1>
            <div className="my-10">
              <h2 className="text-5xl font-extrabold text-white inline-block">AUTOR: {project.author.name.toUpperCase()}</h2>
              <div className="h-1.5 bg-yellow-400 mt-1 w-full max-w-lg mx-auto"></div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-3xl font-bold text-left max-w-2xl mx-auto">
              <div>TURNO: <span className="text-gray-300">{project.turns || 'Único'}</span></div>
              <div>QUORUM: <span className="text-gray-300">{project.votingRules.majority}</span></div>
              <div>TRÂMITE: <span className="text-gray-300">{project.projectPhase || 'Não definido'}</span></div>
              <div>INSTITUIÇÃO: <span className="text-gray-300">{project.proposingInstitution || 'CÂMARA MUNICIPAL'}</span></div>
            </div>
          </div>

          <img src="https://picsum.photos/seed/brasao/120" alt="Brasão do Município" className="h-40" />
        </div>
      </div>

      <footer className="text-center font-mono mt-4">
        <p className="text-2xl">{date.toLocaleDateString('pt-BR', { weekday: 'long' })}, <Clock className="inline-block" /> - {date.toLocaleDateString('pt-BR')}</p>
      </footer>
    </div>
  );
};

export default ReadingPanel;
