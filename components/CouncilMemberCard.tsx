import React from 'react';
import { UserProfile } from '../types';

interface CouncilMemberCardProps {
    member: UserProfile;
    isPresent: boolean;
    isConfirmedAbsent: boolean;
}

const CouncilMemberCard: React.FC<CouncilMemberCardProps> = ({ member, isPresent, isConfirmedAbsent }) => {
    
    const getNameColorStyle = () => {
        if (isPresent) {
            return 'text-green-400'; // VERDE para Presente
        }
        if (isConfirmedAbsent) {
            return 'text-red-500'; // VERMELHO para Ausente confirmado
        }
        return 'text-white'; // BRANCO para status inicial/não confirmado
    };

    const nameColor = getNameColorStyle();

    return (
        <div className={`bg-sapv-blue-light rounded-lg p-3 border border-sapv-gray-dark transition-colors duration-300 flex flex-col justify-center h-full text-center`}>
            {/* Nome do vereador com cor de status */}
            <p className={`font-bold text-lg leading-tight truncate ${nameColor}`} title={member.name}>
                {member.name}
            </p>
            {/* Partido */}
            <p className="text-sm text-sapv-gray">{member.party}</p>
        </div>
    );
};

export default CouncilMemberCard;