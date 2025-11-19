
import React, { useMemo } from 'react';
import { UserProfile, Votes, VoteOption } from '../../types';
import { useSession } from '../../context/SessionContext';
import Clock from './Clock';

const PresencePanel: React.FC<{ councilMembers: UserProfile[], presentMembers: string[], votes?: Votes }> = ({ councilMembers, presentMembers, votes = {} }) => {
    const { session } = useSession();
    
    const presentCount = presentMembers.length;
    const totalMembers = councilMembers.length;
    const absentCount = totalMembers - presentCount;

    const simVotes = Object.values(votes).filter(v => v === VoteOption.SIM).length;
    const naoVotes = Object.values(votes).filter(v => v === VoteOption.NAO).length;
    const absVotes = Object.values(votes).filter(v => v === VoteOption.ABS).length;

    const president = useMemo(() => councilMembers.find(m => m.boardRole === 'Presidente'), [councilMembers]);
    
    const otherMembers = useMemo(() => {
        const boardOrder: Record<string, number> = {
            'Vice-Presidente': 1,
            '1º Secretário': 2,
            '2º Secretário': 3,
        };
        return councilMembers
            .filter(m => m.uid !== president?.uid)
            .sort((a, b) => {
                const roleA = a.boardRole ? boardOrder[a.boardRole] : 99;
                const roleB = b.boardRole ? boardOrder[b.boardRole] : 99;
                if (roleA !== roleB) {
                    return roleA - roleB;
                }
                return a.name.localeCompare(b.name);
            });
    }, [councilMembers, president]);

    const getRoleAbbreviation = (role: UserProfile['boardRole']) => {
        switch (role) {
            case 'Vice-Presidente': return 'VICE';
            case '1º Secretário': return '1ºSEC';
            case '2º Secretário': return '2ºSEC';
            default: return null;
        }
    }

    const MemberItem: React.FC<{member: UserProfile}> = ({ member }) => {
        const isPresent = presentMembers.includes(member.uid);
        const roleAbbr = getRoleAbbreviation(member.boardRole);
        return (
            <div className="flex items-center gap-3 text-2xl">
                <div className={`w-5 h-5 rounded-full border-2 ${isPresent ? 'bg-green-500 border-green-300' : 'bg-red-600 border-red-400'}`}></div>
                {roleAbbr && <span className="font-bold text-yellow-400 w-20">{roleAbbr}</span>}
                <span className={`font-semibold flex-1 ${!roleAbbr ? 'ml-28' : ''}`}>{member.name}</span>
                <span className="font-bold">{member.party}</span>
            </div>
        )
    };

    return (
        <div className="w-full h-full bg-black text-white font-sans flex flex-col antialiased">
            <header className="bg-blue-800 text-center py-2 shadow-lg">
                <h1 className="text-4xl font-extrabold tracking-wider">CÂMARA MUNICIPAL DE ALHANDRA</h1>
            </header>

            <main className="flex-grow flex p-4 gap-4 overflow-hidden">
                <div className="flex-grow flex flex-col">
                    {president && (
                        <div className="flex items-center gap-4 text-3xl font-bold border-b-2 border-yellow-400 pb-2">
                           <span className="text-yellow-400">PRESIDENTE DA CÂMARA:</span>
                           <div className={`w-6 h-6 rounded-full border-2 ${presentMembers.includes(president.uid) ? 'bg-green-500 border-green-300' : 'bg-red-600 border-red-400'}`}></div>
                           <span className="flex-1">{president.name}</span>
                           <span>{president.party}</span>
                        </div>
                    )}
                    <div className="flex-grow grid grid-cols-2 gap-x-12 gap-y-3 mt-3 pr-4">
                        {otherMembers.map(member => <MemberItem key={member.uid} member={member} />)}
                    </div>
                </div>

                <aside className="w-[300px] flex-shrink-0 flex flex-col justify-between text-center font-bold">
                    <div className="space-y-2">
                        <div className="bg-gray-800 border-2 border-gray-500 p-2 flex justify-between items-center text-xl">
                            <span>PARLAMENTARES</span>
                            <span className="bg-white text-black px-2 rounded">{totalMembers.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="bg-gray-800 border-2 border-gray-500 p-2 flex justify-between items-center text-xl text-orange-400">
                            <span>AUSENTES</span>
                            <span className="bg-white text-black px-2 rounded">{absentCount.toString().padStart(2, '0')}</span>
                        </div>
                        <div className="bg-gray-800 border-2 border-gray-500 p-2 flex justify-between items-center text-xl text-blue-400">
                            <span>PRESENTES</span>
                            <span className="bg-white text-black px-2 rounded">{presentCount.toString().padStart(2, '0')}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-green-700 border-2 border-green-400 p-2 aspect-square flex flex-col justify-center items-center">
                            <span className="text-5xl">{simVotes.toString().padStart(2, '0')}</span>
                            <span className="text-xl">SIM</span>
                        </div>
                        <div className="bg-red-700 border-2 border-red-400 p-2 aspect-square flex flex-col justify-center items-center">
                           <span className="text-5xl">{naoVotes.toString().padStart(2, '0')}</span>
                           <span className="text-xl">NÃO</span>
                        </div>
                        <div className="bg-yellow-600 border-2 border-yellow-400 p-2 aspect-square flex flex-col justify-center items-center">
                           <span className="text-5xl">{absVotes.toString().padStart(2, '0')}</span>
                           <span className="text-xl">ABS</span>
                        </div>
                    </div>
                    
                    <div className="bg-gray-800 border-2 border-gray-500 p-2">
                        <Clock className="text-5xl" />
                        <p className="text-2xl">{new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                </aside>
            </main>
            
            <footer className="text-center py-1 border-t-4 border-yellow-400">
                <p className="text-xl font-semibold tracking-wide">808ª SESSÃO ORDINÁRIA DO 2º PERÍODO LEGISLATIVO DE 2025</p>
            </footer>
        </div>
    );
};

export default PresencePanel;