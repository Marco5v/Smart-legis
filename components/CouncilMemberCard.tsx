import React from 'react';
import { UserProfile } from '../types';

interface CouncilMemberCardProps {
    member: UserProfile;
    isPresent: boolean;
}

const CouncilMemberCard: React.FC<CouncilMemberCardProps> = ({ member, isPresent }) => {
    const cardStyle = isPresent ? 'opacity-100' : 'opacity-50';
    const presenceDotStyle = isPresent ? 'bg-sapv-highlight' : 'bg-sapv-gray-dark';

    return (
        <div className={`relative bg-sapv-blue-light rounded-lg p-3 border border-sapv-gray-dark transition-opacity duration-300 flex flex-col justify-center h-full text-center ${cardStyle}`}>
            {/* Ícone de presença discreto no canto */}
            <div 
                className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${presenceDotStyle}`}
                title={isPresent ? 'Presente' : 'Ausente'}
                aria-label={isPresent ? 'Presente' : 'Ausente'}
            ></div>

            {/* Nome do vereador com gradiente */}
            <p className="font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-sapv-gray-light text-lg leading-tight truncate" title={member.name}>
                {member.name}
            </p>
            {/* Partido */}
            <p className="text-sm text-sapv-gray">{member.party}</p>
        </div>
    );
};

export default CouncilMemberCard;