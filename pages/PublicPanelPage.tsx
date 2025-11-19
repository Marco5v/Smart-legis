import React, { useState, useEffect, useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import CouncilMemberCard from '../components/CouncilMemberCard';
import SessionTimer from '../components/SessionTimer';

const PublicPanelPage: React.FC = () => {
    const { session, councilMembers } = useSession();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timerId);
    }, []);

    const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = currentTime.toLocaleDateString('pt-BR', dateOptions);
    const formattedTime = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const activeMembers = useMemo(() => 
        councilMembers.filter(m => session.legislatureMembers.includes(m.uid)),
        [councilMembers, session.legislatureMembers]
    );

    const presentCount = Object.values(session.presence).filter(p => p).length;
    const absentCount = session.legislatureMembers.length - presentCount;
    
    if (session.status === 'inactive') {
        return (
            <div className="w-screen h-screen bg-white flex flex-col items-center justify-center text-gray-500 p-8">
                <img src="https://picsum.photos/seed/brasao/120" alt="Brasão do Município" className="h-32 mb-8" />
                <h1 className="text-4xl font-bold text-black">Painel Eletrônico</h1>
                <p className="text-2xl mt-2">Aguardando início da sessão pelo controlador.</p>
            </div>
        );
    }

    return (
        <div className="w-screen h-screen bg-white text-black flex flex-col p-4 md:p-6 font-sans">
            {/* Cabeçalho */}
            <header className="flex justify-between items-center border-b-2 border-gray-200 pb-3">
                <div className="flex items-center gap-4">
                    <img src="https://picsum.photos/seed/brasao/60" alt="Brasão" className="h-12 md:h-16" />
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold">Câmara Municipal de {session.cityName}</h1>
                        <p className="text-md md:text-lg text-gray-600">{session.sessionType}</p>
                    </div>
                </div>
                <div className="text-center">
                    <p className="text-lg md:text-2xl font-semibold">SESSÃO</p>
                    <SessionTimer 
                        startTime={session.startTime} 
                        isPaused={session.status === 'paused'}
                        pauseTime={session.pauseTime}
                        totalPausedDuration={session.totalPausedDuration}
                    />
                </div>
                <div className="text-right">
                    <p className="text-lg md:text-xl font-semibold">{formattedDate}</p>
                    <p className="text-2xl md:text-4xl font-mono">{formattedTime}</p>
                </div>
            </header>

            {/* Grid de Parlamentares */}
            <main className="flex-grow my-4 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {activeMembers.map(member => (
                        <CouncilMemberCard 
                            key={member.uid} 
                            member={member} 
                            isPresent={session.presence[member.uid] || false}
                        />
                    ))}
                </div>
            </main>

            {/* Rodapé */}
            <footer className="border-t-2 border-gray-200 pt-3 flex justify-between items-center text-xl font-bold">
                <div>
                    <span className="text-green-600">Presentes: {presentCount}</span>
                    <span className="mx-4">|</span>
                    <span className="text-red-600">Ausentes: {absentCount}</span>
                </div>
                <div className="text-gray-700">
                    Sessão {session.sessionType} iniciada em {session.startTime ? new Date(session.startTime).toLocaleTimeString('pt-BR') : ''}
                </div>
            </footer>
        </div>
    );
};

export default PublicPanelPage;