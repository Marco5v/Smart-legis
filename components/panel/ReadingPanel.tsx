
import React from 'react';
import { Project } from '../../types';
import { FileText, User } from 'lucide-react';
import PresencePanel from './PresencePanel';

interface ReadingPanelProps {
    project: Project | null;
}

const ReadingPanel: React.FC<ReadingPanelProps> = ({ project }) => {

    if (!project) {
        return <PresencePanel />;
    }

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-gray-800/50 backdrop-blur-md p-12 rounded-xl border border-blue-500 shadow-2xl max-w-4xl w-full">
                <div className="flex items-center justify-center gap-4 mb-6">
                    <FileText size={40} className="text-blue-400"/>
                    <h2 className="text-3xl font-bold uppercase tracking-widest text-blue-400">Leitura de Matéria</h2>
                </div>
                <h1 className="text-5xl font-bold text-white mb-4">{project.title}</h1>
                <p className="text-2xl text-gray-300 leading-relaxed mb-8">{project.description}</p>
                <div className="flex items-center justify-center gap-3 text-xl text-gray-400">
                    <User size={24} />
                    <span>Autor: <span className="font-semibold text-white">{project.author.name}</span></span>
                </div>
            </div>
        </div>
    );
};

export default ReadingPanel;
