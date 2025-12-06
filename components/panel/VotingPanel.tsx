
import React from 'react';
import { useSession } from '../../context/SessionContext';
import { VoteOption, UserProfile } from '../../types';
import { CheckCircle, XCircle, MinusCircle } from 'lucide-react';
import Clock from './Clock';

const VoteIcon: React.FC<{ vote: VoteOption | undefined }> = ({ vote }) => {
    switch (vote) {
        case VoteOption.SIM:
            return <CheckCircle className="w-10 h-10 text-green-400" />;
        case VoteOption.NAO:
            return <XCircle className="w-10 h-10 text-red-400" />;
        case VoteOption.ABS:
            return <MinusCircle className="w-10 h-10 text-yellow-400" />;
        default:
            return <div className="w-10 h-10 border-2 border-dashed border-sapv-gray-dark rounded-full" />;
    }
};

const MemberVoteCard: React.FC<{ member: UserProfile; vote: VoteOption | undefined; isPresent: boolean }> = ({ member, vote, isPresent }) => {
    let cardStyle = 'bg-sapv-blue-light border-sapv-gray-dark';
    let textStyle = 'text-sapv-gray-light';

    if (!isPresent) {
        cardStyle = 'bg-gray-800 border-gray-700 opacity-50';
        textStyle = 'text-gray-500 line-through';
    } else if (vote) {
        switch (vote) {
            case VoteOption.SIM: cardStyle = 'bg-green-900 border-green-500 scale-105 shadow-lg'; break;
            case VoteOption.NAO: cardStyle = 'bg-red-900 border-red-500 scale-105 shadow-lg'; break;
            case VoteOption.ABS: cardStyle = 'bg-yellow-900 border-yellow-500 scale-105 shadow-lg'; break;
        }
    }

    return (
        <div className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-all duration-300 ${cardStyle}`}>
            <img src={member.photoUrl} alt={member.name} className="w-20 h-20 rounded-full mb-3" />
            <p className={`font-bold text-center text-lg leading-tight ${textStyle}`}>{member.name}</p>
            <p className={`text-sm ${isPresent ? 'text-sapv-gray' : 'text-gray-600'}`}>{member.party}</p>
            <div className="mt-4">
                {isPresent ? <VoteIcon vote={vote} /> : <p className="font-bold text-red-500">AUSENTE</p>}
            </div>
        </div>
    );
};

const VotingPanel: React.FC = () => {
    const { session, councilMembers } = useSession();
    const { currentProject, votes, votingResult, presence } = session;

    if (!currentProject) {
        return (
            <div className="w-full h-full flex items-center justify-center text-white text-4xl bg-black">
                Aguardando matéria para votação...
            </div>
        );
    }
    
    const simCount = Object.values(votes).filter(v => v === VoteOption.SIM).length;
    const naoCount = Object.values(votes).filter(v => v === VoteOption.NAO).length;
    const absCount = Object.values(votes).filter(v => v === VoteOption.ABS).length;
    const presentCount = Object.values(presence).filter(p => p).length;
    const notVotedCount = presentCount - (simCount + naoCount + absCount);

    return (
        <div className="w-full h-full flex flex-col text-white bg-gradient-to-b from-blue-900 via-sapv-blue-dark to-black p-6">
            <header className="text-center mb-4">
                <h1 className="text-3xl font-bold tracking-wider">{currentProject.title}</h1>
                <p className="text-lg text-sapv-gray">{currentProject.description}</p>
            </header>
            
            <main className="flex-1 grid grid-cols-4 lg:grid-cols-6 gap-4 overflow-y-auto pr-2">
                {councilMembers.map(member => (
                    <MemberVoteCard
                        key={member.uid}
                        member={member}
                        vote={votes[member.uid]}
                        isPresent={!!presence[member.uid]}
                    />
                ))}
            </main>

            <footer className="mt-4 pt-4 border-t border-sapv-gray-dark flex justify-between items-center">
                <div className="flex gap-8">
                    <div className="text-center">
                        <p className="text-xl font-semibold text-green-400">SIM</p>
                        <p className="text-6xl font-bold">{simCount}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-semibold text-red-400">NÃO</p>
                        <p className="text-6xl font-bold">{naoCount}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-semibold text-yellow-400">ABST.</p>
                        <p className="text-6xl font-bold">{absCount}</p>
                    </div>
                     <div className="text-center">
                        <p className="text-xl font-semibold text-sapv-gray">N/V</p>
                        <p className="text-6xl font-bold">{notVotedCount}</p>
                    </div>
                </div>

                <div className="text-center">
                    <h2 className={`text-5xl font-extrabold animate-pulse ${votingResult ? (votingResult.includes('APROVADO') ? 'text-green-400' : 'text-red-400') : 'text-sapv-highlight'}`}>
                        {votingResult || (session.votingOpen ? 'VOTAÇÃO ABERTA' : 'VOTAÇÃO ENCERRADA')}
                    </h2>
                </div>
                
                <div className="text-right">
                    <Clock className="text-5xl" />
                </div>
            </footer>
        </div>
    );
};

export default React.memo(VotingPanel);
