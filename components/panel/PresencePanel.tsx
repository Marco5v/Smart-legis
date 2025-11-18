import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole, Votes, VoteOption } from '../../types';

interface PresencePanelProps {
    councilMembers: UserProfile[];
    presentMembers: string[];
    votes?: Votes;
}

const MemberItem: React.FC<{ member: UserProfile, isPresent: boolean }> = React.memo(({ member, isPresent }) => {
    // Círculo com contorno vermelho para ausente (fundo preto), círculo verde sólido para presente
    const presenceCircle = <div className={`w-6 h-6 rounded-full border-2 ${isPresent ? 'bg-green-500 border-green-300' : 'border-red-500 bg-black'}`}></div>;
    
    return (
        <div className="flex items-center text-2xl">
            {presenceCircle}
            <span className="font-bold text-yellow-400 w-24 ml-3 text-left">{member.boardRole || ''}</span>
            <span className="font-semibold text-red-400 flex-1 text-left">{member.name.toUpperCase()}</span>
            <span className="font-semibold text-red-400">{member.party}</span>
        </div>
    );
});


const PresencePanel: React.FC<PresencePanelProps> = ({ councilMembers, presentMembers, votes = {} }) => {
    
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const president = councilMembers.find(m => m.role === UserRole.PRESIDENTE);
    const otherMembers = councilMembers
        .filter(m => m.role !== UserRole.PRESIDENTE)
        .sort((a, b) => {
            const roleOrder: { [key: string]: number } = {'VICE': 1, '1ºSEC': 2, '2ºSEC': 3};
            const roleA = a.boardRole ? roleOrder[a.boardRole] || 99 : 99;
            const roleB = b.boardRole ? roleOrder[b.boardRole] || 99 : 99;
            if (roleA !== roleB) return roleA - roleB;
            return a.name.localeCompare(b.name);
        });
    
    const presentCount = presentMembers.length;
    const totalMembers = councilMembers.length;
    const absentCount = totalMembers - presentCount;

    const midPoint = Math.ceil(otherMembers.length / 2);
    const firstColumn = otherMembers.slice(0, midPoint);
    const secondColumn = otherMembers.slice(midPoint);
    
    const simVotes = Object.values(votes).filter(v => v === VoteOption.SIM).length;
    const naoVotes = Object.values(votes).filter(v => v === VoteOption.NAO).length;
    const absVotes = Object.values(votes).filter(v => v === VoteOption.ABS).length;

    return (
        <div className="w-full h-full bg-black text-white p-4 flex flex-col font-sans">
            <header className="w-full bg-blue-800 text-center py-2 border-b-2 border-yellow-400">
                <h1 className="text-4xl font-black tracking-wider">CÂMARA MUNICIPAL DE ALHANDRA</h1>
            </header>

            <main className="flex-grow flex gap-4 py-4 px-2">
                <div className="w-4/5 flex flex-col">
                    {president && (
                         <div className="flex items-center text-2xl border-b border-yellow-400 pb-3 mb-3">
                            <span className="font-bold text-yellow-400">PRESIDENTE DA CÂMARA:</span>
                            <div className={`w-6 h-6 rounded-full border-2 ${presentMembers.includes(president.uid) ? 'bg-green-500 border-green-300' : 'border-red-500 bg-black'} mx-3`}></div>
                            <span className="font-semibold text-red-400">{president.name.toUpperCase()}</span>
                            <span className="font-semibold text-red-400 ml-4">{president.party}</span>
                        </div>
                    )}

                    <div className="flex-grow grid grid-cols-2 gap-x-12 gap-y-3 content-start">
                        <div className="space-y-3">
                            {firstColumn.map(m => <MemberItem key={m.uid} member={m} isPresent={presentMembers.includes(m.uid)} />)}
                        </div>
                         <div className="space-y-3">
                            {secondColumn.map(m => <MemberItem key={m.uid} member={m} isPresent={presentMembers.includes(m.uid)} />)}
                        </div>
                    </div>
                </div>

                <aside className="w-1/5 h-full flex flex-col justify-between items-center space-y-4 border-l-2 border-yellow-400 pl-4">
                    <div className="w-full space-y-2 text-xl font-bold">
                        <div className="flex justify-between items-center p-1">
                            <span>PARLAMENTARES</span>
                            <span className="font-mono text-2xl border border-gray-500 px-2">{totalMembers.toString().padStart(2, '0')}</span>
                        </div>
                         <div className="flex justify-between items-center p-1 text-orange-400">
                            <span>AUSENTES</span>
                            <span className="font-mono text-2xl border border-gray-500 px-2">{absentCount.toString().padStart(2, '0')}</span>
                        </div>
                         <div className="flex justify-between items-center p-1 text-cyan-400">
                            <span>PRESENTES</span>
                            <span className="font-mono text-2xl border border-gray-500 px-2">{presentCount.toString().padStart(2, '0')}</span>
                        </div>
                    </div>

                    <div className="w-full grid grid-cols-3 gap-2 text-center">
                        <div className="border border-gray-600 p-1">
                            <p className="text-5xl font-black text-green-500">{simVotes}</p>
                            <p className="font-semibold bg-green-500 text-black text-xl">SIM</p>
                        </div>
                        <div className="border border-gray-600 p-1">
                            <p className="text-5xl font-black text-red-500">{naoVotes}</p>
                            <p className="font-semibold bg-red-500 text-black text-xl">NÃO</p>
                        </div>
                        <div className="border border-gray-600 p-1">
                            <p className="text-5xl font-black text-yellow-400">{absVotes}</p>
                            <p className="font-semibold bg-yellow-400 text-black text-xl">ABS</p>
                        </div>
                    </div>

                    <div className="w-full text-center text-2xl font-mono text-gray-400 border border-gray-600 py-1">
                        <div>{time.toLocaleTimeString('pt-BR')}</div>
                        <div className="text-lg">{time.toLocaleDateString('pt-BR')}</div>
                    </div>
                </aside>
            </main>

            <footer className="w-full bg-gray-900 text-yellow-300 py-2 flex justify-between items-center px-6 border-t-2 border-gray-700">
                 <h2 className="text-xl font-bold">808ª SESSÃO ORDINÁRIA DO 2º PERÍODO LEGISLATIVO DE 2025</h2>
                 <span className="text-lg font-mono">{new Date().toLocaleDateString('pt-BR')}</span>
            </footer>
        </div>
    );
};

export default PresencePanel;