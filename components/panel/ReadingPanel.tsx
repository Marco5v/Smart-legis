import React from 'react';
import { Project } from '../../types';

interface ReadingPanelProps {
    project: Project;
}

const ReadingPanel: React.FC<ReadingPanelProps> = ({ project }) => {
  const fullDate = new Date().toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return (
    <div className="w-full h-full flex flex-col text-white p-8 bg-gradient-to-br from-gray-900 via-slate-900 to-black font-sans">
      <main className="flex-grow flex gap-10 items-stretch overflow-hidden">
        {/* Coluna Esquerda: Ementa Scrollável */}
        <div className="w-[35%] border-l-8 border-blue-500 bg-white/5 p-10 rounded-r-3xl flex flex-col shadow-2xl backdrop-blur-md">
          <h3 className="text-blue-400 font-black text-3xl mb-8 border-b border-white/10 pb-6 tracking-wide uppercase">
            {project.matterType}
          </h3>
          <div className="flex-grow overflow-y-auto pr-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#495670 #112240' }}>
             <p className="text-3xl leading-relaxed text-gray-200 font-medium text-justify">{project.description}</p>
          </div>
        </div>
        
        {/* Coluna Direita: Destaques */}
        <div className="w-[65%] flex flex-col items-center justify-center p-12 bg-gradient-to-br from-white/5 to-transparent rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
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

export default ReadingPanel;