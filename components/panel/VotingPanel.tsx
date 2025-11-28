import React, { useState, useEffect } from 'react';
import { UserProfile, VoteOption } from '../../types';
import { useSession } from '../../context/SessionContext';
import Clock from './Clock';

const getVoteStyle = (vote?: VoteOption) => {
    switch (vote) {
        case VoteOption.SIM: return 'text-green-500';
        case VoteOption.NAO: return 'text-red-500';
        case VoteOption.ABS: return 'text-yellow-400';
        default: return 'text-gray-500';
    }
};
const getVoteLabel = (vote?: VoteOption) => vote || '...';


const MemberRow: React.FC<{ member: UserProfile, vote?: VoteOption, role?: string }> = ({ member, vote, role }) => (
    <div className="flex items-center text-3xl font-bold whitespace-nowrap">
        {role ? 
            <span className="text-yellow-400 w-28">{role}</span>
            : <span className="w-28"></span>}
        <span className={`w-28 text-center font-black ${getVoteStyle(vote)}`}>{getVoteLabel(vote)}</span>
        <span className="text-red-400 flex-1 truncate pr-4" title={member.name}>{member.name}</span>
        <span className="text-red-400 w-24 text-left">{member.party}</span>
    </div>
);

const VotingPanel: React.FC = () => {
    const { session, councilMembers, legislatureConfig } = useSession();
    const { votes, presence, currentProject } = session;

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
         <div className="w-full h-full flex flex-col text-white bg-black font-sans uppercase">
            <header className="bg-blue-800 py-3 text-center">
                <h1 className="text-5xl font-extrabold tracking-wider">VOTAÇÃO - {currentProject?.title || 'PAUTA'}</h1>
            </header>

            <div className="flex-grow flex p-4 gap-4 overflow-hidden">
                <div className="w-3/4 flex flex-col">
                    {president && (
                         <div className="mb-2 pb-2 border-b-2 border-yellow-400">
                           <div className="flex items-center text-3xl font-bold whitespace-nowrap">
                               <span className="text-yellow-400 w-72">PRESIDENTE DA CÂMARA:</span>
                               <span className={`w-28 text-center font-black ${getVoteStyle(votes[president.uid])}`}>{getVoteLabel(votes[president.uid])}</span>
                               <span className="text-red-400 flex-1 truncate pr-4">{president.name}</span>
                               <span className="text-red-400 w-24 text-left">{president.party}</span>
                           </div>
                        </div>
                    )}
                    <div className="flex-grow grid grid-cols-2 gap-x-12 gap-y-3 pt-2">
                        <div className="flex flex-col gap-3">
                            {leftColumnMembers.map(member => (
                                <MemberRow 
                                    key={member.uid}
                                    member={member}
                                    vote={votes[member.uid]}
                                    role={getRoleLabel(member.boardRole)}
                                />
                            ))}
                        </div>
                         <div className="flex flex-col gap-3">
                             {rightColumnMembers.map(member => (
                                <MemberRow 
                                    key={member.uid}
                                    member={member}
                                    vote={votes[member.uid]}
                                    role={getRoleLabel(member.boardRole)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <aside className="w-1/4 flex flex-col justify-between border-l-2 border-gray-700 pl-4">
                    <div className="space-y-2 text-2xl font-extrabold">
                        <div className="flex justify-between items-center border-b border-gray-700 pb-1">
                            <span>PARLAMENTARES</span>
                            <span>{String(totalMembers).padStart(2, '0')}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-700 pb-1 text-orange-500">
                             <span>AUSENTES</span>
                            <span>{String(absentCount).padStart(2, '0')}</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-gray-700 pb-1 text-cyan-400">
                             <span>PRESENTES</span>
                            <span>{String(presentCount).padStart(2, '0')}</span>
                        </div>
                    </div>
                    <div className="flex justify-around items-center my-6">
                        <div className="text-center">
                            <p className="text-6xl font-black text-green-500">{String(simVotes).padStart(2, '0')}</p>
                            <div className="border-2 border-gray-700 px-6 py-1 mt-1">
                                <p className="text-2xl font-extrabold text-green-500">SIM</p>
                            </div>
                        </div>
                         <div className="text-center">
                            <p className="text-6xl font-black text-red-500">{String(naoVotes).padStart(2, '0')}</p>
                             <div className="border-2 border-gray-700 px-6 py-1 mt-1">
                                <p className="text-2xl font-extrabold text-red-500">NÃO</p>
                            </div>
                        </div>
                         <div className="text-center">
                            <p className="text-6xl font-black text-yellow-400">{String(absVotes).padStart(2, '0')}</p>
                             <div className="border-2 border-gray-700 px-4 py-1 mt-1">
                                <p className="text-2xl font-extrabold text-yellow-400">ABS</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-center font-mono">
                         <Clock className="text-5xl font-bold" />
                         <p className="text-2xl mt-1">{date.toLocaleDateString('pt-BR')}</p>
                    </div>
                </aside>
            </div>
            {session.votingResult && (
                <footer className="border-t-2 border-yellow-400 py-2 text-center">
                    <p className={`text-4xl font-bold ${session.votingResult.includes('APROVADO') ? 'text-green-500' : 'text-red-500'}`}>{session.votingResult}</p>
                </footer>
            )}
        </div>
    );
};

export default VotingPanel;
