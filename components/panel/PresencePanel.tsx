
import React from 'react';
import { UserProfile, Votes } from '../../types';
import CouncilMemberCard from '../CouncilMemberCard';
import { useSession } from '../../context/SessionContext';

const PresencePanel: React.FC<{ councilMembers: UserProfile[], presentMembers: string[], votes?: Votes }> = ({ councilMembers, presentMembers }) => {
    const { session } = useSession();
    
    const presentCount = presentMembers.length;
    const totalMembers = councilMembers.length;
    const absentCount = totalMembers - presentCount;

    return (
        <div className="w-full h-full text-black flex flex-col p-4 md:p-6 font-sans">
            <header className="flex justify-between items-center border-b-2 border-gray-200 pb-3">
                <div className="flex items-center gap-4">
                    <img src="https://picsum.photos/seed/brasao/60" alt="Brasão" className="h-12 md:h-16" />
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Câmara Municipal de {session.cityName}</h1>
                        <p className="text-md md:text-lg text-gray-600">{session.sessionType}</p>
                    </div>
                </div>
                <div className="text-right">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-800">Painel de Presença</h2>
                    <p className="text-md md:text-lg text-gray-600">{new Date().toLocaleDateString('pt-BR')}</p>
                </div>
            </header>

            <main className="flex-grow my-4 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {councilMembers.map(member => (
                        <CouncilMemberCard 
                            key={member.uid} 
                            member={member} 
                            isPresent={presentMembers.includes(member.uid)}
                        />
                    ))}
                </div>
            </main>

            <footer className="border-t-2 border-gray-200 pt-3 flex justify-around items-center text-xl font-bold">
                <div className="text-center">
                    <p className="text-gray-500 text-sm">TOTAL</p>
                    <p>{totalMembers}</p>
                </div>
                 <div className="text-center">
                    <p className="text-green-600 text-sm">PRESENTES</p>
                    <p className="text-green-600">{presentCount}</p>
                </div>
                 <div className="text-center">
                    <p className="text-red-600 text-sm">AUSENTES</p>
                    <p className="text-red-600">{absentCount}</p>
                </div>
            </footer>
        </div>
    );
};

export default PresencePanel;