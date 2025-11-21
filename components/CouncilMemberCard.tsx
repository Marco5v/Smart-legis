import React from 'react';
import { UserProfile } from '../types';

interface CouncilMemberCardProps {
    member: UserProfile;
    isPresent: boolean;
}

const CouncilMemberCard: React.FC<CouncilMemberCardProps> = ({ member, isPresent }) => {
    // Estilo "Oeni": minimalista, focado em texto, com opacidade reduzida para ausentes.
    const cardStyle = isPresent
        ? 'opacity-100'
        : 'opacity-50';

    // Estilo mais proeminente para o ícone de presença.
    const presenceStyles = isPresent 
        ? 'bg-green-400 border-green-200' 
        : 'bg-red-500 border-red-300';

    return (
        <div className={`bg-sapv-blue-light rounded-lg p-4 border border-sapv-gray-dark shadow-md transition-opacity duration-300 flex flex-col justify-center h-full ${cardStyle}`}>
            <div className="flex items-center gap-3">
                {/* Ícone de presença mais proeminente */}
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${presenceStyles}`}></div>
                
                <div className="flex-grow truncate">
                    {/* Nome do vereador com gradiente mais suave */}
                    <p className="font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-sapv-gray-light truncate text-lg">
                        {member.name}
                    </p>
                    {/* Partido */}
                    <p className="text-sm text-sapv-gray">{member.party}</p>
                </div>
            </div>
        </div>
    );
};

export default CouncilMemberCard;
