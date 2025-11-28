import React, { useState, useEffect } from 'react';
import { UserProfile, VoteOption } from '../../types';
import { useSession } from '../../context/SessionContext';
import Clock from './Clock';

// Componente para o círculo de status (3 estados)
const PresenceCircle: React.FC<{ isPresent: boolean; isConfirmedAbsent: boolean }> = ({ isPresent, isConfirmedAbsent }) => {
    let circleClass = 'border-sapv-gray-dark bg-transparent'; // Neutro
    if (isPresent) {
        circleClass = 'border-sapv-green-present bg-sapv-green-present'; // Presente
    } else if (isConfirmedAbsent) {
        circleClass = 'border-sapv-red-absent bg-sapv-red-absent'; // Ausente
    }
    return (
        <div className={`w-6 h-6 rounded-full border-2 ${circleClass} flex-shrink-0`} />
    );
};

// Componente para a linha de cada parlamentar
const MemberRow: React.FC<{ member: UserProfile, isPresent: boolean, isConfirmedAbsent: boolean, role?: string }> = ({ member, isPresent, isConfirmedAbsent, role }) => (
    <div className="flex items-center text-xl font-semibold whitespace-nowrap gap-4">
        {role ? 
            <span className="text-sapv-highlight w-24 text-right">{role}</span>
            : <span className="w-24"></span>}
        <PresenceCircle isPresent={isPresent} isConfirmedAbsent={isConfirmedAbsent} />
        <span className="text-sapv-gray-light flex-1 truncate" title={member.name}>{member.name}</span>
        <span className="text-sapv-gray w-20 text-left">{member.party}</span>
    </div>
);


