import React from 'react';
import { UserProfile } from '../types';

interface CouncilMemberCardProps {
    member: UserProfile;
    isPresent: boolean;
}

const CouncilMemberCard: React.FC<CouncilMemberCardProps> = ({ member, isPresent }) => {
    return (
        <div className="bg-sapv-blue-light rounded-lg p-3 text-center border border-sapv-gray-dark shadow-lg transition-shadow duration-300 relative">
            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full border border-sapv-blue-dark ${isPresent ? 'bg-green-500' : 'bg-sapv-gray-dark'}`}></div>
            <img 
                src={member.photoUrl} 
                alt={`Foto de ${member.name}`}
                className={`w-24 h-24 rounded-full mx-auto mb-2 border-4 border-sapv-blue-dark shadow-md ${!isPresent && 'filter grayscale'}`}
            />
            <p className="font-bold text-sapv-gray-light truncate text-sm">
                {member.name}
            </p>
            <p className="text-xs text-sapv-gray">{member.party}</p>
        </div>
    );
};

export default CouncilMemberCard;