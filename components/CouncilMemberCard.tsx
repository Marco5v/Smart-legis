
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
            return 'text-sapv-green-present'; // VERDE para Presente
        }
        if (isConfirmedAbsent) {
            return 'text-sapv-red-absent'; // VERMELHO para Ausente confirmado
        }
        return 'text-sapv-gray-light'; // BRANCO/CINZA CLARO para status inicial/não confirmado
    };

    const nameColor = getNameColorStyle();

    return (
        <div className="bg-sapv-blue-light rounded-md p-2 border border-sapv-gray-dark text-center">
            <p className={`font-bold text-sm leading-tight truncate ${nameColor}`} title={member.name}>
                {member.name.toUpperCase()}
            </p>
        </div>
    );
};

export default CouncilMemberCard;
