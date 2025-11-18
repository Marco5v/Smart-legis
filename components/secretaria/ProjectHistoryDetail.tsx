import React from 'react';
import { Project } from '../../types';

interface ProjectHistoryDetailProps {
  project: Project;
}

export const ProjectHistoryDetail: React.FC<ProjectHistoryDetailProps> = ({ project }) => {
  const history = project.transmittalHistory || [];

  return (
    <div className="p-4">
      {history.length > 0 ? (
        <div className="relative pl-6">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-sapv-gray-dark" />
          {history.map((entry, index) => (
            <div key={index} className="relative mb-6">
              <div className="absolute -left-[37px] top-1 w-4 h-4 bg-sapv-highlight rounded-full border-4 border-sapv-blue-dark"></div>
              <p className="text-xs text-sapv-gray">
                {new Date(entry.date).toLocaleString('pt-BR')} por <span className="font-semibold">{entry.author}</span>
              </p>
              <p className="text-sapv-gray-light">{entry.event}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sapv-gray text-center py-8">Nenhum histórico de tramitação para este projeto.</p>
      )}
    </div>
  );
};