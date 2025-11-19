import React from 'react';
import { UserProfile } from '../types';
import { Check, X } from 'lucide-react';

interface CouncilMemberCardProps {
    member: UserProfile;
    isPresent: boolean;
}

const CouncilMemberCard: React.FC<CouncilMemberCardProps> = ({ member, isPresent }) => {
    const cardClasses = `
        border-2 rounded-lg p-3 text-center transition-all duration-300
        ${isPresent ? 'border-green-500 bg-green-50 shadow-md' : 'border-gray-300 bg-white opacity-80'}
    `;

    const statusClasses = `
        flex items-center justify-center gap-1 text-xs font-bold mt-2
        ${isPresent ? 'text-green-700' : 'text-red-700'}
    `;

    return (
        <div className={cardClasses}>
            <img 
                src={member.photoUrl} 
                alt={`Foto de ${member.name}`}
                className={`w-20 h-20 rounded-full mx-auto mb-2 border-4 ${isPresent ? 'border-green-200' : 'border-gray-200'}`}
            />
            <p className="font-bold text-sm truncate">{member.name}</p>
            <p className="text-xs text-gray-500">{member.party}</p>
            <div className={statusClasses}>
                {isPresent ? <Check size={14} /> : <X size={14} />}
                <span>{isPresent ? 'PRESENTE' : 'AUSENTE'}</span>
            </div>
        </div>
    );
};

export default CouncilMemberCard;