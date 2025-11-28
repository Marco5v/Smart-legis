
import React from 'react';
import { UserProfile } from '../types';

interface CouncilMemberCardProps {
    member: UserProfile;
    isPresent: boolean;
    isConfirmedAbsent: boolean;
}

const CouncilMemberCard: React.FC<CouncilMemberCardProps> = ({ member, isPresent }) => {
    return (
        <div 
            className={`
                bg-sapv-blue-light rounded-lg p-3 border border-sapv-gray-dark text-center relative 
                transition-opacity duration-300 h-full flex flex-col justify-center
                ${!isPresent ? 'opacity-50' : 'opacity-100'}
            `}
        >
            {/* Ícone discreto de presença */}
            <div 
                className={`
                    absolute top-2 right-2 w-2.5 h-2.5 rounded-full
                    ${isPresent ? 'bg-sapv-highlight' : 'bg-sapv-gray-dark'}
                `} 
                title={isPresent ? 'Presente' : 'Ausente'}
            />

            {/* Nome com gradiente */}
            <p 
                className="font-bold text-sm leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-sapv-gray-light truncate"
                title={member.name}
            >
                {member.name}
            </p>
             {/* Adicionando o partido de forma discreta */}
             <p className="text-xs text-sapv-gray uppercase mt-1 truncate" title={member.party}>
                {member.party}
            </p>
        </div>
    );
};

export default CouncilMemberCard;
