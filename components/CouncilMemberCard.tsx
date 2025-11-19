
import React from 'react';
import { UserProfile } from '../types';

interface CouncilMemberCardProps {
    member: UserProfile;
    isPresent: boolean;
}

const CouncilMemberCard: React.FC<CouncilMemberCardProps> = ({ member, isPresent }) => {
    return (
        <div className="bg-white rounded-lg p-3 text-center border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 relative">
            <div className={`absolute top-2 right-2 w-3 h-3 rounded-full border border-white ${isPresent ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <img 
                src={member.photoUrl} 
                alt={`Foto de ${member.name}`}
                className={`w-24 h-24 rounded-full mx-auto mb-2 border-4 border-white shadow-md ${!isPresent && 'filter grayscale'}`}
            />
            <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-800 to-gray-500 truncate text-sm">
                {member.name}
            </p>
            <p className="text-xs text-gray-500">{member.party}</p>
        </div>
    );
};

export default CouncilMemberCard;