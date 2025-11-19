import React from 'react';
import { UserProfile } from '../../types';
import { useSession } from '../../context/SessionContext';
import Clock from './Clock';

const PresencePanel: React.FC<{ councilMembers: UserProfile[]; presentMembers: string[]; }> = ({ councilMembers, presentMembers }) => {
    const { legislatureConfig } = useSession();
    
    const presentCount = presentMembers.length;
    const totalMembers = councilMembers.length;
    const absentCount = totalMembers - presentCount;

    const MemberCard = ({ member }: { member: UserProfile }) => {
        const isPresent = presentMembers.includes(member.uid);
        const statusStyle = isPresent 
            ? 'bg-green-600 border-green-300' 
            : 'bg-red-700 border-red-400';
        const photoBorderStyle = isPresent ? 'border-green-400' : 'border-red-500 filter grayscale';
        const statusLabel = isPresent ? 'PRESENTE' : 'AUSENTE';
        const role = member.boardRole;

        return (
            <div className={`bg-sapv-blue-light border border-sapv-gray-dark rounded-lg shadow-lg p-3 text-center flex flex-col justify-between transition-all duration-300`}>
                <div className="flex-grow flex flex-col items-center justify-center">
                    <img 
                        src={member.photoUrl} 
                        alt={member.name}
                        className={`w-28 h-28 rounded-full mb-3 border-4 ${photoBorderStyle}`}
                    />
                    <p className="font-bold text-xl leading-tight text-sapv-gray-light">{member.name}</p>
                    <p className="text-sm text-sapv-gray">{member.party}</p>
                    {role && <p className="text-xs text-sapv-highlight mt-1 font-semibold">{role}</p>}
                </div>
                <div className={`mt-3 py-2 px-1 rounded-md font-black text-xl tracking-widest text-white ${statusStyle}`}>
                    {statusLabel}
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex flex-col text-sapv-gray-light p-6 bg-sapv-blue-dark font-sans">
            <header className="text-center pb-4 border-b-2 border-sapv-gray-dark">
                <h1 className="text-4xl font-bold uppercase tracking-wider">Painel de Presença</h1>
                <p className="text-xl text-sapv-gray mt-1">Câmara Municipal de {legislatureConfig.cityName}</p>
            </header>

            <main className="flex-grow grid grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 py-6 overflow-y-auto pr-2">
                {councilMembers.map(member => (
                    <MemberCard key={member.uid} member={member} />
                ))}
            </main>

            <footer className="flex-shrink-0 border-t-4 border-sapv-highlight p-4 flex justify-between items-center">
                <div className="flex items-center gap-10">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-400">PRESENTES</p>
                        <p className="text-7xl font-black font-mono">{String(presentCount).padStart(2, '0')}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-red-400">AUSENTES</p>
                        <p className="text-7xl font-black font-mono">{String(absentCount).padStart(2, '0')}</p>
                    </div>
                     <div className="text-center">
                        <p className="text-2xl font-bold text-sapv-gray">TOTAL</p>
                        <p className="text-7xl font-black font-mono">{String(totalMembers).padStart(2, '0')}</p>
                    </div>
                </div>
                <div className="text-right">
                    <Clock className="text-6xl font-mono" />
                    <p className="text-2xl font-semibold">Quórum de Abertura: {legislatureConfig.quorumToOpen}</p>
                </div>
            </footer>
        </div>
    );
};

export default PresencePanel;
