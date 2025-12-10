import React, { useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import CouncilMemberCard from '../components/CouncilMemberCard';
import SessionTimer from '../components/SessionTimer';
import { Users, Clock } from 'lucide-react';

const PublicPanelPage: React.FC = () => {
    const { session, councilMembers, legislatureConfig } = useSession();

    // Determina os membros ativos para a legislatura atual
    const activeMembers = useMemo(() => {
        const activeMemberIds = new Set(session.legislatureMembers);
        return councilMembers.filter(m => activeMemberIds.has(m.uid));
    }, [session.legislatureMembers, councilMembers]);
    
    const presentCount = Object.values(session.presence).filter(p => p).length;

    if (session.status === 'inactive') {
        return (
            <div className="min-h-screen bg-sapv-blue-dark text-sapv-gray-light flex flex-col items-center justify-center p-8">
                <div className="text-center">
                    <Users size={64} className="mx-auto text-sapv-gray mb-6" />
                    <h1 className="text-4xl font-bold mb-2">Painel Eletrônico</h1>
                    <h2 className="text-2xl text-sapv-gray mb-8">Câmara Municipal de {session.cityName}</h2>
                    <p className="text-xl animate-pulse text-sapv-highlight">Aguardando início da sessão</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-sapv-blue-dark text-sapv-gray-light p-4 sm:p-6 flex flex-col font-sans">
            {/* Cabeçalho */}
            <header className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-sapv-blue-light p-4 rounded-lg border border-sapv-gray-dark shadow-lg">
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                    <h1 className="text-2xl font-bold">Câmara Municipal de {session.cityName}</h1>
                    <p className="text-sm text-sapv-gray uppercase tracking-wider">Sessão {session.sessionType}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Clock size={32} className="text-sapv-gray" />
                    <SessionTimer 
                        startTime={session.startTime}
                        isPaused={session.status === 'paused'}
                        pauseTime={session.pauseTime}
                        totalPausedDuration={session.totalPausedDuration}
                    />
                </div>
            </header>

            {/* Grid de Vereadores */}
            <main className="flex-grow">
                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                    {activeMembers.map(member => (
                        <CouncilMemberCard
                            key={member.uid}
                            member={member}
                            isPresent={!!session.presence[member.uid]}
                            isConfirmedAbsent={!!session.confirmedAbsence[member.uid]}
                        />
                    ))}
                </div>
            </main>

            {/* Rodapé */}
            <footer className="mt-6 bg-sapv-blue-light p-3 rounded-lg border border-sapv-gray-dark shadow-lg flex justify-between items-center text-sm">
                <div className="font-semibold uppercase tracking-wider">
                    Fase: <span className="text-sapv-highlight">{session.phase}</span>
                </div>
                <div className="font-semibold">
                    Presença: <span className="text-sapv-highlight">{presentCount} / {legislatureConfig.totalMembers}</span>
                </div>
            </footer>
        </div>
    );
};

export default PublicPanelPage;
