
import React from 'react';
import { useSession } from '../../context/SessionContext';
import Clock from './Clock';
import CouncilMemberCard from '../CouncilMemberCard';
import SessionTimer from '../SessionTimer';
import { SessionStatus } from '../../types';

const PresencePanel: React.FC = () => {
    const { session, councilMembers, legislatureConfig } = useSession();
    const presentMembers = Object.values(session.presence).filter(p => p).length;
    
    const membersInLegislature = councilMembers.filter(m => session.legislatureMembers.includes(m.uid) || session.legislatureMembers.length === 0);

    return (
        <div className="w-full h-full flex flex-col text-white bg-gradient-to-br from-gray-900 via-sapv-blue-dark to-black p-6">
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-4xl font-bold">SESSÃO PLENÁRIA</h1>
                    <p className="text-lg text-sapv-gray">{session.cityName}</p>
                </div>
                <div className="text-right">
                    <Clock className="text-5xl" />
                    <p className="text-lg text-sapv-gray">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
            </header>

            <main className="flex-1 grid grid-cols-4 lg:grid-cols-6 gap-3 overflow-y-auto pr-2">
                {membersInLegislature.map(member => (
                    <CouncilMemberCard 
                        key={member.uid} 
                        member={member} 
                        isPresent={!!session.presence[member.uid]}
                        isConfirmedAbsent={!!session.confirmedAbsence[member.uid]}
                    />
                ))}
            </main>

            <footer className="mt-4 pt-4 border-t border-sapv-gray-dark flex justify-between items-center">
                <div className="text-center">
                    <p className="text-lg font-semibold text-sapv-gray">PRESENÇA</p>
                    <p className="text-4xl font-bold">
                        <span className="text-sapv-highlight">{presentMembers}</span> / {legislatureConfig.totalMembers}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-semibold text-sapv-gray">QUÓRUM</p>
                    <p className={`text-4xl font-bold ${presentMembers >= legislatureConfig.quorumToOpen ? 'text-green-400' : 'text-red-400'}`}>
                        {presentMembers >= legislatureConfig.quorumToOpen ? 'ATINGIDO' : 'NÃO ATINGIDO'}
                    </p>
                </div>
                 <div className="text-center">
                    <p className="text-lg font-semibold text-sapv-gray">TEMPO DE SESSÃO</p>
                    <SessionTimer 
                        startTime={session.startTime}
                        isPaused={session.status === SessionStatus.PAUSED}
                        pauseTime={session.pauseTime}
                        totalPausedDuration={session.totalPausedDuration}
                    />
                </div>
            </footer>
        </div>
    );
};

export default React.memo(PresencePanel);