const PresencePanel: React.FC = () => {
    const { session, councilMembers, legislatureConfig } = useSession();
    const { votes, presence, confirmedAbsence } = session;

    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setDate(new Date()), 1000);
        return () => clearInterval(timerId);
      }, []);

    const presentCount = Object.values(presence).filter(p => p).length;
    const totalMembers = councilMembers.length;
    const absentCount = totalMembers - presentCount;
    
    const simVotes = Object.values(votes).filter(v => v === VoteOption.SIM).length;
    const naoVotes = Object.values(votes).filter(v => v === VoteOption.NAO).length;
    const absVotes = Object.values(votes).filter(v => v === VoteOption.ABS).length;

    const president = councilMembers.find(m => m.boardRole === 'Presidente');
    const boardMembersOrder = ['Vice-Presidente', '1º Secretário', '2º Secretário'];
    
    const otherMembers = councilMembers
        .filter(m => m.uid !== president?.uid)
        .sort((a, b) => {
            const roleAIndex = a.boardRole ? boardMembersOrder.indexOf(a.boardRole) : -1;
            const roleBIndex = b.boardRole ? boardMembersOrder.indexOf(b.boardRole) : -1;

            if (roleAIndex !== -1 && roleBIndex !== -1) return roleAIndex - roleBIndex;
            if (roleAIndex !== -1) return -1;
            if (roleBIndex !== -1) return 1;
            return a.name.localeCompare(b.name);
        });

    const midPoint = Math.ceil(otherMembers.length / 2);
    const leftColumnMembers = otherMembers.slice(0, midPoint);
    const rightColumnMembers = otherMembers.slice(midPoint);

    const getRoleLabel = (role: string | undefined) => {
        if (!role) return undefined;
        switch(role) {
            case 'Vice-Presidente': return 'VICE';
            case '1º Secretário': return '1ºSEC';
            case '2º Secretário': return '2ºSEC';
            default: return undefined;
        }
    }

    return (
        <div className="w-full h-full flex flex-col text-white bg-sapv-blue-dark font-sans uppercase">
            {/* Header */}
            <header className="bg-blue-800 py-3 text-center shadow-lg">
                <h1 className="text-4xl font-extrabold tracking-wider">CÂMARA MUNICIPAL DE {legislatureConfig.cityName.toUpperCase()}</h1>
            </header>

            <div className="flex-grow grid grid-cols-12 gap-6 p-6 overflow-hidden">
                {/* Main Content: Members List */}
                <div className="col-span-9 flex flex-col">
                    {/* President */}
                    {president && (
                         <div className="mb-4 pb-4 border-b-2 border-sapv-highlight">
                           <div className="flex items-center text-xl font-bold whitespace-nowrap gap-4">
                               <span className="text-sapv-highlight w-60">PRESIDENTE DA CÂMARA:</span>
                               <PresenceCircle isPresent={!!presence[president.uid]} isConfirmedAbsent={!!confirmedAbsence[president.uid]} />
                               <span className="text-sapv-gray-light flex-1 truncate">{president.name}</span>
                               <span className="text-sapv-gray w-20 text-left">{president.party}</span>
                           </div>
                        </div>
                    )}
                    
                    {/* Other Members */}
                    <div className="flex-grow grid grid-cols-2 gap-x-12 gap-y-4 pt-2">
                        {/* Left Column */}
                        <div className="flex flex-col gap-4">
                            {leftColumnMembers.map(member => (
                                <MemberRow 
                                    key={member.uid}
                                    member={member}
                                    isPresent={!!presence[member.uid]}
                                    isConfirmedAbsent={!!confirmedAbsence[member.uid]}
                                    role={getRoleLabel(member.boardRole)}
                                />
                            ))}
                        </div>
                         {/* Right Column */}
                         <div className="flex flex-col gap-4">
                             {rightColumnMembers.map(member => (
                                <MemberRow 
                                    key={member.uid}
                                    member={member}
                                    isPresent={!!presence[member.uid]}
                                    isConfirmedAbsent={!!confirmedAbsence[member.uid]}
                                    role={getRoleLabel(member.boardRole)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar: Stats */}
                <aside className="col-span-3 flex flex-col justify-between border-l-2 border-sapv-gray-dark pl-6">
                    {/* Presence Stats */}
                    <div className="space-y-3 text-xl font-extrabold bg-sapv-blue-light p-4 rounded-lg">
                        <div className="flex justify-between items-center border-b border-sapv-gray-dark pb-2">
                            <span className="text-sapv-gray-light">PARLAMENTARES</span>
                            <span className="font-mono text-2xl">{String(totalMembers).padStart(2, '0')}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-sapv-gray-dark pb-2 text-yellow-400">
                             <span>AUSENTES</span>
                            <span className="font-mono text-2xl">{String(absentCount).padStart(2, '0')}</span>
                        </div>
                        <div className="flex justify-between items-center pb-1 text-sapv-highlight">
                             <span>PRESENTES</span>
                            <span className="font-mono text-2xl">{String(presentCount).padStart(2, '0')}</span>
                        </div>
                    </div>

                    {/* Voting Stats */}
                    <div className="flex justify-around items-center my-6">
                        <div className="text-center">
                            <div className="border-2 border-sapv-gray-dark px-6 py-2 rounded-lg bg-sapv-blue-light">
                                <p className="text-5xl font-black font-mono text-sapv-green-present">{String(simVotes).padStart(2, '0')}</p>
                                <p className="text-xl font-extrabold text-sapv-green-present mt-1">SIM</p>
                            </div>
                        </div>
                         <div className="text-center">
                            <div className="border-2 border-sapv-gray-dark px-6 py-2 rounded-lg bg-sapv-blue-light">
                                <p className="text-5xl font-black font-mono text-sapv-red-absent">{String(naoVotes).padStart(2, '0')}</p>
                                <p className="text-xl font-extrabold text-sapv-red-absent mt-1">NÃO</p>
                            </div>
                        </div>
                         <div className="text-center">
                            <div className="border-2 border-sapv-gray-dark px-4 py-2 rounded-lg bg-sapv-blue-light">
                                <p className="text-5xl font-black font-mono text-yellow-400">{String(absVotes).padStart(2, '0')}</p>
                                <p className="text-xl font-extrabold text-yellow-400 mt-1">ABS</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Clock and Date */}
                    <div className="text-center font-mono bg-sapv-blue-light p-4 rounded-lg">
                         <Clock className="text-4xl font-bold" />
                         <p className="text-xl mt-1">{date.toLocaleDateString('pt-BR')}</p>
                    </div>
                </aside>
            </div>

            {/* Footer */}
            <footer className="border-t-2 border-sapv-highlight py-2 text-center bg-sapv-blue-light">
                <p className="text-xl font-bold tracking-wider">808ª SESSÃO ORDINÁRIA DO 2º PERÍODO LEGISLATIVO DE 2025</p>
            </footer>
        </div>
    );
};

export default PresencePanel;
